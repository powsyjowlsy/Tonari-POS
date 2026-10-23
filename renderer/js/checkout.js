// Checkout, Payment Tender & Change Computation Controller for Tonari POS

const CheckoutController = {
  currentMethod: 'Cash',
  tenderedString: '',
  gcashRefString: '',

  init() {
    this.modal = document.getElementById('payment-modal');
    this.receiptModal = document.getElementById('receipt-modal');
    this.bindEvents();
  },

  openCheckout() {
    const summary = window.appStore.getCartSummary();
    if (summary.totalItems === 0) {
      alert('Cannot checkout: Cart is empty.');
      return;
    }

    this.currentMethod = 'Cash';
    this.tenderedString = '';
    this.gcashRefString = '';

    // Populate modal displays
    document.getElementById('checkout-due-amount').textContent = `PHP ${summary.totalDue}`;
    document.getElementById('checkout-items-count').textContent = `${summary.totalItems} items`;
    document.getElementById('checkout-discount-info').textContent = summary.discountLabel !== 'None' 
      ? `Discount applied: -PHP ${summary.discountAmount} (${summary.discountLabel})` 
      : 'No discount applied';

    this.setPaymentMethod('Cash');
    this.updateCalculation();

    if (this.modal) {
      this.modal.classList.add('modal-visible');
    }
  },

  closeCheckout() {
    if (this.modal) {
      this.modal.classList.remove('modal-visible');
    }
  },

  setPaymentMethod(method) {
    this.currentMethod = method;
    
    // Tab toggles
    document.querySelectorAll('.payment-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === method);
    });

    const cashPanel = document.getElementById('cash-payment-panel');
    const gcashPanel = document.getElementById('gcash-payment-panel');

    if (method === 'Cash') {
      cashPanel.style.display = 'block';
      gcashPanel.style.display = 'none';
    } else {
      cashPanel.style.display = 'none';
      gcashPanel.style.display = 'block';
    }

    this.updateCalculation();
  },

  setQuickCash(amount) {
    const summary = window.appStore.getCartSummary();
    if (amount === 'exact') {
      this.tenderedString = summary.totalDue;
    } else {
      this.tenderedString = String(amount);
    }
    this.updateCalculation();
  },

  handleKeypad(key) {
    if (key === 'clear') {
      this.tenderedString = '';
    } else if (key === 'backspace') {
      this.tenderedString = this.tenderedString.slice(0, -1);
    } else if (key === '.') {
      if (!this.tenderedString.includes('.')) {
        this.tenderedString += this.tenderedString === '' ? '0.' : '.';
      }
    } else {
      // Limit to 2 decimal places if dot exists
      if (this.tenderedString.includes('.')) {
        const parts = this.tenderedString.split('.');
        if (parts[1].length >= 2) return;
      }
      this.tenderedString += key;
    }
    this.updateCalculation();
  },

  updateCalculation() {
    const summary = window.appStore.getCartSummary();
    const totalDue = summary.rawTotal;

    const tenderedInput = document.getElementById('tendered-input');
    const changeDisplay = document.getElementById('change-amount-display');
    const completeBtn = document.getElementById('btn-confirm-payment');

    if (this.currentMethod === 'Cash') {
      tenderedInput.value = this.tenderedString ? `PHP ${this.tenderedString}` : 'PHP 0.00';
      const tenderedNum = parseFloat(this.tenderedString || '0');
      const change = tenderedNum - totalDue;

      if (change >= 0 && tenderedNum >= totalDue && totalDue > 0) {
        changeDisplay.textContent = `PHP ${change.toFixed(2)}`;
        changeDisplay.classList.remove('text-danger');
        changeDisplay.classList.add('text-success');
        completeBtn.disabled = false;
      } else {
        changeDisplay.textContent = change < 0 ? `-PHP ${Math.abs(change).toFixed(2)} (Insufficient)` : 'PHP 0.00';
        changeDisplay.classList.remove('text-success');
        changeDisplay.classList.add('text-danger');
        completeBtn.disabled = true;
      }
    } else {
      // GCash Method
      const gcashInput = document.getElementById('gcash-ref-input');
      const refVal = gcashInput ? gcashInput.value.trim() : '';
      this.gcashRefString = refVal;

      tenderedInput.value = `PHP ${summary.totalDue}`;
      changeDisplay.textContent = 'PHP 0.00 (Exact Digital Payment)';
      changeDisplay.classList.remove('text-danger');
      changeDisplay.classList.add('text-success');

      // Valid if reference number has at least 6 digits
      completeBtn.disabled = refVal.length < 6;
    }
  },

  confirmPayment() {
    const summary = window.appStore.getCartSummary();
    const totalDue = summary.rawTotal;

    let tendered = totalDue.toFixed(2);
    let change = '0.00';

    if (this.currentMethod === 'Cash') {
      const tenderedNum = parseFloat(this.tenderedString || '0');
      if (tenderedNum < totalDue) {
        alert('Insufficient cash tendered.');
        return;
      }
      tendered = tenderedNum.toFixed(2);
      change = (tenderedNum - totalDue).toFixed(2);
    }

    const paymentDetails = {
      method: this.currentMethod,
      tendered: tendered,
      change: change,
      gcashRef: this.currentMethod === 'GCash' ? this.gcashRefString : null
    };

    // Place order in store
    const completedOrder = window.appStore.placeOrder(paymentDetails);

    // Close checkout modal
    this.closeCheckout();

    // Open receipt modal
    this.showReceipt(completedOrder);
  },

  showReceipt(order) {
    window.ReceiptService.renderReceiptModal(order);
    this.activeOrder = order;

    if (this.receiptModal) {
      this.receiptModal.classList.add('modal-visible');
    }
  },

  closeReceipt() {
    if (this.receiptModal) {
      this.receiptModal.classList.remove('modal-visible');
    }
    this.activeOrder = null;
  },

  printReceipt() {
    if (this.activeOrder) {
      window.ReceiptService.printReceipt(this.activeOrder);
    }
  },

  bindEvents() {
    // Payment method tabs
    document.querySelectorAll('.payment-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPaymentMethod(btn.dataset.method);
      });
    });

    // Quick cash buttons
    document.querySelectorAll('.btn-quick-cash').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setQuickCash(btn.dataset.val);
      });
    });

    // Keypad buttons
    document.querySelectorAll('.btn-keypad').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleKeypad(btn.dataset.key);
      });
    });

    // GCash input event
    const gcashInput = document.getElementById('gcash-ref-input');
    if (gcashInput) {
      gcashInput.addEventListener('input', () => {
        this.updateCalculation();
      });
    }

    // Modal buttons
    const btnCancel = document.getElementById('btn-cancel-checkout');
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeCheckout());

    const btnConfirm = document.getElementById('btn-confirm-payment');
    if (btnConfirm) btnConfirm.addEventListener('click', () => this.confirmPayment());

    const btnCloseReceipt = document.getElementById('btn-close-receipt');
    if (btnCloseReceipt) btnCloseReceipt.addEventListener('click', () => this.closeReceipt());

    const btnPrintReceipt = document.getElementById('btn-print-receipt');
    if (btnPrintReceipt) btnPrintReceipt.addEventListener('click', () => this.printReceipt());
  }
};

window.CheckoutController = CheckoutController;
