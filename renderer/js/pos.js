// Cashier POS Catalog, Product Grid & Cart Controller for Tonari POS
// Implements: SRS RTM-FR-001 (Touchscreen Order Cart & Flavor Selection)
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const PosController = {
  selectedProductForModifier: null,

  init() {
    this.categoryNav = document.getElementById('category-pills-nav');
    this.productGrid = document.getElementById('product-catalog-grid');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartMobileItemsList = document.getElementById('mobile-cart-items-list');
    this.modifierModal = document.getElementById('modifier-modal');

    this.bindEvents();
    this.renderCategories();
    this.renderProducts();
    this.renderCart();

    window.appStore.subscribe((event, payload) => {
      if (event === 'products-updated') {
        this.renderProducts();
        this.renderCart();
      } else if (event === 'ingredients-updated') {
        this.renderProducts();
      } else if (event === 'cart-updated' || event === 'order-type-changed') {
        this.renderCart();
      } else if (event === 'category-changed') {
        this.renderCategories();
        this.renderProducts();
      } else if (event === 'search-changed') {
        this.renderProducts();
      } else if (event === 'cart-error') {
        this.showCartNotification(payload || 'Cannot add item to cart: Insufficient stock.');
      }
    });
  },

  showCartNotification(msg) {
    let toast = document.getElementById('pos-cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pos-cart-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = 'var(--status-red, #B91C1C)';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '10px 16px';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.zIndex = '9999';
      toast.style.fontWeight = '600';
      toast.style.fontSize = '13px';
      toast.style.transition = 'opacity 0.2s ease';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 200);
      }
    }, 3500);
  },

  bindEvents() {
    // Search input filtering
    const searchInput = document.getElementById('pos-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        window.appStore.setSearchQuery(e.target.value.trim());
      });
    }

    // Order Type switch buttons (Dine-In vs Take-Out)
    document.querySelectorAll('.btn-order-type').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-order-type').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.appStore.setOrderType(btn.dataset.type);
      });
    });

    // Discount dropdown selector
    const discountSelect = document.getElementById('cart-discount-select');
    if (discountSelect) {
      discountSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'student') {
          window.appStore.setDiscount(0.05, 'Student (5%)');
        } else if (val === 'pwd_senior') {
          window.appStore.setDiscount(0.20, 'Senior / PWD (20%)');
        } else {
          window.appStore.setDiscount(0, 'None');
        }
      });
    }

    // Clear cart buttons (Desktop & Mobile)
    document.querySelectorAll('.btn-clear-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.appStore.cart.length > 0) {
          if (confirm('Are you sure you want to clear the entire cart?')) {
            window.appStore.clearCart();
          }
        }
      });
    });

    // Proceed to checkout buttons
    document.querySelectorAll('.btn-proceed-checkout').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.CheckoutController) {
          window.CheckoutController.openCheckout();
        }
      });
    });

    // Mobile Bottom Peek Bar (opens drawer sheet)
    const peekBar = document.getElementById('mobile-cart-peek-bar');
    if (peekBar) {
      peekBar.addEventListener('click', () => {
        window.appStore.toggleMobileCart(true);
      });
    }

    // Mobile Cart Drawer Close button
    const btnCloseDrawer = document.getElementById('btn-close-mobile-cart');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        window.appStore.toggleMobileCart(false);
      });
    }

    // Modifier Modal Close & Confirmation
    const btnCloseMod = document.getElementById('btn-close-modifier-modal');
    if (btnCloseMod) {
      btnCloseMod.addEventListener('click', () => {
        this.closeModifierModal();
      });
    }
  },

  // --------------------------------------------------------------------------
  // Modifier Modal Handling (SRS RTM-FR-001)
  // --------------------------------------------------------------------------
  openModifierModal(product) {
    this.selectedProductForModifier = product;
    if (!this.modifierModal) return;

    document.getElementById('mod-product-name').textContent = product.name;
    document.getElementById('mod-product-price').textContent = `PHP ${product.price.toFixed(2)}`;

    const optionsContainer = document.getElementById('mod-options-container');
    if (optionsContainer && product.modifiers) {
      let optionsHtml = '';
      product.modifiers.forEach((mod, idx) => {
        optionsHtml += `
          <button class="modifier-option-btn ${idx === 0 ? 'active' : ''}" data-flavor="${mod}">
            <span>${mod}</span>
            <span class="modifier-check-indicator">Selected</span>
          </button>
        `;
      });
      optionsContainer.innerHTML = optionsHtml;

      // Handle modifier option clicks
      optionsContainer.querySelectorAll('.modifier-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          optionsContainer.querySelectorAll('.modifier-option-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    // Bind Add to Cart with selected flavor
    const btnConfirmAdd = document.getElementById('btn-confirm-modifier-add');
    if (btnConfirmAdd) {
      btnConfirmAdd.onclick = () => {
        const prod = this.selectedProductForModifier;
        if (!prod) return;

        const portions = typeof window.appStore.computeAvailablePortions === 'function'
          ? window.appStore.computeAvailablePortions(prod.id)
          : (prod.stock !== undefined ? prod.stock : 0);

        const currentCartQty = window.appStore.cart
          .filter(item => item.id === prod.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (currentCartQty >= portions) {
          window.appStore.notify('cart-error', `Cannot add more "${prod.name}". Maximum available portions (${portions}) already in cart.`);
          this.closeModifierModal();
          return;
        }

        const activeOption = optionsContainer ? optionsContainer.querySelector('.modifier-option-btn.active') : null;
        const selectedFlavor = activeOption ? activeOption.dataset.flavor : (prod.modifiers ? prod.modifiers[0] : null);
        window.appStore.addToCart(prod, selectedFlavor);
        this.closeModifierModal();
      };
    }

    this.modifierModal.classList.add('modal-visible');
  },

  closeModifierModal() {
    if (this.modifierModal) {
      this.modifierModal.classList.remove('modal-visible');
    }
    this.selectedProductForModifier = null;
  },

  // --------------------------------------------------------------------------
  // Category Navigation Pills Rendering
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Product Catalog Grid Rendering
  // --------------------------------------------------------------------------
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
          <div class="text-sub font-small">Try selecting another category or clear search filter.</div>
        </div>
      `;
      return;
    }

    let html = '';
    products.forEach(p => {
      // Calculate real-time available portions using limiting bottleneck formula
      const portions = typeof window.appStore.computeAvailablePortions === 'function'
        ? window.appStore.computeAvailablePortions(p.id)
        : (p.stock !== undefined ? p.stock : 0);

      const isOutOfStock = portions <= 0;
      const isLowStock = portions > 0 && portions <= (p.minStock || 5);

      let stockBadge = '';
      if (isOutOfStock) {
        stockBadge = '<span class="product-stock-badge stock-out badge badge-sold-out">Sold Out</span>';
      } else if (isLowStock) {
        stockBadge = `<span class="product-stock-badge stock-low badge badge-low">Low Stock (<span class="tabular-nums">${portions}</span>)</span>`;
      } else {
        stockBadge = `<span class="product-stock-badge stock-ok badge badge-stock"><span class="tabular-nums">${portions}</span> in stock</span>`;
      }

      const hasModifiers = p.modifiers && p.modifiers.length > 0;
      const modifierPill = hasModifiers 
        ? `<span class="flavor-count-pill">${p.modifiers.length} Options</span>`
        : '';

      html += `
        <div class="product-card ${isOutOfStock ? 'card-disabled' : ''}" data-id="${p.id}" ${isOutOfStock ? 'aria-disabled="true"' : ''}>
          <div class="product-card-top">
            <span class="product-cat-tag">${p.categoryName || p.category}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              ${modifierPill}
              ${stockBadge}
            </div>
          </div>
          <div class="product-title">${p.name}</div>
          <div class="product-desc">${p.description}</div>
          <div class="product-footer">
            <span class="product-price tabular-price">PHP ${p.price.toFixed(2)}</span>
            <button class="btn-add-item ${isOutOfStock ? 'disabled' : ''}" ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? 'Sold Out' : (hasModifiers ? 'Customize' : 'Tap to Add')}
            </button>
          </div>
        </div>
      `;
    });

    this.productGrid.innerHTML = html;

    // Attach card click handlers with modifier gate and stock gating
    this.productGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const prodId = card.dataset.id;
        const prod = window.appStore.products.find(p => p.id === prodId);
        if (!prod) return;

        const portions = typeof window.appStore.computeAvailablePortions === 'function'
          ? window.appStore.computeAvailablePortions(prodId)
          : (prod.stock !== undefined ? prod.stock : 0);

        if (portions <= 0) {
          window.appStore.notify('cart-error', `"${prod.name}" is currently sold out.`);
          return;
        }

        const currentCartQty = window.appStore.cart
          .filter(item => item.id === prodId)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (currentCartQty >= portions) {
          window.appStore.notify('cart-error', `Cannot add more "${prod.name}". All ${portions} available portion(s) are already in your cart.`);
          return;
        }

        if (prod.modifiers && prod.modifiers.length > 0) {
          this.openModifierModal(prod);
        } else {
          window.appStore.addToCart(prod);
        }
      });
    });
  },

  // --------------------------------------------------------------------------
  // Cart Items & Financial Summary Rendering
  // --------------------------------------------------------------------------
  renderCart() {
    const cart = window.appStore.cart;
    const summary = window.appStore.getCartSummary();
    const orderType = window.appStore.orderType;

    // Update order type buttons active state
    document.querySelectorAll('.btn-order-type').forEach(b => {
      b.classList.toggle('active', b.dataset.type === orderType);
    });

    // Update financial summary values in both desktop and mobile carts
    document.querySelectorAll('.cart-subtotal-val').forEach(el => {
      el.textContent = `PHP ${summary.subtotal}`;
    });
    document.querySelectorAll('.cart-total-val').forEach(el => {
      el.textContent = `PHP ${summary.totalDue}`;
    });
    document.querySelectorAll('.cart-total-items-val').forEach(el => {
      el.textContent = `${summary.totalItems} items`;
    });
    document.querySelectorAll('.cart-discount-val').forEach(el => {
      el.textContent = summary.discountAmount !== '0.00' ? `-PHP ${summary.discountAmount}` : '-PHP 0.00';
    });

    // Update checkout button states
    document.querySelectorAll('.btn-proceed-checkout').forEach(btn => {
      btn.disabled = cart.length === 0;
      btn.textContent = cart.length === 0 
        ? 'Cart is Empty' 
        : `Pay PHP ${summary.totalDue}`;
    });

    // Update mobile persistent peek bar values
    const peekCount = document.getElementById('mobile-peek-items-count');
    const peekTotal = document.getElementById('mobile-peek-total-amount');
    if (peekCount) peekCount.textContent = `${summary.totalItems} Items`;
    if (peekTotal) peekTotal.textContent = `PHP ${summary.totalDue}`;

    // Render itemized cart rows
    const renderItemsHtml = () => {
      if (cart.length === 0) {
        return `
          <div class="cart-empty-state">
            <div class="font-bold text-main" style="margin-bottom: 4px;">Order cart is empty</div>
            <div class="text-sub font-small">Select menu items from the catalog to build an order.</div>
          </div>
        `;
      }

      let html = '';
      cart.forEach(item => {
        const itemLineTotal = (item.price * item.quantity).toFixed(2);
        const itemKey = item.cartKey || item.id;
        const flavorTag = item.flavor 
          ? `<div class="cart-item-flavor text-sub font-small">Option: <strong>${item.flavor}</strong></div>`
          : '';

        html += `
          <div class="cart-item-row" data-key="${itemKey}">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              ${flavorTag}
              <div class="cart-item-price-unit tabular-price text-sub font-small">
                PHP ${item.price.toFixed(2)} each
              </div>
            </div>

            <div class="cart-item-actions">
              <div class="cart-item-stepper">
                <button class="btn-qty-minus" data-key="${itemKey}">-</button>
                <span class="cart-item-qty tabular-numbers">${item.quantity}</span>
                <button class="btn-qty-plus" data-key="${itemKey}">+</button>
              </div>

              <div class="cart-item-line-total tabular-price">
                PHP ${itemLineTotal}
              </div>

              <button class="btn-remove-line" data-key="${itemKey}" title="Remove item">&times;</button>
            </div>
          </div>
        `;
      });
      return html;
    };

    const itemsContent = renderItemsHtml();
    if (this.cartItemsList) this.cartItemsList.innerHTML = itemsContent;
    if (this.cartMobileItemsList) this.cartMobileItemsList.innerHTML = itemsContent;

    // Attach quantity stepper and remove button handlers
    const attachCartActions = (container) => {
      if (!container) return;
      container.querySelectorAll('.btn-qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          window.appStore.updateQuantity(btn.dataset.key, -1);
        });
      });
      container.querySelectorAll('.btn-qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          window.appStore.updateQuantity(btn.dataset.key, 1);
        });
      });
      container.querySelectorAll('.btn-remove-line').forEach(btn => {
        btn.addEventListener('click', () => {
          window.appStore.removeFromCart(btn.dataset.key);
        });
      });
    };

    attachCartActions(this.cartItemsList);
    attachCartActions(this.cartMobileItemsList);
  }
};

window.PosController = PosController;
