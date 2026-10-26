// Central Reactive State Store with LocalStorage Persistence for Tonari POS
// Observes: Silent Failure Hunting (try/catch logging), Zero-Emoji, Educational Commenting
// Implements: SRS RTM-FR-001 (Flavor Selection), RTM-FR-005 (PIN Security), RTM-FR-007 (Cash Float), RTM-FR-009 (Waste Logger)

class Store {
  constructor() {
    // ------------------------------------------------------------------------
    // Persistence Storage Keys
    // ------------------------------------------------------------------------
    this.STORAGE_KEYS = {
      PRODUCTS: 'tonari_pos_products',
      ORDERS: 'tonari_pos_orders',
      SETTINGS: 'tonari_pos_settings',
      WASTE_LOGS: 'tonari_pos_waste_logs'
    };

    // Core In-Memory Domain State
    this.products = this.loadProducts();
    this.orders = this.loadOrders();
    this.settings = this.loadSettings();
    this.wasteLogs = this.loadWasteLogs();

    // Ephemeral Transaction State
    this.cart = [];
    this.orderType = 'Dine-In';
    this.discountRate = 0; // 0 = none, 0.05 = student, 0.20 = senior/pwd
    this.discountLabel = 'None';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.activeView = 'dashboard'; // Default to executive store performance dashboard
    this.deviceMode = 'auto'; // 'auto', 'desktop', 'tablet', 'mobile'
    this.isMobileCartOpen = false;

    // Security State (SRS RTM-FR-005)
    this.isManagerAuthenticated = false;
    this.failedPinAttempts = 0;

    // Reactive Observer Listeners
    this.listeners = [];
  }

