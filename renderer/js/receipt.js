// 58mm Thermal Receipt Generator & Printer Handler for Tonari POS
// Strictly zero emojis, 100% tabular alignment

const ReceiptService = {
  // Generates clean 32-column text formatted for 58mm thermal rolls
  formatReceiptText(order) {
    const W = 32;
    const divider = '-'.repeat(W);
    const doubleDivider = '='.repeat(W);

    const center = (text) => {
      const pad = Math.max(0, Math.floor((W - text.length) / 2));
      return ' '.repeat(pad) + text;
    };

    const row = (left, right) => {
      const space = Math.max(1, W - left.length - right.length);
      return left + ' '.repeat(space) + right;
    };

    let lines = [];
    lines.push(center('TONARI'));
    lines.push(center('Japanese-Inspired Food'));
    lines.push(center('Tibanga, Iligan City'));
    lines.push(center('Contact: 0961-640-4472'));
    lines.push(doubleDivider);

    lines.push(row(`Order: #${order.id}`, `[${order.orderType}]`));
    lines.push(row(`Date: ${order.date}`, order.time));
    lines.push(`Cashier: ${order.cashier}`);
    lines.push(divider);

    lines.push(row('QTY  ITEM', 'AMOUNT'));
    lines.push(divider);

    order.items.forEach(item => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      const qtyStr = String(item.quantity).padEnd(4, ' ');
      
      // Handle item name wrapping if longer than 18 chars
      if (item.name.length <= 18) {
        lines.push(row(`${qtyStr}${item.name}`, `PHP ${lineTotal}`));
      } else {
        lines.push(`${qtyStr}${item.name}`);
        lines.push(row('    ', `PHP ${lineTotal}`));
      }
    });

    lines.push(divider);
    lines.push(row('Subtotal:', `PHP ${order.subtotal}`));

    if (parseFloat(order.discountAmount) > 0) {
      lines.push(row(`Discount (${order.discountLabel}):`, `-PHP ${order.discountAmount}`));
    }

    lines.push(row('TOTAL DUE:', `PHP ${order.totalDue}`));
    lines.push(divider);

    lines.push(row('Payment Method:', order.paymentMethod));
    lines.push(row('Amount Tendered:', `PHP ${order.amountTendered}`));
    lines.push(row('Change:', `PHP ${order.changeDue}`));

    if (order.gcashRef) {
      lines.push(row('GCash Ref:', order.gcashRef));
    }

    lines.push(doubleDivider);
    lines.push(center('Thank you for dining!'));
    lines.push(center('Please keep this receipt.'));
    lines.push('');

    return lines.join('\n');
  },

  // Generates HTML view for on-screen thermal modal preview
  renderReceiptModal(order) {
    const receiptText = this.formatReceiptText(order);
    const container = document.getElementById('receipt-thermal-paper');
    if (container) {
      container.textContent = receiptText;
    }
  },

  // Prints the receipt
  async printReceipt(order) {
    // If running in Electron with native bridge
    if (window.posNative && window.posNative.isElectron) {
      try {
        const result = await window.posNative.printReceipt({ silent: false });
        return result;
      } catch (err) {
        console.warn('Native print error, falling back to window.print():', err);
      }
    }

    // Browser / Mobile fallback: standard window print
    window.print();
    return { success: true };
  }
};

window.ReceiptService = ReceiptService;
