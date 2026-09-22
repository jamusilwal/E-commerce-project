import axios from 'axios';
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { generateBillPDF } from '../utils/billGenerator.js';

// Cache sent notification keys to prevent duplicate notifications in the same runtime
const notifiedOrders = new Set();

let mailTransporter = null;

/**
 * Get or initialize Nodemailer transporter
 */
const getTransporter = () => {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();

  if (!user || !pass) {
    return null;
  }

  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return mailTransporter;
};

/**
 * Notification Service — Multi-channel alerts (Customer Emails, Admin Email + WhatsApp)
 */
class NotificationService {
  /**
   * Send Welcome Email to newly registered customer / artisan
   */
  static async sendCustomerWelcomeEmail({ user }) {
    if (!user || !user.email) return;

    const notificationKey = `welcome-${user.id || user.email}`;
    if (notifiedOrders.has(notificationKey)) return;

    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Member';
    const emailSubject = `🙏 Welcome to Hamrolok Bazar, ${user.firstName || 'Friend'}!`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
        <div style="background-color: #8B1E3F; color: #ffffff; padding: 24px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">HAMROLOK BAZAR</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Nepal's Authentic Handcrafted Marketplace</p>
        </div>

        <div style="padding: 24px 16px;">
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0;">Namaste ${customerName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            Welcome to <strong>Hamrolok Bazar</strong>! Your account has been registered successfully with your email <strong>${user.email}</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            All your <strong>order confirmations</strong>, <strong>shipping updates</strong>, and <strong>delivery receipts</strong> will be sent directly to this valid email address.
          </p>

          <div style="background-color: #fdf2f4; border-left: 4px solid #8B1E3F; padding: 14px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 6px; color: #8B1E3F; font-size: 14px;">Why Shop with Us?</h4>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #4b5563; line-height: 1.5;">
              <li>100% Authentic Nepalese handmade and artisanal products</li>
              <li>Direct empowerment of local craftsmen and indigenous artisans</li>
              <li>Secure online payment via eSewa, Khalti, and Cash on Delivery</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0 20px;">
            <a href="${env.CLIENT_URL}" style="background-color: #8B1E3F; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(139, 30, 63, 0.2);">
              Explore Artisan Products
            </a>
          </div>
        </div>

        <div style="text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          Hamrolok Bazar • Handcrafted with love in Nepal<br />
          Need assistance? Reply directly to this email or contact support.
        </div>
      </div>
    `;

    try {
      const transporter = getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [NotificationService] SMTP not configured. Welcome email simulated for ${user.email}`);
        notifiedOrders.add(notificationKey);
        return;
      }

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HAMROLOK BAZAR'}" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: emailSubject,
        text: `Namaste ${customerName},\n\nWelcome to Hamrolok Bazar! Your account has been registered with ${user.email}.\nOrder confirmations and delivery receipts will be sent directly to this address.\n\nVisit: ${env.CLIENT_URL}`,
        html: emailHtml,
      });

      notifiedOrders.add(notificationKey);
      console.log(`✅ [NotificationService] Customer welcome email sent to ${user.email}`);
    } catch (error) {
      console.error(`⚠️ [NotificationService] Failed to send customer welcome email to ${user.email}:`, error.message);
    }
  }

  /**
   * Send Order Confirmation Email to the Customer's Email Address
   */
  static async sendCustomerOrderConfirmationEmail({ order, payment }) {
    if (!order || !order.user || !order.user.email) return;

    const notificationKey = `customer-order-confirm-${order.id || order.orderNumber}`;
    if (notifiedOrders.has(notificationKey)) {
      console.log(`ℹ️ [NotificationService] Customer order confirmation email already sent for #${order.orderNumber}. Skipping.`);
      return;
    }

    const customerEmail = order.user.email;
    const customerName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Valued Customer';
    const totalAmount = `Rs. ${Number(order.grandTotal || 0).toLocaleString('en-NP')}`;
    const subtotal = `Rs. ${Number(order.subtotal || 0).toLocaleString('en-NP')}`;
    const deliveryCharge = `Rs. ${Number(order.deliveryCharge || 0).toLocaleString('en-NP')}`;
    const discount = Number(order.discount || 0) > 0 ? `- Rs. ${Number(order.discount).toLocaleString('en-NP')}` : null;
    const paymentMethod = payment?.method || order.payment?.method || 'COD';
    const paymentStatus = payment?.status || order.payment?.status || (paymentMethod === 'COD' ? 'PAYMENT ON DELIVERY' : 'PENDING');

    const address = order.address;
    const addressStr = address
      ? `${address.fullName || customerName}, ${address.street ? `${address.street}, ` : ''}${address.municipality || ''}, ${address.district || ''}, ${address.province || ''} (Phone: ${address.phone || 'N/A'})`
      : 'Address on file';

    const htmlItemsTable = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">
            ${item.product?.name || 'Handcrafted Product'}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #4b5563;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">
            Rs. ${Number(item.price || 0).toLocaleString('en-NP')}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827;">
            Rs. ${Number(item.total || item.price * item.quantity).toLocaleString('en-NP')}
          </td>
        </tr>`
      )
      .join('');

    const textItemsList = (order.items || [])
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product?.name || 'Product'} @ Rs. ${item.price} = Rs. ${item.total || item.price * item.quantity}`
      )
      .join('\n');

    const emailSubject = `🛒 Order Confirmation — #${order.orderNumber} | Hamrolok Bazar`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
        <div style="background-color: #8B1E3F; color: #ffffff; padding: 22px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">HAMROLOK BAZAR</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Order Confirmation Receipt</p>
        </div>

        <div style="padding: 24px 16px;">
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0;">Namaste ${customerName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            Thank you for shopping at Hamrolok Bazar! Your order <strong>#${order.orderNumber}</strong> has been successfully placed. Our local artisans are now preparing your handcrafted items with care.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px;">
            <div style="margin-bottom: 6px;"><strong>Order Number:</strong> #${order.orderNumber}</div>
            <div style="margin-bottom: 6px;"><strong>Payment Method:</strong> ${paymentMethod} (${paymentStatus})</div>
            <div style="margin-bottom: 6px;"><strong>Shipping To:</strong> ${addressStr}</div>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #8B1E3F; border-bottom: 2px solid #8B1E3F; padding-bottom: 6px; margin: 20px 0 10px;">
            Order Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
            <thead>
              <tr style="background-color: #f9fafb; color: #6b7280; text-align: left;">
                <th style="padding: 8px; font-weight: 600;">Item</th>
                <th style="padding: 8px; text-align: center; font-weight: 600;">Qty</th>
                <th style="padding: 8px; text-align: right; font-weight: 600;">Price</th>
                <th style="padding: 8px; text-align: right; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${htmlItemsTable}
            </tbody>
          </table>

          <!-- Price Summary -->
          <div style="width: 100%; border-top: 2px solid #e5e7eb; padding-top: 10px; font-size: 13px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4b5563;">
              <span>Subtotal:</span>
              <span>${subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4b5563;">
              <span>Delivery Charge:</span>
              <span>${deliveryCharge}</span>
            </div>
            ${discount ? `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #059669; font-weight: 500;">
              <span>Discount:</span>
              <span>${discount}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; padding: 8px 0 0; border-top: 1px dashed #d1d5db; color: #8B1E3F; font-size: 16px; font-weight: 700;">
              <span>Grand Total:</span>
              <span>${totalAmount}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0 16px;">
            <a href="${env.CLIENT_URL}/orders/${order.id}" style="background-color: #8B1E3F; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(139, 30, 63, 0.2);">
              View & Track Order
            </a>
          </div>

          <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 16px;">
            You will receive another email notification as soon as your order is marked as <strong>Delivered</strong>.
          </p>
        </div>

        <div style="text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 14px;">
          Dhanyabad for supporting Nepalese artisans! • Hamrolok Bazar<br />
          If you have questions, please contact our support team.
        </div>
      </div>
    `;

    try {
      const transporter = getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [NotificationService] SMTP not configured. Customer order confirmation email simulated for #${order.orderNumber} to ${customerEmail}`);
        notifiedOrders.add(notificationKey);
        return;
      }

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HAMROLOK BAZAR'}" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: emailSubject,
        text: `Namaste ${customerName},\n\nThank you for shopping at Hamrolok Bazar! Your order #${order.orderNumber} is confirmed.\n\nGrand Total: ${totalAmount}\nPayment Method: ${paymentMethod} (${paymentStatus})\nShipping Address: ${addressStr}\n\nItems:\n${textItemsList}\n\nTrack your order at: ${env.CLIENT_URL}/orders/${order.id}\n\nDhanyabad for supporting Nepalese artisans!`,
        html: emailHtml,
      });

      notifiedOrders.add(notificationKey);
      console.log(`✅ [NotificationService] Customer order confirmation email sent successfully to ${customerEmail} for order #${order.orderNumber}`);
    } catch (error) {
      console.error(`⚠️ [NotificationService] Failed to send customer order confirmation email to ${customerEmail}:`, error.message);
    }
  }

  /**
   * Send Order Delivered Email to Customer's Email Address
   */
  static async sendCustomerOrderDeliveredEmail({ order, shipment, pdfBuffer }) {
    if (!order || !order.user || !order.user.email) return;

    const notificationKey = `customer-order-delivered-${order.id || order.orderNumber}`;
    if (notifiedOrders.has(notificationKey)) {
      console.log(`ℹ️ [NotificationService] Customer delivery email already sent for #${order.orderNumber}. Skipping.`);
      return;
    }

    const customerEmail = order.user.email;
    const customerName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Valued Customer';
    const totalAmount = `Rs. ${Number(order.grandTotal || 0).toLocaleString('en-NP')}`;
    const courierName = shipment?.courierName || order.shipment?.courierName || 'Hamrolok Express / Local Courier';
    const trackingNumber = shipment?.trackingNumber || order.shipment?.trackingNumber || null;
    const deliveredDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const itemsSummary = (order.items || [])
      .map(
        (item) => `
        <li style="padding: 4px 0; font-size: 13px; color: #374151;">
          ${item.quantity}x <strong>${item.product?.name || 'Handcrafted Item'}</strong>
        </li>`
      )
      .join('');

    const textItemsList = (order.items || [])
      .map((item) => `• ${item.quantity}x ${item.product?.name || 'Handcrafted Item'}`)
      .join('\n');

    const emailSubject = `🎉 Your Order #${order.orderNumber} Has Been Delivered! — Hamrolok Bazar`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
        <div style="background-color: #059669; color: #ffffff; padding: 22px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">HAMROLOK BAZAR</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Package Delivered Successfully! 📦</p>
        </div>

        <div style="padding: 24px 16px;">
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0;">Namaste ${customerName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            Great news! Your package for order <strong>#${order.orderNumber}</strong> has been successfully delivered to your address on <strong>${deliveredDate}</strong>.
          </p>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px;">
            <div style="margin-bottom: 6px; color: #065f46;"><strong>Status:</strong> Delivered ✅</div>
            <div style="margin-bottom: 6px; color: #065f46;"><strong>Delivery Partner:</strong> ${courierName}</div>
            ${trackingNumber ? `<div style="margin-bottom: 6px; color: #065f46;"><strong>Tracking Number:</strong> ${trackingNumber}</div>` : ''}
            <div style="color: #065f46;"><strong>Order Amount:</strong> ${totalAmount}</div>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #8B1E3F; border-bottom: 2px solid #8B1E3F; padding-bottom: 6px; margin: 20px 0 10px;">
            Delivered Items
          </h3>
          <ul style="padding-left: 20px; margin: 0 0 20px 0;">
            ${itemsSummary}
          </ul>

          <div style="background-color: #fdf2f4; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center;">
            <p style="font-size: 13px; color: #8B1E3F; font-weight: 600; margin: 0 0 6px;">How was your experience?</p>
            <p style="font-size: 12px; color: #4b5563; margin: 0 0 12px;">Your feedback directly helps Nepalese artisans grow their craft and reach more patrons.</p>
            <a href="${env.CLIENT_URL}/orders/${order.id}" style="background-color: #8B1E3F; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">
              Leave a Review for Artisan
            </a>
          </div>

          <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 16px;">
            If you have any issues with your delivered package, please reach out to us at <strong>support@hamrolokbazar.com</strong> within 7 days.
          </p>
        </div>

        <div style="text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 14px;">
          Dhanyabad for choosing authentic Nepalese craftsmanship! • Hamrolok Bazar
        </div>
      </div>
    `;

    try {
      const transporter = getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [NotificationService] SMTP not configured. Customer delivery email simulated for #${order.orderNumber} to ${customerEmail}`);
        notifiedOrders.add(notificationKey);
        return;
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'HAMROLOK BAZAR'}" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: emailSubject,
        text: `Namaste ${customerName},\n\nGreat news! Your package for order #${order.orderNumber} has been delivered on ${deliveredDate}.\n\nCourier: ${courierName}\nDelivered Items:\n${textItemsList}\n\nWe hope you love your handcrafted items! Please leave a review at: ${env.CLIENT_URL}/orders/${order.id}\n\nDhanyabad! • Hamrolok Bazar`,
        html: emailHtml,
      };

      // Attach PDF invoice if available
      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `HLB-${order.orderNumber}-Invoice.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      }

      await transporter.sendMail(mailOptions);

      notifiedOrders.add(notificationKey);
      console.log(`✅ [NotificationService] Customer delivery notification email sent successfully to ${customerEmail} for order #${order.orderNumber}`);
    } catch (error) {
      console.error(`⚠️ [NotificationService] Failed to send customer delivery email to ${customerEmail}:`, error.message);
    }
  }

  /**
   * Send Order Confirmation Alert to Administrator (Email)
   */
  static async sendAdminOrderEmailNotification({ order, payment, triggerSource = 'PAYMENT_COMPLETION' }) {
    if (!order) return;

    const notificationKey = `admin-email-${order.id || order.orderNumber}`;
    if (notifiedOrders.has(notificationKey)) {
      return;
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@hamrolokbazar.com';
    const customerName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Valued Customer';
    const customerEmail = order.user?.email || 'N/A';
    const paymentMethod = payment?.method || order.payment?.method || 'N/A';
    const totalAmount = `Rs. ${Number(order.grandTotal || 0).toLocaleString('en-NP')}`;

    const itemsSummary = (order.items || [])
      .map((item) => `• ${item.quantity}x ${item.product?.name || 'Product'} — Rs. ${item.total || item.price * item.quantity}`)
      .join('\n');

    const htmlItemsTable = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.total || item.price * item.quantity}</td>
        </tr>`
      )
      .join('');

    const emailSubject = `🔔 [HAMROLOK BAZAR] New Order Confirmed — #${order.orderNumber} (${totalAmount})`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #8B1E3F; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">HAMROLOK BAZAR</h2>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Admin Order Confirmation Alert</p>
        </div>
        
        <div style="padding: 20px 10px;">
          <p style="font-size: 14px; color: #333;">A new order has been confirmed on the marketplace.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #666;"><strong>Order Number:</strong></td>
              <td style="padding: 6px 0; color: #111;"><strong>#${order.orderNumber}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Customer:</td>
              <td style="padding: 6px 0; color: #111;">${customerName} (${customerEmail})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Payment Method:</td>
              <td style="padding: 6px 0; color: #111;"><span style="background-color: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${paymentMethod}</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Grand Total:</td>
              <td style="padding: 6px 0; color: #8B1E3F; font-size: 16px; font-weight: bold;">${totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Trigger Source:</td>
              <td style="padding: 6px 0; color: #555; font-size: 11px;">${triggerSource}</td>
            </tr>
          </table>

          <h4 style="font-size: 13px; color: #333; margin-bottom: 8px; border-bottom: 2px solid #8B1E3F; padding-bottom: 4px;">Order Items</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9; color: #666; text-align: left;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${htmlItemsTable}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${env.CLIENT_URL}/admin/orders" style="background-color: #8B1E3F; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>
        </div>

        <div style="text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px;">
          HAMROLOK BAZAR — Nepalese Handmade Marketplace
        </div>
      </div>
    `;

    try {
      const transporter = getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [NotificationService] SMTP credentials not configured. Order email logged to console for #${order.orderNumber}:`);
        console.log(`   To: ${adminEmail}\n   Subject: ${emailSubject}\n   Amount: ${totalAmount}\n   Items:\n${itemsSummary}`);
        notifiedOrders.add(notificationKey);
        return;
      }

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HAMROLOK BAZAR'}" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: emailSubject,
        text: `New Order Confirmed: #${order.orderNumber}\nCustomer: ${customerName} (${customerEmail})\nTotal: ${totalAmount}\nPayment: ${paymentMethod}\n\nItems:\n${itemsSummary}\n\nView at: ${env.CLIENT_URL}/admin/orders`,
        html: emailHtml,
      });

      notifiedOrders.add(notificationKey);
      console.log(`✅ [NotificationService] Admin email notification sent successfully for order #${order.orderNumber}`);
    } catch (error) {
      console.error(`⚠️ [NotificationService] Failed to send admin email alert for order #${order.orderNumber}:`, error.message);
    }
  }

  /**
   * Generate Clean Formatted WhatsApp Message Content for an Order
   */
  static generateWhatsAppMessageText({ order, payment }) {
    const customerName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer';
    const totalAmount = `Rs. ${Number(order.grandTotal || 0).toLocaleString('en-NP')}`;
    const paymentMethod = payment?.method || order.payment?.method || 'N/A';
    const paymentStatus = payment?.status || order.payment?.status || 'PENDING';

    const itemsSummary = (order.items || [])
      .map((item) => `  • ${item.quantity}x ${item.product?.name || 'Item'} (Rs. ${item.total || item.price * item.quantity})`)
      .join('\n');

    return (
      `🛍️ *HAMROLOK BAZAR — Order Confirmation*\n\n` +
      `📦 *Order Number:* #${order.orderNumber}\n` +
      `👤 *Customer:* ${customerName}\n` +
      `💳 *Payment:* ${paymentMethod} (${paymentStatus})\n` +
      `💰 *Grand Total:* ${totalAmount}\n\n` +
      `🛒 *Items Ordered:*\n${itemsSummary}\n\n` +
      `📍 *Shipping:* ${order.address?.municipality || 'Kathmandu'}, ${order.address?.district || 'Nepal'}\n` +
      `🔗 *Track Order:* ${env.CLIENT_URL}/orders/${order.id}\n\n` +
      `_Dhanyabad for supporting local Nepalese artisans!_`
    );
  }

  /**
   * Send WhatsApp Message Alert via Meta WhatsApp Cloud API (Non-blocking)
   */
  static async sendWhatsAppOrderAlert({ order, payment, triggerSource = 'PAYMENT_COMPLETION' }) {
    if (!order) return;

    const notificationKey = `whatsapp-${order.id || order.orderNumber}`;
    if (notifiedOrders.has(notificationKey)) {
      return;
    }

    const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const recipientNumber = process.env.ADMIN_WHATSAPP_NUMBER || '9779800000000';
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

    const messageText = this.generateWhatsAppMessageText({ order, payment });

    if (!token || !phoneNumberId || token.includes('your_meta')) {
      console.log(`📱 [NotificationService] WhatsApp Cloud API credentials not configured in .env.`);
      console.log(`📱 [WhatsApp Preview for Order #${order.orderNumber}]:\n${messageText}\n`);
      notifiedOrders.add(notificationKey);
      return;
    }

    try {
      const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientNumber,
          type: 'text',
          text: { preview_url: true, body: messageText },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      notifiedOrders.add(notificationKey);
      console.log(`✅ [NotificationService] WhatsApp alert dispatched successfully for order #${order.orderNumber}`);
    } catch (error) {
      console.error(
        `⚠️ [NotificationService] WhatsApp API dispatch failed for order #${order.orderNumber}:`,
        error.response?.data?.error?.message || error.message
      );
    }
  }

  /**
   * Main Dispatcher for Order Confirmation Notifications
   * Sends email directly to customer, alert to admin, and WhatsApp notification
   */
  static async dispatchOrderConfirmationAlerts({ order, payment, triggerSource = 'PAYMENT_COMPLETION' }) {
    if (!order) return;

    // 1. Customer confirmation email sent to their registered valid email address
    await this.sendCustomerOrderConfirmationEmail({ order, payment });

    // 2. Admin email notification
    await this.sendAdminOrderEmailNotification({ order, payment, triggerSource });

    // 3. WhatsApp alert
    await this.sendWhatsAppOrderAlert({ order, payment, triggerSource });
  }

  /**
   * Main Dispatcher for Order Delivered Notifications
   * Sends delivery confirmation email directly to customer's registered email
   */
  static async dispatchOrderDeliveredAlerts({ order, shipment }) {
    if (!order) return;

    // Generate PDF invoice to attach to the delivery email
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateBillPDF(order);
      console.log(`✅ [NotificationService] PDF invoice generated for order #${order.orderNumber} (${pdfBuffer.length} bytes)`);
    } catch (err) {
      console.error(`⚠️ [NotificationService] Failed to generate PDF invoice for order #${order.orderNumber}:`, err.message);
    }

    // Customer delivery email sent to their registered valid email address, with PDF attached
    await this.sendCustomerOrderDeliveredEmail({ order, shipment, pdfBuffer });
  }
}

export default NotificationService;
