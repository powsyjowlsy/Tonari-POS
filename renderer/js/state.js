// Central Reactive State Store with LocalStorage Persistence for Tonari POS

class Store {
  constructor() {
    this.STORAGE_KEYS = {
      PRODUCTS: 'tonari_pos_products',
      ORDERS: 'tonari_pos_orders',
      SETTINGS: 'tonari_pos_settings'
    };

    this.products = this.loadProducts();
    this.orders = this.loadOrders();
    this.cart = [];
    this.orderType = 'Dine-In';
    this.discountRate = 0; // 0 = none, 0.05 = student, 0.20 = senior/pwd
    this.discountLabel = 'None';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.activeView = 'pos'; // 'pos', 'kitchen', 'inventory', 'sales'
    this.deviceMode = 'auto'; // 'auto', 'desktop', 'tablet', 'mobile'
    this.isMobileCartOpen = false;

    this.listeners = [];
  }

  // Event Subscription System
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
        console.error('Store listener error:', err);
      }
    });
  }

  // Persistence Handlers
  loadProducts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read products from storage, using seed data:', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_PRODUCTS || []));
  }

  saveProducts() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }

  loadOrders() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read orders from storage:', e);
    }
    return [];
  }

  saveOrders() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }

  // Cart Operations
  addToCart(product) {
    const existing = this.cart.find(item => item.id === product.id);
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
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1
      });
    }

    this.notify('cart-updated', this.cart);
    return true;
  }

  updateQuantity(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    const product = this.products.find(p => p.id === productId);
    const maxStock = product ? product.stock : 999;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (newQty > maxStock) {
      this.notify('cart-error', `Max available stock is ${maxStock}.`);
      return;
    }

    item.quantity = newQty;
    this.notify('cart-updated', this.cart);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
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

  // Cart Totals Calculation (Fixed precision)
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

  // Stock Management Operations
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

  // Order Placement & Kitchen Operations
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

    // Clear cart
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

  // Device & Navigation Setters
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

window.appStore = new Store();
