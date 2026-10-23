// Cashier POS Catalog, Product Grid & Cart Controller for Tonari POS

const PosController = {
  init() {
    this.categoryNav = document.getElementById('category-pills-nav');
    this.productGrid = document.getElementById('product-catalog-grid');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartMobileItemsList = document.getElementById('mobile-cart-items-list');

    this.bindEvents();
    this.renderCategories();
    this.renderProducts();
    this.renderCart();

    window.appStore.subscribe((event) => {
      if (event === 'products-updated') {
        this.renderProducts();
        this.renderCart();
      } else if (event === 'cart-updated' || event === 'order-type-changed') {
        this.renderCart();
      } else if (event === 'category-changed') {
        this.renderCategories();
        this.renderProducts();
      } else if (event === 'search-changed') {
        this.renderProducts();
      } else if (event === 'cart-error') {
        alert(event);
      }
    });
  },

  renderCategories() {
    if (!this.categoryNav) return;

    const categories = window.DEFAULT_CATEGORIES || [];
    const active = window.appStore.activeCategory;

    let html = '';
    categories.forEach(cat => {
      const isActive = cat.id === active;
      html += `
        <button class="category-pill ${isActive ? 'active' : ''}" data-id="${cat.id}">
          ${cat.name}
        </button>
      `;
    });

    this.categoryNav.innerHTML = html;

    this.categoryNav.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        window.appStore.setCategory(btn.dataset.id);
      });
    });
  },

  renderProducts() {
    if (!this.productGrid) return;

    let products = window.appStore.products.slice();
    const activeCat = window.appStore.activeCategory;
    const query = window.appStore.searchQuery.toLowerCase();

    if (activeCat !== 'all') {
      products = products.filter(p => p.category === activeCat);
    }

    if (query) {
      products = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    if (products.length === 0) {
      this.productGrid.innerHTML = `
        <div class="empty-products-msg">
          <div class="font-bold text-main">No products found</div>
          <div class="text-sub font-small">Try selecting another category or clear search.</div>
        </div>
      `;
      return;
    }

    let html = '';
    products.forEach(p => {
      const isOutOfStock = p.stock <= 0;
      const isLowStock = p.stock > 0 && p.stock <= p.minStock;

      let stockBadge = '';
      if (isOutOfStock) {
        stockBadge = '<span class="product-stock-badge stock-out">Out of Stock</span>';
      } else if (isLowStock) {
        stockBadge = `<span class="product-stock-badge stock-low">Low Stock (${p.stock})</span>`;
      } else {
        stockBadge = `<span class="product-stock-badge stock-ok">${p.stock} in stock</span>`;
      }

      html += `
        <div class="product-card ${isOutOfStock ? 'card-disabled' : ''}" data-id="${p.id}">
          <div class="product-card-top">
            <span class="product-cat-tag">${p.categoryName || p.category}</span>
            ${stockBadge}
          </div>
          <div class="product-title">${p.name}</div>
          <div class="product-desc">${p.description}</div>
          <div class="product-footer">
            <span class="product-price tabular-price">PHP ${p.price.toFixed(2)}</span>
            <button class="btn-add-item ${isOutOfStock ? 'disabled' : ''}" ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? 'Sold Out' : 'Tap to Add'}
            </button>
          </div>
        </div>
      `;
    });

    this.productGrid.innerHTML = html;

    // Attach card click handlers
    this.productGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const prodId = card.dataset.id;
        const prod = window.appStore.products.find(p => p.id === prodId);
        if (prod && prod.stock > 0) {
          window.appStore.addToCart(prod);
        }
      });
    });
  },

  renderCart() {
    const cart = window.appStore.cart;
    const summary = window.appStore.getCartSummary();
    const orderType = window.appStore.orderType;

    // Update order type toggle buttons
    document.querySelectorAll('.btn-order-type').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === orderType);
    });

    // Populate order summary numbers
    document.querySelectorAll('.cart-subtotal-val').forEach(el => el.textContent = `PHP ${summary.subtotal}`);
    document.querySelectorAll('.cart-discount-val').forEach(el => el.textContent = `-PHP ${summary.discountAmount}`);
    document.querySelectorAll('.cart-total-val').forEach(el => el.textContent = `PHP ${summary.totalDue}`);
    document.querySelectorAll('.cart-total-items-val').forEach(el => el.textContent = `${summary.totalItems} items`);

    // Mobile peek bar
    const mobilePeekItems = document.getElementById('mobile-peek-items-count');
    const mobilePeekTotal = document.getElementById('mobile-peek-total-amount');
    if (mobilePeekItems) mobilePeekItems.textContent = `${summary.totalItems} Items`;
    if (mobilePeekTotal) mobilePeekTotal.textContent = `PHP ${summary.totalDue}`;

    // Enable/disable checkout button
    const isCartEmpty = cart.length === 0;
    document.querySelectorAll('.btn-proceed-checkout').forEach(btn => {
      btn.disabled = isCartEmpty;
      btn.textContent = isCartEmpty ? 'Cart is Empty' : `Charge PHP ${summary.totalDue}`;
    });

    // Generate cart item rows
    let itemsHtml = '';
    if (cart.length === 0) {
      itemsHtml = `
        <div class="empty-cart-state">
          <div class="empty-cart-title">Order is Empty</div>
          <div class="empty-cart-sub">Tap items on the catalog to build an order.</div>
        </div>
      `;
    } else {
      cart.forEach(item => {
        const lineTotal = (item.price * item.quantity).toFixed(2);
        itemsHtml += `
          <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-unit-price tabular-price">PHP ${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-qty-controls">
              <button class="btn-qty-mod btn-qty-minus" data-id="${item.id}">-</button>
              <span class="cart-item-qty tabular-price">${item.quantity}</span>
              <button class="btn-qty-mod btn-qty-plus" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-line-total tabular-price">PHP ${lineTotal}</div>
            <button class="btn-remove-item" data-id="${item.id}" title="Remove item">X</button>
          </div>
        `;
      });
    }

    if (this.cartItemsList) {
      this.cartItemsList.innerHTML = itemsHtml;
      this.bindCartRowEvents(this.cartItemsList);
    }

    if (this.cartMobileItemsList) {
      this.cartMobileItemsList.innerHTML = itemsHtml;
      this.bindCartRowEvents(this.cartMobileItemsList);
    }
  },

  bindCartRowEvents(container) {
    container.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.appStore.updateQuantity(btn.dataset.id, -1);
      });
    });

    container.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.appStore.updateQuantity(btn.dataset.id, 1);
      });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.appStore.removeFromCart(btn.dataset.id);
      });
    });
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('pos-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        window.appStore.setSearchQuery(e.target.value.trim());
      });
    }

    // Order type toggles
    document.querySelectorAll('.btn-order-type').forEach(btn => {
      btn.addEventListener('click', () => {
        window.appStore.setOrderType(btn.dataset.type);
      });
    });

    // Discount selectors
    const discountSelect = document.getElementById('cart-discount-select');
    if (discountSelect) {
      discountSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'student') {
          window.appStore.setDiscount(0.05, 'Student (5%)');
        } else if (val === 'pwd_senior') {
          window.appStore.setDiscount(0.20, 'Senior/PWD (20%)');
        } else {
          window.appStore.setDiscount(0, 'None');
        }
      });
    }

    // Clear cart buttons
    document.querySelectorAll('.btn-clear-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.appStore.cart.length > 0 && confirm('Are you sure you want to clear the entire order?')) {
          window.appStore.clearCart();
        }
      });
    });

    // Checkout buttons
    document.querySelectorAll('.btn-proceed-checkout').forEach(btn => {
      btn.addEventListener('click', () => {
        window.CheckoutController.openCheckout();
      });
    });

    // Mobile peek bar click (opens mobile cart sheet)
    const mobilePeekBar = document.getElementById('mobile-cart-peek-bar');
    if (mobilePeekBar) {
      mobilePeekBar.addEventListener('click', () => {
        window.appStore.toggleMobileCart(true);
      });
    }

    // Close mobile cart button
    const btnCloseMobileCart = document.getElementById('btn-close-mobile-cart');
    if (btnCloseMobileCart) {
      btnCloseMobileCart.addEventListener('click', () => {
        window.appStore.toggleMobileCart(false);
      });
    }
  }
};

window.PosController = PosController;
