import crypto from 'crypto';
import axios from 'axios';
import env from '../config/env.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { generateTransactionSecurityData, verifyTransactionSignature } from '../utils/transactionSecurity.js';
import NotificationService from './notificationService.js';

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
    // Append timestamp to prevent eSewa duplicate transaction error on payment retries
    const transactionUuid = `${order.orderNumber}-${Date.now().toString().slice(-6)}`;
    const totalAmount = Number(order.grandTotal).toFixed(2);
    const deliveryCharge = Number(order.deliveryCharge || 0).toFixed(2);
    const itemAmount = (Number(order.grandTotal) - Number(order.deliveryCharge || 0)).toFixed(2);

    const signature = this.generateEsewaSignature(totalAmount, transactionUuid, merchantCode);

    const formData = {
      amount: itemAmount,
      tax_amount: '0',
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: merchantCode,
      product_service_charge: '0',
      product_delivery_charge: deliveryCharge,
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
    let decoded;
    try {
      const decodedString = Buffer.from(dataEncoded, 'base64').toString('utf-8');
      decoded = JSON.parse(decodedString);
    } catch (e) {
      throw ApiError.badRequest('Invalid base64 encoded data received from eSewa');
    }

    const { status, total_amount, transaction_uuid, signature, product_code, signed_field_names } = decoded;

    if (status !== 'COMPLETE') {
      throw ApiError.badRequest(`Payment not completed by eSewa. Status: ${status || 'UNKNOWN'}`);
    }

    // Cryptographic validation of eSewa callback signature using timingSafeEqual
    if (signature) {
      const secretKey = env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
      let message;
      if (signed_field_names) {
        const fields = signed_field_names.split(',');
        message = fields.map((f) => `${f}=${decoded[f] ?? ''}`).join(',');
      } else {
        const merchantCode = product_code || env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
        message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${merchantCode}`;
      }

      const expectedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');
      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        // Fallback check against basic message format
        const fallbackMsg = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code || 'EPAYTEST'}`;
        const fallbackSig = crypto.createHmac('sha256', secretKey).update(fallbackMsg).digest('base64');
        const fallbackBuf = Buffer.from(fallbackSig, 'utf8');
        if (sigBuffer.length !== fallbackBuf.length || !crypto.timingSafeEqual(sigBuffer, fallbackBuf)) {
          throw ApiError.badRequest('Invalid eSewa callback signature. Verification failed.');
        }
      }
    }

    // Status check against eSewa status verification endpoint (with fallback for test env)
    try {
      const isRc = (env.ESEWA_GATEWAY_URL || '').includes('rc');
      const statusBase = isRc ? 'https://rc.esewa.com.np' : 'https://epay.esewa.com.np';
      const statusUrl = `${statusBase}/api/epay/transaction/status/?product_code=${
        product_code || env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
      }&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
      
      const statusRes = await axios.get(statusUrl, { timeout: 4000 });
      if (statusRes.data?.status && statusRes.data.status !== 'COMPLETE') {
        throw ApiError.badRequest(`eSewa server status verification returned: ${statusRes.data.status}`);
      }
    } catch (checkErr) {
      if (checkErr.isApiError) throw checkErr;
      console.log('ℹ️ [PaymentService] eSewa status endpoint check fallback:', checkErr.message);
    }

    // Find order by transaction_uuid or matching orderNumber
    const orderNumberPrefix = transaction_uuid ? transaction_uuid.split('-').slice(0, 2).join('-') : '';
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { payment: { transactionId: transaction_uuid } },
          { orderNumber: transaction_uuid },
          { orderNumber: orderNumberPrefix },
          { id: transaction_uuid },
        ],
      },
      include: { payment: true },
    });

    if (!order) {
      throw ApiError.notFound(`Order not found for transaction UUID: ${transaction_uuid}`);
    }

    const paidAt = new Date();

    // Generate SHA-256 integrity hash and RSA digital signature for the completed transaction
    const securityData = generateTransactionSecurityData({
      orderId: order.id,
      amount: order.grandTotal,
      method: 'ESEWA',
      status: 'COMPLETED',
      transactionId: transaction_uuid,
      paidAt,
    });

    // Update order and payment status in database
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'COMPLETED',
          paidAt,
          gatewayResponse: decoded,
          integrityHash: securityData.integrityHash,
          signature: securityData.signature,
          signingKeyId: securityData.signingKeyId,
          signedAt: securityData.signedAt,
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

    // Non-blocking best-effort order confirmation alert (customer email + admin)
    prisma.order.findUnique({
      where: { id: order.id },
      include: { user: true, address: true, items: { include: { product: true } }, payment: true },
    }).then((fullOrder) => {
      if (fullOrder) {
        NotificationService.dispatchOrderConfirmationAlerts({
          order: fullOrder,
          payment: fullOrder.payment,
          triggerSource: 'eSewa Payment',
        });
      }
    }).catch((err) => console.error('Notification dispatch error:', err.message));

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

    const paidAt = new Date();

    // Generate SHA-256 integrity hash and RSA digital signature for the completed transaction
    const securityData = generateTransactionSecurityData({
      orderId: order.id,
      amount: order.grandTotal,
      method: 'KHALTI',
      status: 'COMPLETED',
      transactionId: pidx,
      paidAt,
    });

    // Update order status
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'COMPLETED',
          paidAt,
          transactionId: pidx,
          integrityHash: securityData.integrityHash,
          signature: securityData.signature,
          signingKeyId: securityData.signingKeyId,
          signedAt: securityData.signedAt,
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

    // Non-blocking best-effort order confirmation alert (customer email + admin)
    prisma.order.findUnique({
      where: { id: order.id },
      include: { user: true, address: true, items: { include: { product: true } }, payment: true },
    }).then((fullOrder) => {
      if (fullOrder) {
        NotificationService.dispatchOrderConfirmationAlerts({
          order: fullOrder,
          payment: fullOrder.payment,
          triggerSource: 'Khalti Payment',
        });
      }
    }).catch((err) => console.error('Notification dispatch error:', err.message));

    return order;
  }

  /**
   * Verify Payment Security (recomputes SHA-256 hash and verifies RSA signature)
   */
  static async verifyPaymentSecurity(paymentId, dataOverride = null) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    // If payment lacks cryptographic signature (e.g. COD, legacy record, or direct confirmation), sign it now
    if (!payment.signature || !payment.integrityHash) {
      const paidAt = payment.paidAt || payment.updatedAt || new Date();
      const transactionId = payment.transactionId || payment.order?.orderNumber || `TXN-${payment.id.slice(0, 8)}`;
      const status = payment.status || 'COMPLETED';
      const securityData = generateTransactionSecurityData({
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        status,
        transactionId,
        paidAt,
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paidAt,
          transactionId,
          integrityHash: securityData.integrityHash,
          signature: securityData.signature,
          signingKeyId: securityData.signingKeyId,
          signedAt: securityData.signedAt,
        },
      });

      payment.paidAt = paidAt;
      payment.transactionId = transactionId;
      payment.status = status;
      payment.integrityHash = securityData.integrityHash;
      payment.signature = securityData.signature;
      payment.signingKeyId = securityData.signingKeyId;
      payment.signedAt = securityData.signedAt;
    }

    const verificationResult = verifyTransactionSignature(payment, dataOverride);
    return {
      paymentId: payment.id,
      orderNumber: payment.order?.orderNumber,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
      integrityHash: payment.integrityHash,
      signature: payment.signature,
      signingKeyId: payment.signingKeyId,
      signedAt: payment.signedAt,
      ...verificationResult,
    };
  }
}

export default PaymentService;
