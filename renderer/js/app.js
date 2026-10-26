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
  // 2. Initialize Subsystem Controllers
  // --------------------------------------------------------------------------
  if (window.DashboardController) window.DashboardController.init();
  if (window.PosController) window.PosController.init();
  if (window.CheckoutController) window.CheckoutController.init();
  if (window.KitchenController) window.KitchenController.init();
  if (window.InventoryController) window.InventoryController.init();
  if (window.SalesController) window.SalesController.init();

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
    }
  };

  // --------------------------------------------------------------------------
  // 5. Central Navigation Switcher
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    if (!VIEW_TITLES[viewName]) {
      viewName = 'dashboard';
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
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update Sidebar Nav Items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
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
      window.location.reload();
    });
  }

  // Bind terminal lock button
  const btnLock = document.getElementById('btn-lock-terminal');
  if (btnLock) {
    btnLock.addEventListener('click', () => {
      window.appStore.lockTerminal();
      alert('Terminal locked. Enter Manager PIN to authorize administrative actions.');
    });
  }

  // --------------------------------------------------------------------------
  // 6. Viewport Simulation Manager (Desktop, Tablet, Mobile)
  // --------------------------------------------------------------------------
  const viewportWrapper = document.getElementById('app-viewport-wrapper');
  const viewportPills = document.querySelectorAll('.viewport-pill');

  function setViewport(mode) {
    window.appStore.setDeviceMode(mode);

    viewportPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === mode);
    });

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

  viewportPills.forEach(pill => {
    pill.addEventListener('click', () => setViewport(pill.dataset.mode));
  });

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
  // 8. Network Link Discovery (Mobile Wi-Fi Connection Link)
  // --------------------------------------------------------------------------
  const mobileIpBanner = document.getElementById('mobile-network-link');
  if (mobileIpBanner) {
    if (window.posNative && window.posNative.getNetworkInfo) {
      try {
        const netInfo = await window.posNative.getNetworkInfo();
        mobileIpBanner.textContent = `Mobile Wi-Fi: http://${netInfo.localIp}:${netInfo.port}`;
      } catch (e) {
        mobileIpBanner.textContent = `Local: http://localhost:3000`;
      }
    } else if (window.location.protocol.startsWith('http')) {
      fetch('/api/info')
        .then(res => res.json())
        .then(data => {
          mobileIpBanner.textContent = `Mobile Wi-Fi: http://${data.localIp}:${data.port}`;
        })
        .catch(() => {
          mobileIpBanner.textContent = `Local Port: 3000`;
        });
    } else {
      mobileIpBanner.textContent = `Local Server: Port 3000`;
    }
  }

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
