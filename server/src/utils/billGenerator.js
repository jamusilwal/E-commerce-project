import PDFDocument from 'pdfkit';

/**
 * Generate a professional PDF invoice/bill for a Hamrolok Bazar order.
 * Returns a Promise that resolves with a Buffer containing the PDF data.
 *
 * @param {Object} order — Full order object with user, address, items (with product), payment, shipment
 * @returns {Promise<Buffer>}
 */
export async function generateBillPDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title: `Invoice — ${order.orderNumber}`,
          Author: 'Hamrolok Bazar',
          Subject: `Order Invoice ${order.orderNumber}`,
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PAGE_WIDTH = doc.page.width;
      const MARGIN_LEFT = 50;
      const MARGIN_RIGHT = 50;
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

      // ── Brand Colors ──
      const CRIMSON = '#8B1E3F';
      const DARK = '#111827';
      const GRAY = '#4b5563';
      const LIGHT_GRAY = '#9ca3af';
      const LIGHT_BG = '#fdf2f4';
      const SUCCESS_GREEN = '#059669';
      const BORDER = '#e5e7eb';

      // ── Helper: format currency ──
      const formatRs = (amt) => `Rs. ${Number(amt || 0).toLocaleString('en-NP')}`;

      // ── Helper: draw horizontal rule ──
      const drawHR = (y, color = BORDER) => {
        doc.strokeColor(color).lineWidth(0.5).moveTo(MARGIN_LEFT, y).lineTo(PAGE_WIDTH - MARGIN_RIGHT, y).stroke();
      };

      // ── Extract order data ──
      const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Valued Customer';
      const customerEmail = order.user?.email || 'N/A';
      const customerPhone = order.user?.phone || order.address?.phone || 'N/A';
      const paymentMethod = order.payment?.method || 'COD';
      const paymentStatus = order.payment?.status || 'PENDING';
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const invoiceDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const address = order.address;
      const addressLines = address
        ? [
            address.fullName || customerName,
            address.street || '',
            `${address.municipality || ''}${address.ward ? `-${address.ward}` : ''}`,
            `${address.district || ''}, ${address.province || ''}`,
            address.postalCode ? `Postal Code: ${address.postalCode}` : '',
            `Phone: ${address.phone || 'N/A'}`,
          ].filter(Boolean)
        : ['Address on file'];

      // ════════════════════════════════════════
      // HEADER SECTION
      // ════════════════════════════════════════

      // Crimson header bar
      doc.rect(0, 0, PAGE_WIDTH, 90).fill(CRIMSON);

      doc.fontSize(22).font('Helvetica-Bold').fillColor('#ffffff').text('HAMROLOK BAZAR', MARGIN_LEFT, 25, {
        align: 'left',
      });
      doc.fontSize(10).font('Helvetica').fillColor('#ffffff').opacity(0.85).text("Nepal's Authentic Handcrafted Marketplace", MARGIN_LEFT, 52, {
        align: 'left',
      });
      doc.opacity(1);

      // INVOICE label on the right
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#ffffff').opacity(0.3).text('INVOICE', PAGE_WIDTH - MARGIN_RIGHT - 150, 25, {
        width: 150,
        align: 'right',
      });
      doc.opacity(1);

      // ════════════════════════════════════════
      // INVOICE META — 2-column layout
      // ════════════════════════════════════════
      let y = 110;

      // Left column — Invoice details
      doc.fontSize(9).font('Helvetica-Bold').fillColor(CRIMSON).text('INVOICE DETAILS', MARGIN_LEFT, y);
      y += 16;
      doc.fontSize(9).font('Helvetica').fillColor(GRAY);
      doc.text(`Invoice No:`, MARGIN_LEFT, y);
      doc.font('Helvetica-Bold').fillColor(DARK).text(`${order.orderNumber}`, MARGIN_LEFT + 80, y);
      y += 14;
      doc.font('Helvetica').fillColor(GRAY).text(`Order Date:`, MARGIN_LEFT, y);
      doc.font('Helvetica-Bold').fillColor(DARK).text(orderDate, MARGIN_LEFT + 80, y);
      y += 14;
      doc.font('Helvetica').fillColor(GRAY).text(`Invoice Date:`, MARGIN_LEFT, y);
      doc.font('Helvetica-Bold').fillColor(DARK).text(invoiceDate, MARGIN_LEFT + 80, y);
      y += 14;
      doc.font('Helvetica').fillColor(GRAY).text(`Status:`, MARGIN_LEFT, y);
      const statusColor = order.status === 'DELIVERED' ? SUCCESS_GREEN : CRIMSON;
      doc.font('Helvetica-Bold').fillColor(statusColor).text(order.status.replace(/_/g, ' '), MARGIN_LEFT + 80, y);

      // Right column — Customer details
      const rightCol = PAGE_WIDTH / 2 + 20;
      let ry = 110;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(CRIMSON).text('BILL TO', rightCol, ry);
      ry += 16;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK).text(customerName, rightCol, ry);
      ry += 14;
      doc.font('Helvetica').fillColor(GRAY).text(customerEmail, rightCol, ry);
      ry += 14;
      doc.font('Helvetica').fillColor(GRAY).text(`Phone: ${customerPhone}`, rightCol, ry);

      // Right column — Shipping address
      ry += 22;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(CRIMSON).text('SHIP TO', rightCol, ry);
      ry += 16;
      for (const line of addressLines) {
        doc.fontSize(8.5).font('Helvetica').fillColor(GRAY).text(line, rightCol, ry);
        ry += 13;
      }

      y = Math.max(y, ry) + 20;

      // ════════════════════════════════════════
      // PAYMENT INFO BAR
      // ════════════════════════════════════════
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 28).fill(LIGHT_BG);
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(CRIMSON);
      doc.text(`Payment Method: ${paymentMethod}`, MARGIN_LEFT + 12, y + 8);
      doc.text(`Payment Status: ${paymentStatus}`, MARGIN_LEFT + CONTENT_WIDTH / 2, y + 8);
      y += 40;

      // ════════════════════════════════════════
      // ITEMS TABLE
      // ════════════════════════════════════════
      // Table header
      const colItem = MARGIN_LEFT;
      const colQty = MARGIN_LEFT + CONTENT_WIDTH * 0.50;
      const colPrice = MARGIN_LEFT + CONTENT_WIDTH * 0.65;
      const colTotal = MARGIN_LEFT + CONTENT_WIDTH * 0.82;

      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 22).fill(CRIMSON);
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('ITEM', colItem + 10, y + 6);
      doc.text('QTY', colQty, y + 6, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', colPrice, y + 6, { width: 70, align: 'right' });
      doc.text('TOTAL', colTotal, y + 6, { width: 70, align: 'right' });
      y += 22;

      // Table rows
      const items = order.items || [];
      items.forEach((item, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        const itemName = item.product?.name || 'Handcrafted Product';
        const qty = item.quantity;
        const unitPrice = item.price;
        const total = item.total || unitPrice * qty;

        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 22).fill(rowBg);
        doc.fontSize(8.5).font('Helvetica').fillColor(DARK);
        doc.text(itemName.length > 45 ? itemName.substring(0, 45) + '...' : itemName, colItem + 10, y + 6, { width: CONTENT_WIDTH * 0.45 });
        doc.text(String(qty), colQty, y + 6, { width: 40, align: 'center' });
        doc.text(formatRs(unitPrice), colPrice, y + 6, { width: 70, align: 'right' });
        doc.font('Helvetica-Bold').text(formatRs(total), colTotal, y + 6, { width: 70, align: 'right' });
        y += 22;
      });

      drawHR(y, CRIMSON);
      y += 12;

      // ════════════════════════════════════════
      // PRICE SUMMARY
      // ════════════════════════════════════════
      const summaryX = MARGIN_LEFT + CONTENT_WIDTH * 0.55;
      const summaryValX = MARGIN_LEFT + CONTENT_WIDTH * 0.82;
      const summaryValW = 70;

      doc.fontSize(9).font('Helvetica').fillColor(GRAY).text('Subtotal:', summaryX, y);
      doc.font('Helvetica').fillColor(DARK).text(formatRs(order.subtotal), summaryValX, y, { width: summaryValW, align: 'right' });
      y += 16;

      doc.font('Helvetica').fillColor(GRAY).text('Delivery Charge:', summaryX, y);
      const delText = Number(order.deliveryCharge || 0) === 0 ? 'FREE' : formatRs(order.deliveryCharge);
      doc.font('Helvetica').fillColor(Number(order.deliveryCharge || 0) === 0 ? SUCCESS_GREEN : DARK).text(delText, summaryValX, y, { width: summaryValW, align: 'right' });
      y += 16;

      if (Number(order.discount || 0) > 0) {
        doc.font('Helvetica').fillColor(GRAY).text('Discount:', summaryX, y);
        doc.font('Helvetica').fillColor(SUCCESS_GREEN).text(`- ${formatRs(order.discount)}`, summaryValX, y, { width: summaryValW, align: 'right' });
        y += 16;
      }

      // Grand total row
      y += 4;
      doc.rect(summaryX - 10, y, CONTENT_WIDTH * 0.45 + 10, 28).fill(CRIMSON);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff').text('GRAND TOTAL', summaryX, y + 7);
      doc.text(formatRs(order.grandTotal), summaryValX - 10, y + 7, { width: summaryValW + 10, align: 'right' });
      y += 44;

      // ════════════════════════════════════════
      // DELIVERY / SHIPMENT INFO (if delivered)
      // ════════════════════════════════════════
      if (order.status === 'DELIVERED' || order.shipment?.deliveredAt) {
        if (y > 680) {
          doc.addPage();
          y = 50;
        }

        doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 50).fill('#ecfdf5');
        doc.fontSize(9).font('Helvetica-Bold').fillColor(SUCCESS_GREEN).text('✅  DELIVERY CONFIRMATION', MARGIN_LEFT + 12, y + 8);
        const deliveredDate = order.shipment?.deliveredAt
          ? new Date(order.shipment.deliveredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : invoiceDate;
        doc.fontSize(8.5).font('Helvetica').fillColor('#065f46');
        doc.text(`Delivered on: ${deliveredDate}`, MARGIN_LEFT + 12, y + 24);
        const courier = order.shipment?.courierName || 'Hamrolok Express / Local Courier';
        doc.text(`Courier: ${courier}`, MARGIN_LEFT + CONTENT_WIDTH / 2, y + 24);
        if (order.shipment?.trackingNumber) {
          doc.text(`Tracking: ${order.shipment.trackingNumber}`, MARGIN_LEFT + 12, y + 37);
        }
        y += 62;
      }

      // ════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      y += 10;
      drawHR(y, BORDER);
      y += 14;

      doc.fontSize(9).font('Helvetica-Bold').fillColor(CRIMSON).text('Thank you for supporting Nepalese artisans!', MARGIN_LEFT, y, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      y += 16;
      doc.fontSize(7.5).font('Helvetica').fillColor(LIGHT_GRAY).text(
        'Hamrolok Bazar — Nepal\'s Authentic Handcrafted Marketplace',
        MARGIN_LEFT,
        y,
        { width: CONTENT_WIDTH, align: 'center' }
      );
      y += 12;
      doc.text(
        'For support, contact: support@hamrolokbazar.com',
        MARGIN_LEFT,
        y,
        { width: CONTENT_WIDTH, align: 'center' }
      );
      y += 12;
      doc.text(
        'This is a computer-generated invoice and does not require a physical signature.',
        MARGIN_LEFT,
        y,
        { width: CONTENT_WIDTH, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