  // --------------------------------------------------------------------------
  // Reactive Event Subscription Bus
  // --------------------------------------------------------------------------
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Store listener execution error on event:', event, err);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Persistence Handlers (with Silent Failure Hunting & Safe Fallbacks)
  // --------------------------------------------------------------------------
  loadProducts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse products from localStorage, falling back to seed catalog:', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_PRODUCTS || []));
  }

  saveProducts() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error('Failed to persist products to localStorage:', e);
    }
  }

  loadOrders() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse orders from localStorage:', e);
    }
    return [];
  }

  saveOrders() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error('Failed to persist orders to localStorage:', e);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse settings, using defaults:', e);
    }
    return {
      storeName: 'Tonari',
      branch: 'Tibanga, Iligan City',
      managerPin: '1234',
      openingFloat: 1000.00,
      autoPrintReceipt: true,
      soundNotifications: false
    };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to persist settings to localStorage:', e);
    }
  }

  loadWasteLogs() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WASTE_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse waste logs from localStorage:', e);
    }
    return [];
  }

  saveWasteLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.WASTE_LOGS, JSON.stringify(this.wasteLogs));
    } catch (e) {
      console.error('Failed to persist waste logs to localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Cart Operations with Flavor & Modifier Support (SRS RTM-FR-001)
  // --------------------------------------------------------------------------
  addToCart(product, selectedFlavor = null) {
    const flavor = selectedFlavor || (product.modifiers && product.modifiers.length > 0 ? product.modifiers[0] : null);
    const cartKey = flavor ? `${product.id}__${flavor}` : product.id;

    // Check if matching line item (same SKU and same flavor) already exists in cart
    const existing = this.cart.find(item => item.cartKey === cartKey || (!item.cartKey && item.id === product.id && item.flavor === flavor));
    const stockAvailable = product.stock;

    if (existing) {
      if (existing.quantity + 1 > stockAvailable) {
        this.notify('cart-error', `Cannot add more. Only ${stockAvailable} in stock.`);
        return false;
      }
      existing.quantity += 1;
    } else {
      if (stockAvailable <= 0) {
        this.notify('cart-error', `"${product.name}" is currently out of stock.`);
        return false;
      }
      this.cart.push({
        cartKey: cartKey,
        id: product.id,
        name: product.name,
        flavor: flavor,
        category: product.category,
        price: product.price,
        quantity: 1
      });
    }

    this.notify('cart-updated', this.cart);
    return true;
  }

  updateQuantity(itemKey, delta) {
    const item = this.cart.find(i => i.cartKey === itemKey || i.id === itemKey);
    if (!item) return;

    const product = this.products.find(p => p.id === item.id);
    const maxStock = product ? product.stock : 999;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(item.cartKey || item.id);
      return;
    }

    if (newQty > maxStock) {
      this.notify('cart-error', `Max available stock for "${item.name}" is ${maxStock}.`);
      return;
    }

    item.quantity = newQty;
    this.notify('cart-updated', this.cart);
  }

  removeFromCart(itemKey) {
    this.cart = this.cart.filter(item => (item.cartKey || item.id) !== itemKey);
    this.notify('cart-updated', this.cart);
  }

  clearCart() {
    this.cart = [];
    this.notify('cart-updated', this.cart);
  }

  setOrderType(type) {
    this.orderType = type;
    this.notify('order-type-changed', type);
  }

  setDiscount(rate, label) {
    this.discountRate = rate;
    this.discountLabel = label;
    this.notify('cart-updated', this.cart);
  }

  // --------------------------------------------------------------------------
  // Financial Computation (Centavo Accuracy & Fixed Precision)
  // --------------------------------------------------------------------------
  getCartSummary() {
    const subtotal = this.cart.reduce((acc, item) => {
      return acc + (Math.round(item.price * 100) * item.quantity);
    }, 0) / 100;

    const discountAmount = Math.round(subtotal * this.discountRate * 100) / 100;
    const totalDue = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const totalItems = this.cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      discountLabel: this.discountLabel,
      totalDue: totalDue.toFixed(2),
      rawTotal: totalDue,
      totalItems: totalItems
    };
  }

  // --------------------------------------------------------------------------
  // Inventory Stock & Kitchen Waste Tracking (SRS RTM-FR-002, RTM-FR-009)
  // --------------------------------------------------------------------------
  deductStockFromCart() {
    this.cart.forEach(cartItem => {
      const prod = this.products.find(p => p.id === cartItem.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      }
    });
    this.saveProducts();
    this.notify('products-updated', this.products);
  }

  replenishStock(productId, amount) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.stock += amount;
      this.saveProducts();
      this.notify('products-updated', this.products);
    }
  }

  updateProductDetails(productId, newPrice, newMinStock) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.price = Math.round(parseFloat(newPrice) * 100) / 100;
      prod.minStock = parseInt(newMinStock, 10) || 5;
      this.saveProducts();
      this.notify('products-updated', this.products);
    }
  }

  logKitchenWaste(productId, quantity, reason, notes) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return false;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return false;

    // Deduct physical inventory
    prod.stock = Math.max(0, prod.stock - qty);
    this.saveProducts();

    // Record audit log
    const now = new Date();
    const wasteEntry = {
      id: 'WST-' + (1000 + this.wasteLogs.length + 1),
      date: now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: now.toISOString(),
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitPrice: prod.price,
      costLost: (qty * prod.price).toFixed(2),
      reason: reason || 'Dropped / Spilled',
      notes: notes || 'Logged by kitchen staff'
    };

    this.wasteLogs.unshift(wasteEntry);
    this.saveWasteLogs();

    this.notify('products-updated', this.products);
    this.notify('waste-logs-updated', this.wasteLogs);
    return true;
  }

  // --------------------------------------------------------------------------
  // Cash Drawer Float & Variance Reconciliation (SRS RTM-FR-007)
  // --------------------------------------------------------------------------
  getCashDrawerSummary(countedCashInput = null) {
    const activeOrders = this.orders.filter(o => o.status !== 'Voided');
    const cashSales = activeOrders
      .filter(o => o.paymentMethod === 'Cash')
      .reduce((sum, o) => sum + parseFloat(o.totalDue), 0);
    const gcashSales = activeOrders
      .filter(o => o.paymentMethod === 'GCash')
      .reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

    const openingFloat = parseFloat(this.settings.openingFloat || 1000.00);
    const expectedCashInDrawer = openingFloat + cashSales;

    let countedCash = null;
    let variance = null;
    let varianceStatus = 'Uncounted'; // 'Balanced', 'Over', 'Short'

    if (countedCashInput !== null && countedCashInput !== '') {
      countedCash = parseFloat(countedCashInput) || 0;
      variance = countedCash - expectedCashInDrawer;
      if (Math.abs(variance) < 0.01) {
        varianceStatus = 'Balanced';
      } else if (variance > 0) {
        varianceStatus = 'Over';
      } else {
        varianceStatus = 'Short';
      }
    }

    return {
      openingFloat: openingFloat.toFixed(2),
      cashSales: cashSales.toFixed(2),
      gcashSales: gcashSales.toFixed(2),
      expectedCash: expectedCashInDrawer.toFixed(2),
      countedCash: countedCash !== null ? countedCash.toFixed(2) : null,
      variance: variance !== null ? variance.toFixed(2) : null,
      varianceStatus: varianceStatus
    };
  }

  // --------------------------------------------------------------------------
  // Weekly 7-Day Performance Trend Aggregation (Dashboard Feature)
  // --------------------------------------------------------------------------
  getWeeklySalesTrend() {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const formattedDate = d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const shortDay = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateSub = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Match orders for that day
      const dayOrders = this.orders.filter(o => o.status !== 'Voided' && o.date === formattedDate);
      const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

      days.push({
        dateStr: formattedDate,
        dayLabel: shortDay,
        dateSub: dateSub,
        revenue: revenue,
        count: dayOrders.length
      });
    }

    return days;
  }

  // --------------------------------------------------------------------------
  // Manager Security & PIN Verification (SRS RTM-FR-005, RTM-NFR-003)
  // --------------------------------------------------------------------------
  verifyManagerPin(inputPin) {
    const targetPin = this.settings.managerPin || '1234';
    if (inputPin === targetPin) {
      this.isManagerAuthenticated = true;
      this.failedPinAttempts = 0;
      return true;
    }
    this.failedPinAttempts += 1;
    return false;
  }

  lockTerminal() {
    this.isManagerAuthenticated = false;
    this.notify('terminal-locked', true);
  }

  // --------------------------------------------------------------------------
  // Order Placement & Kitchen Operations
  // --------------------------------------------------------------------------
  placeOrder(paymentDetails) {
    const summary = this.getCartSummary();
    const orderNumber = 'TN-' + (1000 + this.orders.length + 1);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newOrder = {
      id: orderNumber,
      orderType: this.orderType,
      items: JSON.parse(JSON.stringify(this.cart)),
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      discountLabel: summary.discountLabel,
      totalDue: summary.totalDue,
      paymentMethod: paymentDetails.method,
      amountTendered: paymentDetails.tendered,
      changeDue: paymentDetails.change,
      gcashRef: paymentDetails.gcashRef || null,
      status: 'Pending', // 'Pending', 'Preparing', 'Ready', 'Completed', 'Voided'
      date: dateFormatted,
      time: timeFormatted,
      timestamp: now.toISOString(),
      cashier: 'Staff Lane 1',
      voidReason: null
    };

    // Deduct physical inventory
    this.deductStockFromCart();

    // Store in order history
    this.orders.unshift(newOrder);
    this.saveOrders();

    // Clear cart and close drawer
    this.clearCart();
    this.isMobileCartOpen = false;

    this.notify('order-placed', newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders();
      this.notify('orders-updated', this.orders);
    }
  }

  voidOrder(orderId, reason) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || order.status === 'Voided') return false;

    order.status = 'Voided';
    order.voidReason = reason || 'Customer request / cashier void';

    // Restore stock back to inventory
    order.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.id);
      if (prod) {
        prod.stock += item.quantity;
      }
    });

    this.saveProducts();
    this.saveOrders();

    this.notify('products-updated', this.products);
    this.notify('orders-updated', this.orders);
    return true;
  }

  // --------------------------------------------------------------------------
  // Navigation & Viewport Setters
  // --------------------------------------------------------------------------
  setView(viewName) {
    this.activeView = viewName;
    this.notify('view-changed', viewName);
  }

  setDeviceMode(mode) {
    this.deviceMode = mode;
    this.notify('device-mode-changed', mode);
  }

  setCategory(catId) {
    this.activeCategory = catId;
    this.notify('category-changed', catId);
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notify('search-changed', query);
  }

  toggleMobileCart(isOpen) {
    this.isMobileCartOpen = typeof isOpen === 'boolean' ? isOpen : !this.isMobileCartOpen;
    this.notify('mobile-cart-toggled', this.isMobileCartOpen);
  }
}

// Instantiate global store
window.appStore = new Store();
