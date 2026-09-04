import axios from 'axios';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Cache sent order IDs to prevent duplicate notifications in the same runtime
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
 * Notification Service — Multi-channel non-blocking alerts (Email + WhatsApp)
 */
class NotificationService {
  /**
   * Send Order Confirmation Alert to Administrator (Email)
   * Non-blocking, best-effort.
   */
  static async sendAdminOrderEmailNotification({ order, payment, triggerSource = 'PAYMENT_COMPLETION' }) {
    if (!order) return;

    // Idempotency check
    const notificationKey = `email-${order.id || order.orderNumber}`;
    if (notifiedOrders.has(notificationKey)) {
      console.log(`ℹ️ [NotificationService] Email already sent for order ${order.orderNumber}. Skipping.`);
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
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">New Order Confirmation Alert</p>
        </div>
        
        <div style="padding: 20px 10px;">
          <p style="font-size: 14px; color: #333;">A new order has been confirmed and paid on the marketplace.</p>
          
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
      console.error(`⚠️ [NotificationService] Failed to send email alert for order #${order.orderNumber}:`, error.message);
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
   * Main Dispatcher for Order Confirmation Notifications (Email + WhatsApp)
   */
  static async dispatchOrderConfirmationAlerts({ order, payment, triggerSource = 'PAYMENT_COMPLETION' }) {
    // 1. Email alert
    await this.sendAdminOrderEmailNotification({ order, payment, triggerSource });

    // 2. WhatsApp alert
    await this.sendWhatsAppOrderAlert({ order, payment, triggerSource });
  }
}

export default NotificationService;
