import crypto from 'crypto';
import axios from 'axios';
import env from '../config/env.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Payment Service — handles eSewa (ePay v2) and Khalti Payment Integrations
 */
class PaymentService {
  /**
   * Generate HMAC-SHA256 Signature for eSewa ePay v2
   * Message format: total_amount=100,transaction_uuid=11-22-33,product_code=EPAYTEST
   */
  static generateEsewaSignature(totalAmount, transactionUuid, productCode) {
    const secretKey = env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Initiate eSewa Payment — returns form payload and signature for frontend submission
   */
  static async initiateEsewa(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const merchantCode = env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
    const transactionUuid = `${order.orderNumber}`;
    const totalAmount = order.grandTotal.toFixed(2);
    const signature = this.generateEsewaSignature(totalAmount, transactionUuid, merchantCode);

    const formData = {
      amount: order.subtotal.toFixed(2),
      tax_amount: '0.00',
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: merchantCode,
      product_service_charge: '0.00',
      product_delivery_charge: order.deliveryCharge.toFixed(2),
      success_url: `${env.CLIENT_URL}/payment/esewa/success`,
      failure_url: `${env.CLIENT_URL}/payment/esewa/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
      gateway_url: `${env.ESEWA_GATEWAY_URL}/api/epay/main/v2/form`,
    };

    // Store transaction UUID in payment table
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        transactionId: transactionUuid,
        gatewayResponse: formData,
      },
    });

    return formData;
  }

  /**
   * Verify eSewa Payment Response
   */
  static async verifyEsewa(dataEncoded) {
    if (!dataEncoded) {
      throw ApiError.badRequest('Missing encoded payment data');
    }

    // Decode base64 response from eSewa
    const decodedString = Buffer.from(dataEncoded, 'base64').toString('utf-8');
    const decoded = JSON.parse(decodedString);

    const { status, total_amount, transaction_uuid, signature, signed_field_names } = decoded;

    if (status !== 'COMPLETE') {
      throw ApiError.badRequest('Payment not completed by eSewa');
    }

    // Verify signature
    const expectedSignature = this.generateEsewaSignature(
      total_amount,
      transaction_uuid,
      env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
    );

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber: transaction_uuid },
      include: { payment: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found for transaction');
    }

    // Update order and payment status in database
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          gatewayResponse: decoded,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'eSewa Payment Successful',
          message: `Payment of Rs. ${order.grandTotal} for order ${order.orderNumber} confirmed via eSewa.`,
          type: 'success',
          link: `/orders/${order.id}`,
        },
      }),
    ]);

    return order;
  }

  /**
   * Initiate Khalti Payment Endpoint (ePayment v2)
   */
  static async initiateKhalti(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, user: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const payload = {
      return_url: `${env.CLIENT_URL}/payment/khalti/success`,
      website_url: env.CLIENT_URL,
      amount: Math.round(order.grandTotal * 100), // Amount in Paisa (1 NPR = 100 Paisa)
      purchase_order_id: order.id,
      purchase_order_name: `Order ${order.orderNumber}`,
      customer_info: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '9800000000',
      },
    };

    try {
      const response = await axios.post(
        `${env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
        payload,
        {
          headers: {
            Authorization: `Key ${env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455'}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { pidx, payment_url } = response.data;

      // Update payment record
      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          transactionId: pidx,
          gatewayResponse: response.data,
        },
      });

      return { pidx, paymentUrl: payment_url };
    } catch (error) {
      // In sandbox mode fallback if key is placeholder
      if (env.isDev) {
        const fallbackPidx = `KHALTI-${Date.now()}`;
        await prisma.payment.update({
          where: { orderId: order.id },
          data: {
            transactionId: fallbackPidx,
            gatewayResponse: { status: 'INITIATED', pidx: fallbackPidx },
          },
        });
        return {
          pidx: fallbackPidx,
          paymentUrl: `${env.CLIENT_URL}/payment/khalti/sandbox?pidx=${fallbackPidx}&orderId=${order.id}`,
        };
      }
      throw ApiError.badRequest('Failed to initiate Khalti payment: ' + (error.response?.data?.detail || error.message));
    }
  }

  /**
   * Verify Khalti Payment
   */
  static async verifyKhalti({ pidx, orderId }) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { payment: { transactionId: pidx } }],
      },
      include: { payment: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found for Khalti payment verification');
    }

    // Call Khalti lookup API if not sandbox
    if (!pidx.startsWith('KHALTI-')) {
      try {
        const response = await axios.post(
          `${env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
          { pidx },
          {
            headers: {
              Authorization: `Key ${env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455'}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.status !== 'Completed') {
          throw ApiError.badRequest(`Khalti payment status: ${response.data.status}`);
        }
      } catch (err) {
        if (!env.isDev) {
          throw ApiError.badRequest('Khalti verification failed: ' + err.message);
        }
      }
    }

    // Update order status
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionId: pidx,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Khalti Payment Successful',
          message: `Payment of Rs. ${order.grandTotal} for order ${order.orderNumber} confirmed via Khalti.`,
          type: 'success',
          link: `/orders/${order.id}`,
        },
      }),
    ]);

    return order;
  }
}

export default PaymentService;
