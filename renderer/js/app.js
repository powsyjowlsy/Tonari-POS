// Main Application Bootstrap & Viewport Orchestrator for Tonari POS
// Observes: Zero-Emoji Invariant, Modular Orchestration, Educational Commenting

document.addEventListener('DOMContentLoaded', async () => {
  // --------------------------------------------------------------------------
  // 1. Initial Demonstration Data Seeding (if brand new local installation)
  // --------------------------------------------------------------------------
  if (window.appStore.orders.length === 0) {
    const today = new Date();
    const formatDay = (daysAgo) => {
      const d = new Date(today);
      d.setDate(today.getDate() - daysAgo);
      return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const historicalOrders = [
      {
        id: 'TN-1001',
        orderType: 'Dine-In',
        items: [
          { id: 'TN-CUR-01', name: 'Chicken Katsu Curry', flavor: 'Spicy Curry', category: 'curry', price: 110.00, quantity: 2 },
          { id: 'TN-SDA-01', name: 'Green Apple Fruit Soda (16oz)', flavor: 'Standard Ice', category: 'soda', price: 39.00, quantity: 2 }
        ],
        subtotal: '298.00',
        discountAmount: '0.00',
        discountLabel: 'None',
        totalDue: '298.00',
        paymentMethod: 'Cash',
        amountTendered: '300.00',
        changeDue: '2.00',
        status: 'Completed',
        date: formatDay(5),
        time: '12:15:00 PM',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        cashier: 'Staff Lane 1'
      },
      {
        id: 'TN-1002',
        orderType: 'Take-Out',
        items: [
          { id: 'TN-TAK-02', name: 'Classic Octopus Takoyaki (8 pcs)', flavor: 'Cheesy Drizzle', category: 'takoyaki', price: 95.00, quantity: 2 },
          { id: 'TN-WNG-01', name: 'Ninja Wings Rice Meal (3 pcs)', flavor: 'Sweet Teriyaki Glaze', category: 'wings', price: 99.00, quantity: 1 }
        ],
        subtotal: '289.00',
        discountAmount: '0.00',
        discountLabel: 'None',
        totalDue: '289.00',
        paymentMethod: 'GCash',
        amountTendered: '289.00',
        changeDue: '0.00',
        gcashRef: '1008291048201',
        status: 'Completed',
        date: formatDay(4),
        time: '01:45:00 PM',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        cashier: 'Staff Lane 1'
      },
      {
        id: 'TN-1003',
        orderType: 'Dine-In',
        items: [
          { id: 'TN-RAM-01', name: 'Tonkotsu Rich Broth Ramen', flavor: 'Regular Broth', category: 'ramen', price: 120.00, quantity: 2 },
          { id: 'TN-GYO-01', name: 'Pan-Fried Pork Gyoza (4 pcs)', flavor: 'Ponzu Dip', category: 'gyoza', price: 55.00, quantity: 1 }
        ],
        subtotal: '295.00',
        discountAmount: '14.75',
        discountLabel: 'Student (5%)',
        totalDue: '280.25',
        paymentMethod: 'Cash',
        amountTendered: '500.00',
        changeDue: '219.75',
        status: 'Completed',
        date: formatDay(2),
        time: '06:30:00 PM',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        cashier: 'Staff Lane 1'
      },
      {
        id: 'TN-1004',
        orderType: 'Dine-In',
        items: [
          { id: 'TN-CUR-02', name: 'Pork Katsu Curry', flavor: 'Mild Curry', category: 'curry', price: 125.00, quantity: 1 },
          { id: 'TN-TAK-01', name: 'Classic Octopus Takoyaki (4 pcs)', flavor: 'Classic Glaze', category: 'takoyaki', price: 50.00, quantity: 1 }
        ],
        subtotal: '175.00',
        discountAmount: '0.00',
        discountLabel: 'None',
        totalDue: '175.00',
        paymentMethod: 'Cash',
        amountTendered: '200.00',
        changeDue: '25.00',
        status: 'Completed',
        date: formatDay(0),
        time: '11:20:00 AM',
        timestamp: new Date().toISOString(),
        cashier: 'Staff Lane 1'
      },
      {
        id: 'TN-1005',
        orderType: 'Take-Out',
        items: [
          { id: 'TN-RAM-02', name: 'Spicy Miso Ramen', flavor: 'Medium Heat', category: 'ramen', price: 125.00, quantity: 1 },
          { id: 'TN-SDA-02', name: 'Strawberry Lychee Soda (16oz)', flavor: 'Less Ice', category: 'soda', price: 39.00, quantity: 1 }
        ],
        subtotal: '164.00',
        discountAmount: '0.00',
        discountLabel: 'None',
        totalDue: '164.00',
        paymentMethod: 'GCash',
        amountTendered: '164.00',
        changeDue: '0.00',
        gcashRef: '1092837465012',
        status: 'Preparing',
        date: formatDay(0),
        time: '12:05:00 PM',
        timestamp: new Date().toISOString(),
        cashier: 'Staff Lane 1'
      }
    ];

    window.appStore.orders = historicalOrders;
    window.appStore.saveOrders();

    historicalOrders.forEach(o => {
      o.items.forEach(i => {
        const prod = window.appStore.products.find(p => p.id === i.id);
        if (prod) prod.stock = Math.max(0, prod.stock - i.quantity);
      });
    });
    window.appStore.saveProducts();

    // Pre-populate cart with sample item
    window.appStore.addToCart(window.appStore.products[0], 'Mild Curry');
    window.appStore.addToCart(window.appStore.products[3], 'Classic Glaze');
  }

  // --------------------------------------------------------------------------
  // In-App Modern Toast Notification Engine
  // --------------------------------------------------------------------------
  const ToastManager = {
    container: document.getElementById('toast-container'),

    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
      }
      if (window.appStore) {
        window.appStore.subscribe((event, data) => {
          if (event === 'show-toast' && data) {
            this.show(data.message, data.type, data.duration);
          }
        });
      }
    },

    show(message, type = 'info', duration = 3500) {
      if (!this.container) this.init();
      const toast = document.createElement('div');
      toast.className = `app-toast app-toast-${type}`;
      toast.textContent = message;
      this.container.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 260);
      }, duration);
    }
  };
  ToastManager.init();
  window.ToastManager = ToastManager;

  // --------------------------------------------------------------------------
  // 2. Initialize Subsystem Controllers
  // --------------------------------------------------------------------------
  if (window.DashboardController) window.DashboardController.init();
  if (window.PosController) window.PosController.init();
  if (window.CheckoutController) window.CheckoutController.init();
  if (window.KitchenController) window.KitchenController.init();
  if (window.InventoryController) window.InventoryController.init();
  if (window.SalesController) window.SalesController.init();
  if (window.AdminController) window.AdminController.init();

  // --------------------------------------------------------------------------
  // 3. Real-Time Header Clock
  // --------------------------------------------------------------------------
  const clockElement = document.getElementById('header-live-clock');
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    clockElement.textContent = now.toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --------------------------------------------------------------------------
  // 4. Page Title & Subtitle Mapping
  // --------------------------------------------------------------------------
  const VIEW_TITLES = {
    dashboard: {
      title: 'Store Performance Dashboard',
      subtitle: 'Live pulse and key metrics of your retail store.'
    },
    pos: {
      title: 'Cashier POS Order Entry',
      subtitle: 'Tap-to-order catalog, flavor customizations and payment tender.'
    },
    kitchen: {
      title: 'Kitchen Display System (KDS)',
      subtitle: 'Live order queue, elapsed timers and status transitions.'
    },
    inventory: {
      title: 'Inventory & Kitchen Waste Control',
      subtitle: 'Stock tracking, restock actions and kitchen spoilage logs.'
    },
    sales: {
      title: 'Sales Analytics & Z-Reading',
      subtitle: 'Daily ledger, cash drawer float reconciliation and CSV export.'
    },
    admin: {
      title: 'Admin & Access Control',
      subtitle: 'Staff accounts, role privilege matrices and catalog categories.'
    }
  };

  // --------------------------------------------------------------------------
  // 5. Central Navigation Switcher & RBAC Access Gating
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    if (!VIEW_TITLES[viewName]) {
      viewName = 'dashboard';
    }

    // Evaluate Role Privileges
    const currentUser = window.appStore.currentUser;
    const userRole = (currentUser && currentUser.role) ? currentUser.role : 'Cashier';

    if (viewName === 'admin' && userRole !== 'Admin') {
      window.appStore.showToast(`Access Restricted: Staff role "${userRole}" is not authorized for Admin Dashboard.`, 'error');
      return;
    }

    if (viewName === 'sales' && userRole === 'Kitchen') {
      window.appStore.showToast('Access Restricted: Kitchen staff cannot view Sales Analytics.', 'error');
      return;
    }

    window.appStore.setView(viewName);

    // Update Header Titles
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl && VIEW_TITLES[viewName]) titleEl.textContent = VIEW_TITLES[viewName].title;
    if (subtitleEl && VIEW_TITLES[viewName]) subtitleEl.textContent = VIEW_TITLES[viewName].subtitle;

    // Hide all view panels
    document.querySelectorAll('.app-view-panel').forEach(panel => {
      panel.classList.remove('active');
      panel.style.display = '';
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.style.display = '';
    }

    // Update Sidebar Nav Items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
      // Mute items this role cannot open so the restriction is visible before clicking.
      const isRestricted = (item.dataset.view === 'admin' && userRole !== 'Admin')
        || (item.dataset.view === 'sales' && userRole === 'Kitchen');
      item.classList.toggle('nav-restricted', isRestricted);
    });

    // Context-aware top bar: hide shortcuts that make no sense on the current screen or role.
    const btnGoPos = document.getElementById('top-btn-go-pos');
    if (btnGoPos) btnGoPos.style.display = (viewName === 'pos' || userRole === 'Kitchen') ? 'none' : '';
    ['top-btn-export-csv', 'top-btn-print-z'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (userRole === 'Kitchen') ? 'none' : '';
    });

    // Update Desktop Nav Tabs (if present)
    document.querySelectorAll('.desktop-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Update Mobile Nav Buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Trigger re-render of controllers if necessary
    if (viewName === 'dashboard' && window.DashboardController) window.DashboardController.render();
    if (viewName === 'pos' && window.PosController) window.PosController.renderCart();
    if (viewName === 'kitchen' && window.KitchenController) window.KitchenController.render();
    if (viewName === 'inventory' && window.InventoryController) window.InventoryController.render();
    if (viewName === 'sales' && window.SalesController) window.SalesController.render();
    if (viewName === 'admin' && window.AdminController) window.AdminController.render();
  }

  window.switchAppView = switchView;

  // Bind sidebar nav clicks
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  // Bind mobile tabs
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Bind top bar refresh button
  const btnRefresh = document.getElementById('top-btn-refresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      // Soft re-sync: recompute portions and redraw views WITHOUT reloading the page,
      // so an order currently in the cart is never lost.
      if (window.appStore && typeof window.appStore.refreshProductPortions === 'function') {
        window.appStore.refreshProductPortions();
      }
      switchView(window.appStore.activeView || 'dashboard');
      if (window.PosController) {
        window.PosController.renderProducts();
        window.PosController.renderCart();
      }
      window.appStore.showToast('Store catalog and inventory synchronized.', 'info');
    });
  }

  // Bind terminal lock button
  const btnLock = document.getElementById('btn-lock-terminal');
  if (btnLock) {
    btnLock.addEventListener('click', () => {
      window.appStore.lockTerminal();
      window.appStore.showToast('Terminal locked. Enter Manager PIN to authorize administrative actions.', 'info');
    });
  }

  // --------------------------------------------------------------------------
  // 6. Viewport Simulation Manager (Desktop, Tablet, Mobile)
  // --------------------------------------------------------------------------
  const viewportWrapper = document.getElementById('app-viewport-wrapper');

  function setViewport(mode) {
    if (window.appStore && window.appStore.setDeviceMode) {
      window.appStore.setDeviceMode(mode);
    }

    if (!viewportWrapper) return;
    viewportWrapper.classList.remove('sim-desktop', 'sim-tablet', 'sim-mobile');

    if (mode === 'desktop') {
      viewportWrapper.classList.add('sim-desktop');
    } else if (mode === 'tablet') {
      viewportWrapper.classList.add('sim-tablet');
    } else if (mode === 'mobile') {
      viewportWrapper.classList.add('sim-mobile');
    }
  }
  window.setAppViewport = setViewport;

  // --------------------------------------------------------------------------
  // 7. Mobile Cart Sheet Listener
  // --------------------------------------------------------------------------
  const mobileCartSheet = document.getElementById('mobile-cart-drawer');
  window.appStore.subscribe((event, payload) => {
    if (event === 'mobile-cart-toggled') {
      if (mobileCartSheet) {
        mobileCartSheet.classList.toggle('cart-open', payload === true);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 8. Hardware & Network Diagnostics Modal Controller
  // --------------------------------------------------------------------------
  const diagModal = document.getElementById('diagnostics-modal');
  const btnOpenDiag = document.getElementById('btn-open-diagnostics');
  const btnCloseDiag = document.getElementById('btn-close-diagnostics-modal');
  const btnCopyDiagUrl = document.getElementById('btn-copy-network-url');

  async function fetchAndRenderNetworkInfo() {
    let localIp = '127.0.0.1';
    let port = 3000;
    let isConnected = false;

    if (window.posNative && window.posNative.getNetworkInfo) {
      try {
        const netInfo = await window.posNative.getNetworkInfo();
        if (netInfo && netInfo.localIp) {
          localIp = netInfo.localIp;
          port = netInfo.port || 3000;
          isConnected = true;
        }
      } catch (e) {
        console.warn('Native getNetworkInfo failed:', e);
      }
    } else if (window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/info');
        if (res.ok) {
          const data = await res.json();
          if (data && data.localIp) {
            localIp = data.localIp;
            port = data.port || window.location.port || 3000;
            isConnected = true;
          }
        }
      } catch (e) {
        console.warn('HTTP /api/info fetch failed:', e);
      }
    } else {
      localIp = 'localhost';
      port = 3000;
    }

    const fullUrl = `http://${localIp}:${port}`;

    const elUrl = document.getElementById('diag-server-url');
    if (elUrl) elUrl.textContent = fullUrl;

    const elIp = document.getElementById('diag-server-ip');
    if (elIp) elIp.textContent = localIp;

    const elPort = document.getElementById('diag-server-port');
    if (elPort) elPort.textContent = String(port);

    const elStatus = document.getElementById('diag-server-status');
    if (elStatus) {
      elStatus.textContent = isConnected ? 'Active LAN Server' : 'Local Standalone';
      elStatus.className = isConnected ? 'diag-status-badge status-online' : 'diag-status-badge status-warning';
    }

    const mobileIpBanner = document.getElementById('mobile-network-link');
    if (mobileIpBanner) {
      mobileIpBanner.textContent = `Mobile Wi-Fi: ${fullUrl}`;
    }
  }

  function openDiagnosticsModal() {
    if (!diagModal) return;
    fetchAndRenderNetworkInfo();

    const elOrders = document.getElementById('diag-stat-orders');
    if (elOrders && window.appStore && window.appStore.orders) {
      elOrders.textContent = String(window.appStore.orders.length);
    }
    const elProducts = document.getElementById('diag-stat-products');
    if (elProducts && window.appStore && window.appStore.products) {
      elProducts.textContent = String(window.appStore.products.length);
    }

    diagModal.classList.add('modal-visible');
  }

  function closeDiagnosticsModal() {
    if (diagModal) diagModal.classList.remove('modal-visible');
  }

  if (btnOpenDiag) btnOpenDiag.addEventListener('click', openDiagnosticsModal);
  if (btnCloseDiag) btnCloseDiag.addEventListener('click', closeDiagnosticsModal);
  const btnXCloseDiag = document.getElementById('btn-x-close-diag-modal');
  if (btnXCloseDiag) btnXCloseDiag.addEventListener('click', closeDiagnosticsModal);
  if (btnCopyDiagUrl) {
    btnCopyDiagUrl.addEventListener('click', () => {
      const elUrl = document.getElementById('diag-server-url');
      if (elUrl && elUrl.textContent) {
        navigator.clipboard.writeText(elUrl.textContent).then(() => {
          const orig = btnCopyDiagUrl.textContent;
          btnCopyDiagUrl.textContent = 'Copied to Clipboard';
          setTimeout(() => { btnCopyDiagUrl.textContent = orig; }, 2000);
        }).catch(err => console.warn('Clipboard write failed:', err));
      }
    });
  }
  if (diagModal) {
    diagModal.addEventListener('click', (e) => {
      if (e.target === diagModal) closeDiagnosticsModal();
    });
  }

  fetchAndRenderNetworkInfo();
  window.openDiagnosticsModal = openDiagnosticsModal;
  window.closeDiagnosticsModal = closeDiagnosticsModal;

  // --------------------------------------------------------------------------
  // 10. Staff Accounts & Cashier Session Switcher Controller (SRS RTM-FR-011)
  // --------------------------------------------------------------------------
  const StaffSessionController = {
    selectedUserId: null,
    currentPin: '',
    modal: null,
    keyHandler: null,

    init() {
      this.modal = document.getElementById('staff-switch-modal');
      this.bindEvents();
      this.updateSidebar();

      if (window.appStore && window.appStore.subscribe) {
        window.appStore.subscribe((event) => {
          if (event === 'user-changed') {
            this.updateSidebar();
          }
        });
      }
    },

    getInitials(name) {
      if (!name) return 'ST';
      if (name === 'Staff Lane 1') return 'SL';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    updateSidebar() {
      const user = (window.appStore && window.appStore.getCurrentUser)
        ? window.appStore.getCurrentUser()
        : { name: 'Staff Lane 1', role: 'Cashier' };

      const avatarEl = document.getElementById('sidebar-user-avatar');
      const nameEl = document.getElementById('sidebar-user-name');
      const roleEl = document.getElementById('sidebar-user-role');

      if (nameEl) nameEl.textContent = user.name;
      if (avatarEl) avatarEl.textContent = this.getInitials(user.name);
      if (roleEl) {
        roleEl.textContent = user.role;
        const role = (user.role || '').toLowerCase();
        roleEl.className = 'user-role-badge ' + (
          role === 'admin' ? 'badge-role-admin' :
          role === 'kitchen' ? 'badge-role-kitchen' : 'badge-role-cashier'
        );
      }
    },

    openModal() {
      if (!this.modal) return;
      const users = (window.appStore && window.appStore.getUsers) 
        ? window.appStore.getUsers() 
        : [
            { id: 'USR-001', name: 'Master Manager', role: 'Admin' },
            { id: 'USR-002', name: 'Staff Lane 1', role: 'Cashier' },
            { id: 'USR-003', name: 'Kitchen Chef', role: 'Kitchen' }
          ];

      const currentUser = (window.appStore && window.appStore.getCurrentUser)
        ? window.appStore.getCurrentUser()
        : users[1];

      this.selectedUserId = currentUser ? currentUser.id : users[0].id;
      this.renderUserCards(users);
      this.updatePinDisplay('');

      const errEl = document.getElementById('staff-pin-error-text');
      if (errEl) errEl.style.display = 'none';

      this.modal.classList.add('modal-visible');

      if (!this.keyHandler) {
        this.keyHandler = (e) => {
          if (!this.modal || !this.modal.classList.contains('modal-visible')) return;
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            this.handleKeypadPress(e.key);
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.handleKeypadPress('backspace');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeModal();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.authenticateAndSwitch();
          } else if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            this.handleKeypadPress('clear');
          }
        };
        window.addEventListener('keydown', this.keyHandler);
      }
    },

    closeModal() {
      if (!this.modal) return;
      this.modal.classList.remove('modal-visible');
      if (this.keyHandler) {
        window.removeEventListener('keydown', this.keyHandler);
        this.keyHandler = null;
      }
      this.updatePinDisplay('');
    },

    renderUserCards(users) {
      const container = document.getElementById('staff-user-cards-container');
      if (!container) return;

      container.innerHTML = users.map(u => {
        const isSelected = u.id === this.selectedUserId;
        const role = (u.role || '').toLowerCase();
        const roleClass = role === 'admin' ? 'badge-role-admin' :
                          role === 'kitchen' ? 'badge-role-kitchen' : 'badge-role-cashier';
        return `
          <div class="staff-user-card ${isSelected ? 'selected' : ''}" data-id="${u.id}">
            <div class="user-avatar-circle">${this.getInitials(u.name)}</div>
            <div class="staff-user-name">${u.name}</div>
            <div class="user-role-badge ${roleClass}">${u.role}</div>
          </div>
        `;
      }).join('');

      const selectedUser = users.find(u => u.id === this.selectedUserId);
      const promptLabel = document.getElementById('staff-pin-prompt-label');
      if (promptLabel && selectedUser) {
        promptLabel.textContent = `Enter PIN for ${selectedUser.name}`;
      }
    },

    selectUser(userId) {
      this.selectedUserId = userId;
      const users = (window.appStore && window.appStore.getUsers) ? window.appStore.getUsers() : [];
      this.renderUserCards(users);
      this.updatePinDisplay('');
      const errEl = document.getElementById('staff-pin-error-text');
      if (errEl) errEl.style.display = 'none';
    },

    updatePinDisplay(pin) {
      this.currentPin = pin;
      const pinInput = document.getElementById('staff-switch-pin-input');
      if (pinInput && pinInput.value !== pin) pinInput.value = pin;

      const dots = document.querySelectorAll('#staff-pin-dots .pin-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('filled', idx < pin.length);
      });

      const errEl = document.getElementById('staff-pin-error-text');
      if (errEl) errEl.style.display = 'none';
    },

    handleKeypadPress(key) {
      let pin = this.currentPin || '';
      if (key === 'clear') {
        pin = '';
      } else if (key === 'backspace') {
        pin = pin.slice(0, -1);
      } else if (/^[0-9]$/.test(key)) {
        if (pin.length < 4) {
          pin += key;
        }
      }
      this.updatePinDisplay(pin);
    },

    authenticateAndSwitch() {
      const pinInput = document.getElementById('staff-switch-pin-input');
      const enteredPin = (this.currentPin !== undefined && this.currentPin !== '')
        ? this.currentPin
        : (pinInput ? pinInput.value.trim() : '');

      if (!enteredPin || enteredPin.length !== 4) {
        const errEl = document.getElementById('staff-pin-error-text');
        if (errEl) {
          errEl.textContent = 'Please enter a 4-digit PIN.';
          errEl.style.display = 'block';
        }
        return;
      }

      if (!window.appStore || !window.appStore.switchUser) {
        console.warn('appStore.switchUser not available');
        this.closeModal();
        return;
      }

      const result = window.appStore.switchUser(this.selectedUserId, enteredPin);
      if (result === true || (result && result.success)) {
        this.closeModal();
        this.updateSidebar();
      } else {
        const errEl = document.getElementById('staff-pin-error-text');
        if (errEl) {
          errEl.textContent = (result && result.error) ? result.error : 'Incorrect 4-digit PIN.';
          errEl.style.display = 'block';
        }
        const dotsContainer = document.getElementById('staff-pin-dots');
        if (dotsContainer) {
          dotsContainer.classList.add('shake', 'pin-shake');
          setTimeout(() => dotsContainer.classList.remove('shake', 'pin-shake'), 400);
        }
        this.updatePinDisplay('');
      }
    },

    bindEvents() {
      const card = document.getElementById('sidebar-user-card');
      if (card) {
        card.addEventListener('click', () => this.openModal());
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openModal();
          }
        });
      }

      const btnClose = document.getElementById('btn-close-staff-modal');
      if (btnClose) btnClose.addEventListener('click', () => this.closeModal());

      const btnCancel = document.getElementById('btn-cancel-staff-switch');
      if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

      const btnConfirm = document.getElementById('btn-confirm-staff-switch');
      if (btnConfirm) btnConfirm.addEventListener('click', () => this.authenticateAndSwitch());

      const container = document.getElementById('staff-user-cards-container');
      if (container) {
        container.addEventListener('click', (e) => {
          const uCard = e.target.closest('.staff-user-card');
          if (uCard && uCard.dataset.id) {
            this.selectUser(uCard.dataset.id);
          }
        });
      }

      const keypad = document.getElementById('staff-touch-keypad');
      if (keypad) {
        keypad.addEventListener('click', (e) => {
          const btn = e.target.closest('.btn-pin-key, .keypad-btn');
          if (!btn) return;
          const key = btn.dataset.pinKey || btn.dataset.key;
          if (key) {
            this.handleKeypadPress(key);
          }
        });
      }

      const pinInput = document.getElementById('staff-switch-pin-input');
      if (pinInput) {
        pinInput.addEventListener('input', (e) => {
          this.updatePinDisplay(e.target.value.replace(/\D/g, '').slice(0, 4));
        });
      }

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }
    }
  };

  StaffSessionController.init();
  window.StaffSessionController = StaffSessionController;

  // --------------------------------------------------------------------------
  // 9. Initial View & Simulator URL Parameters
  // --------------------------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') || 'dashboard';
  if (['dashboard', 'pos', 'kitchen', 'inventory', 'sales'].includes(initialView)) {
    switchView(initialView);
  } else {
    switchView('dashboard');
  }

  const initialSim = urlParams.get('sim');
  if (initialSim && ['auto', 'desktop', 'tablet', 'mobile'].includes(initialSim)) {
    setViewport(initialSim);
  }
});
