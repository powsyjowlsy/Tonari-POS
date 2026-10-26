// Sales Analytics, Daily Z-Reading, Transaction Ledger, Cash Float Reconciliation & CSV Export
// Implements: SRS RTM-FR-005 (PIN Voiding), RTM-FR-006 (Z-Reading Aggregation), RTM-FR-007 (Cash Drawer Reconciliation)
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const SalesController = {
  searchQuery: '',
  pendingVoidOrderId: null,

  init() {
    this.tableBody = document.getElementById('sales-ledger-body');
    this.topItemsContainer = document.getElementById('top-selling-items-container');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.pinModal = document.getElementById('manager-pin-modal');

    this.bindEvents();
    this.render();

    window.appStore.subscribe((event) => {
      if (event === 'orders-updated' || event === 'order-placed') {
        this.render();
      }
    });
  },

  bindEvents() {
    // Search input filter for sales ledger
    const searchInput = document.getElementById('sales-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderLedger();
      });
    }

    // CSV export button in Sales view and top bar
    if (this.btnExportCsv) {
      this.btnExportCsv.addEventListener('click', () => {
        this.exportCsv();
      });
    }

    const topBtnExportCsv = document.getElementById('top-btn-export-csv');
    if (topBtnExportCsv) {
      topBtnExportCsv.addEventListener('click', () => {
        this.exportCsv();
      });
    }

    // Print Z-Report top button
    const topBtnPrintZ = document.getElementById('top-btn-print-z');
    if (topBtnPrintZ) {
      topBtnPrintZ.addEventListener('click', () => {
        this.printZReport();
      });
    }

    // Cash Drawer Float calculation button & input
    const btnCalcVariance = document.getElementById('btn-calc-drawer-variance');
    if (btnCalcVariance) {
      btnCalcVariance.addEventListener('click', () => {
        this.reconcileCashDrawer();
      });
    }

    const countedInput = document.getElementById('drawer-counted-cash-input');
    if (countedInput) {
      countedInput.addEventListener('input', () => {
        this.reconcileCashDrawer();
      });
    }

    // Manager PIN Modal actions (SRS RTM-FR-005)
    const btnCancelPin = document.getElementById('btn-cancel-pin-modal');
    if (btnCancelPin) {
      btnCancelPin.addEventListener('click', () => {
        this.closePinModal();
      });
    }

    const btnSubmitPin = document.getElementById('btn-submit-pin-modal');
    if (btnSubmitPin) {
      btnSubmitPin.addEventListener('click', () => {
        this.verifyAndExecuteVoid();
      });
    }
  },

  // --------------------------------------------------------------------------
  // Cash Drawer Reconciliation (SRS RTM-FR-007)
  // --------------------------------------------------------------------------
  reconcileCashDrawer() {
    const inputEl = document.getElementById('drawer-counted-cash-input');
    const countedVal = inputEl ? inputEl.value : null;

    const summary = window.appStore.getCashDrawerSummary(countedVal);

    const elFloat = document.getElementById('drawer-opening-float-display');
    const elCashSales = document.getElementById('drawer-cash-sales-display');
    const elExpected = document.getElementById('drawer-expected-cash-display');
    const elVariance = document.getElementById('drawer-variance-amount-display');
    const elStatusBadge = document.getElementById('drawer-variance-status-badge');

    if (elFloat) elFloat.textContent = `PHP ${summary.openingFloat}`;
    if (elCashSales) elCashSales.textContent = `PHP ${summary.cashSales}`;
    if (elExpected) elExpected.textContent = `PHP ${summary.expectedCash}`;

    if (elVariance && summary.variance !== null) {
      elVariance.textContent = `PHP ${summary.variance}`;
      if (summary.varianceStatus === 'Balanced') {
        elVariance.className = 'tabular-price font-bold text-success';
        if (elStatusBadge) elStatusBadge.innerHTML = '<span class="status-badge badge-in-stock">Balanced (0.00)</span>';
      } else if (summary.varianceStatus === 'Over') {
        elVariance.className = 'tabular-price font-bold text-success';
        if (elStatusBadge) elStatusBadge.innerHTML = `<span class="status-badge badge-low-stock">Over (+PHP ${summary.variance})</span>`;
      } else {
        elVariance.className = 'tabular-price font-bold text-danger';
        if (elStatusBadge) elStatusBadge.innerHTML = `<span class="status-badge badge-out-of-stock">Short (-PHP ${Math.abs(summary.variance).toFixed(2)})</span>`;
      }
    } else {
      if (elVariance) elVariance.textContent = 'PHP 0.00';
      if (elStatusBadge) elStatusBadge.innerHTML = '<span class="status-badge badge-in-stock">Awaiting Cash Count</span>';
    }
  },

  // --------------------------------------------------------------------------
  // PIN-Secured Order Voiding (SRS RTM-FR-005)
  // --------------------------------------------------------------------------
  promptVoidWithPin(orderId) {
    this.pendingVoidOrderId = orderId;
    const pinInput = document.getElementById('manager-pin-input');
    if (pinInput) pinInput.value = '';
    const errorText = document.getElementById('pin-error-text');
    if (errorText) errorText.style.display = 'none';

    document.getElementById('pin-target-order-label').textContent = `Authorize Void for Order #${orderId}`;

    if (this.pinModal) {
      this.pinModal.classList.add('modal-visible');
      if (pinInput) pinInput.focus();
    }
  },

  closePinModal() {
    if (this.pinModal) {
      this.pinModal.classList.remove('modal-visible');
    }
    this.pendingVoidOrderId = null;
  },

  verifyAndExecuteVoid() {
    const pinInput = document.getElementById('manager-pin-input');
    const errorText = document.getElementById('pin-error-text');
    const enteredPin = pinInput ? pinInput.value.trim() : '';

    const isValid = window.appStore.verifyManagerPin(enteredPin);
    if (!isValid) {
      if (errorText) {
        errorText.textContent = `Invalid 4-digit PIN (Attempts: ${window.appStore.failedPinAttempts}/3). Default is 1234.`;
        errorText.style.display = 'block';
      }
      return;
    }

    const orderId = this.pendingVoidOrderId;
    this.closePinModal();

    const reason = prompt(`Enter official reason for voiding Order #${orderId}:`, 'Customer cancellation / cashier input error');
    if (reason !== null && reason.trim() !== '') {
      const success = window.appStore.voidOrder(orderId, reason.trim());
      if (success) {
        alert(`Order #${orderId} has been officially voided. Inventory stock has been restored.`);
      }
    }
  },

  // --------------------------------------------------------------------------
  // Z-Reading & KPI Rendering
  // --------------------------------------------------------------------------
  render() {
    this.renderKpis();
    this.renderTopSelling();
    this.renderLedger();
    this.reconcileCashDrawer();
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
        const itemDisplayName = item.flavor ? `${item.name} (${item.flavor})` : item.name;
        if (!itemMap[itemDisplayName]) {
          itemMap[itemDisplayName] = { name: itemDisplayName, category: item.category, qty: 0, revenue: 0 };
        }
        itemMap[itemDisplayName].qty += item.quantity;
        itemMap[itemDisplayName].revenue += item.price * item.quantity;
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
      orders = orders.filter(o => {
        return o.id.toLowerCase().includes(this.searchQuery) ||
               o.cashier.toLowerCase().includes(this.searchQuery) ||
               o.items.some(i => i.name.toLowerCase().includes(this.searchQuery));
      });
    }

    if (orders.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-sub">No transaction orders found matching criteria.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    orders.forEach(o => {
      const isVoid = o.status === 'Voided';
      const itemsSummary = o.items.map(i => `${i.quantity}x ${i.name}${i.flavor ? ` [${i.flavor}]` : ''}`).join(', ');

      let statusBadge = '';
      if (isVoid) {
        statusBadge = '<span class="status-badge badge-out-of-stock">Voided</span>';
      } else if (o.status === 'Completed') {
        statusBadge = '<span class="status-badge badge-in-stock">Completed</span>';
      } else {
        statusBadge = `<span class="status-badge badge-low-stock">${o.status}</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="font-bold text-main font-mono">#${o.id}</td>
          <td class="text-sub font-mono font-small">${o.time}</td>
          <td><span class="category-tag">${o.orderType}</span></td>
          <td class="text-main font-small" style="max-width: 260px;">${itemsSummary}</td>
          <td class="tabular-price font-bold ${isVoid ? 'text-sub' : 'text-main'}" style="${isVoid ? 'text-decoration: line-through;' : ''}">
            PHP ${parseFloat(o.totalDue).toFixed(2)}
          </td>
          <td><span class="text-sub font-bold">${o.paymentMethod}</span></td>
          <td>${statusBadge}</td>
          <td>
            ${!isVoid ? `<button class="btn-void-order" data-id="${o.id}">Void</button>` : `<span class="text-sub font-small font-italic">${o.voidReason || 'Voided'}</span>`}
          </td>
        </tr>
      `;
    });

    this.tableBody.innerHTML = rowsHtml;

    // Attach Void button clicks with PIN barrier
    this.tableBody.querySelectorAll('.btn-void-order').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptVoidWithPin(btn.dataset.id);
      });
    });
  },

  // --------------------------------------------------------------------------
  // CSV Export Generation
  // --------------------------------------------------------------------------
  exportCsv() {
    const orders = window.appStore.orders;
    if (orders.length === 0) {
      alert('Cannot export: No transaction records to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Order Type',
      'Cashier',
      'Items Purchased',
      'Subtotal (PHP)',
      'Discount Type',
      'Discount Amount (PHP)',
      'Total Due (PHP)',
      'Payment Method',
      'Amount Tendered (PHP)',
      'Change Due (PHP)',
      'GCash Ref',
      'Status',
      'Void Reason'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    let csvContent = headers.join(',') + '\r\n';

    orders.forEach(o => {
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.name}${i.flavor ? ` (${i.flavor})` : ''} (PHP ${i.price})`).join('; ');

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
    const filename = `Tonari_Sales_Report_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`;

    // IPC save if running in Electron native shell
    if (window.posNative && window.posNative.saveCsvReport) {
      window.posNative.saveCsvReport({ filename, content: csvContent })
        .then(res => {
          if (res && res.success) {
            alert(`Sales report CSV successfully saved to:\n${res.filePath}`);
          }
        })
        .catch(err => {
          console.error('IPC Save failed, falling back to browser download:', err);
          this.triggerBrowserDownload(filename, csvContent);
        });
    } else {
      this.triggerBrowserDownload(filename, csvContent);
    }
  },

  triggerBrowserDownload(filename, text) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printZReport() {
    window.print();
  }
};

window.SalesController = SalesController;
