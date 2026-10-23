// Sales Analytics, Daily Z-Reading, Transaction Ledger & CSV Export Controller

const SalesController = {
  searchQuery: '',

  init() {
    this.tableBody = document.getElementById('sales-ledger-body');
    this.topItemsContainer = document.getElementById('top-selling-items-container');
    this.btnExportCsv = document.getElementById('btn-export-csv');

    this.bindEvents();
    this.render();

    window.appStore.subscribe((event) => {
      if (event === 'orders-updated' || event === 'order-placed') {
        this.render();
      }
    });
  },

  render() {
    this.renderKpis();
    this.renderTopSelling();
    this.renderLedger();
  },

  renderKpis() {
    const orders = window.appStore.orders.filter(o => o.status !== 'Voided');

    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);
    const totalTransactions = orders.length;
    const avgOrder = totalTransactions > 0 ? (totalSales / totalTransactions) : 0;

    const cashOrders = orders.filter(o => o.paymentMethod === 'Cash');
    const cashTotal = cashOrders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

    const gcashOrders = orders.filter(o => o.paymentMethod === 'GCash');
    const gcashTotal = gcashOrders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

    const voidedCount = window.appStore.orders.filter(o => o.status === 'Voided').length;

    // Populate KPI Elements
    const elSales = document.getElementById('kpi-total-sales');
    if (elSales) elSales.textContent = `PHP ${totalSales.toFixed(2)}`;

    const elTrans = document.getElementById('kpi-trans-count');
    if (elTrans) elTrans.textContent = `${totalTransactions} orders`;

    const elAvg = document.getElementById('kpi-avg-order');
    if (elAvg) elAvg.textContent = `PHP ${avgOrder.toFixed(2)}`;

    const elBreakdown = document.getElementById('kpi-payment-breakdown');
    if (elBreakdown) {
      elBreakdown.textContent = `Cash: PHP ${cashTotal.toFixed(2)} (${cashOrders.length}) | GCash: PHP ${gcashTotal.toFixed(2)} (${gcashOrders.length})`;
    }

    const elVoided = document.getElementById('kpi-voided-count');
    if (elVoided) elVoided.textContent = `${voidedCount} voided`;
  },

  renderTopSelling() {
    if (!this.topItemsContainer) return;

    const orders = window.appStore.orders.filter(o => o.status !== 'Voided');
    const itemMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, category: item.category, qty: 0, revenue: 0 };
        }
        itemMap[item.name].qty += item.quantity;
        itemMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const sorted = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    if (sorted.length === 0) {
      this.topItemsContainer.innerHTML = '<div class="text-sub py-3">No sales completed yet today.</div>';
      return;
    }

    let html = '';
    sorted.forEach((item, index) => {
      html += `
        <div class="top-item-row">
          <div class="top-item-rank">${index + 1}</div>
          <div class="top-item-details">
            <div class="top-item-name">${item.name}</div>
            <div class="top-item-sub">${item.qty} units sold</div>
          </div>
          <div class="top-item-rev tabular-price">PHP ${item.revenue.toFixed(2)}</div>
        </div>
      `;
    });

    this.topItemsContainer.innerHTML = html;
  },

  renderLedger() {
    if (!this.tableBody) return;

    let orders = window.appStore.orders.slice();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.date.toLowerCase().includes(q) || 
        o.paymentMethod.toLowerCase().includes(q) ||
        (o.gcashRef && o.gcashRef.toLowerCase().includes(q))
      );
    }

    if (orders.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">No transaction logs available.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    orders.forEach(o => {
      const isVoided = o.status === 'Voided';
      const itemsBrief = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
      
      let statusBadge = `<span class="status-badge badge-${o.status.toLowerCase()}">${o.status}</span>`;

      let actionBtn = '';
      if (!isVoided) {
        actionBtn = `
          <button class="btn-table-action btn-view-receipt" data-id="${o.id}">Receipt</button>
          <button class="btn-table-action btn-void-order" data-id="${o.id}">Void</button>
        `;
      } else {
        actionBtn = `<span class="text-sub font-small font-mono">Voided</span>`;
      }

      rowsHtml += `
        <tr class="${isVoided ? 'row-voided' : ''}">
          <td class="font-mono font-bold">#${o.id}</td>
          <td class="text-sub font-small">${o.date} ${o.time}</td>
          <td><span class="category-tag">${o.orderType}</span></td>
          <td class="items-cell" title="${itemsBrief}">${itemsBrief}</td>
          <td class="tabular-price font-bold ${isVoided ? 'line-through text-sub' : ''}">PHP ${o.totalDue}</td>
          <td>
            <span class="payment-tag">${o.paymentMethod}</span>
            ${o.gcashRef ? `<span class="text-sub font-mono font-small">(${o.gcashRef})</span>` : ''}
          </td>
          <td>${statusBadge}</td>
          <td>${actionBtn}</td>
        </tr>
      `;
    });

    this.tableBody.innerHTML = rowsHtml;

    // Attach row events
    this.tableBody.querySelectorAll('.btn-view-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const order = window.appStore.orders.find(o => o.id === btn.dataset.id);
        if (order) {
          window.CheckoutController.showReceipt(order);
        }
      });
    });

    this.tableBody.querySelectorAll('.btn-void-order').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptVoid(btn.dataset.id);
      });
    });
  },

  promptVoid(orderId) {
    const reason = prompt(`Enter reason for voiding Order #${orderId}:`, 'Customer cancellation / cashier error');
    if (reason !== null && reason.trim() !== '') {
      const success = window.appStore.voidOrder(orderId, reason.trim());
      if (success) {
        alert(`Order #${orderId} has been voided. Stock counts have been restored to inventory.`);
      }
    }
  },

  // Export Sales Ledger to clean CSV format ready for Microsoft Excel
  async exportCsv() {
    const orders = window.appStore.orders;
    if (orders.length === 0) {
      alert('No sales transactions recorded yet to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Order Type',
      'Cashier',
      'Items Ordered',
      'Subtotal (PHP)',
      'Discount Label',
      'Discount Amount (PHP)',
      'Total Amount Due (PHP)',
      'Payment Method',
      'Amount Tendered (PHP)',
      'Change Due (PHP)',
      'GCash Reference',
      'Order Status',
      'Void Reason'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    let csvContent = headers.join(',') + '\r\n';

    orders.forEach(o => {
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.name} (PHP ${i.price})`).join('; ');

      const row = [
        escapeCsv(o.id),
        escapeCsv(o.date),
        escapeCsv(o.time),
        escapeCsv(o.orderType),
        escapeCsv(o.cashier),
        escapeCsv(itemsStr),
        o.subtotal,
        escapeCsv(o.discountLabel),
        o.discountAmount,
        o.totalDue,
        escapeCsv(o.paymentMethod),
        o.amountTendered,
        o.changeDue,
        escapeCsv(o.gcashRef || 'N/A'),
        escapeCsv(o.status),
        escapeCsv(o.voidReason || '')
      ];

      csvContent += row.join(',') + '\r\n';
    });

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const filename = `Tonari_Sales_Report_${dateStr}.csv`;

    // If running in Electron, save directly to Desktop/Tonari_Sales_Reports
    if (window.posNative && window.posNative.isElectron) {
      try {
        const result = await window.posNative.saveCsvReport({
          filename: filename,
          content: csvContent
        });

        if (result.success) {
          alert(`Sales report successfully exported to Desktop:\n${result.filePath}`);
          return;
        }
      } catch (err) {
        console.warn('Native CSV save error, falling back to browser download:', err);
      }
    }

    // Web / Mobile browser download fallback
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  bindEvents() {
    const searchInput = document.getElementById('sales-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderLedger();
      });
    }

    if (this.btnExportCsv) {
      this.btnExportCsv.addEventListener('click', () => {
        this.exportCsv();
      });
    }
  }
};

window.SalesController = SalesController;
