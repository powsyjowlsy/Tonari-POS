// Main Application Bootstrap & Viewport Orchestrator for Tonari POS

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Subsystem Controllers
  window.PosController.init();
  window.CheckoutController.init();
  window.KitchenController.init();
  window.InventoryController.init();
  window.SalesController.init();

  // 2. Real-Time Clock
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

  // 3. Tab Navigation (Desktop & Mobile)
  function switchView(viewName) {
    window.appStore.setView(viewName);

    // Hide all view panels
    document.querySelectorAll('.app-view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update Desktop Nav Tabs
    document.querySelectorAll('.desktop-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Update Mobile Nav Tabs
    document.querySelectorAll('.mobile-nav-btn').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Re-render view if needed
    if (viewName === 'kitchen') window.KitchenController.render();
    if (viewName === 'inventory') window.InventoryController.render();
    if (viewName === 'sales') window.SalesController.render();
  }

  // Bind desktop tabs
  document.querySelectorAll('.desktop-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Bind mobile tabs
  document.querySelectorAll('.mobile-nav-btn').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // 4. Viewport Simulation Manager
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

  // 5. Mobile Cart Sheet Listener
  const mobileCartSheet = document.getElementById('mobile-cart-drawer');
  window.appStore.subscribe((event, payload) => {
    if (event === 'mobile-cart-toggled') {
      if (mobileCartSheet) {
        mobileCartSheet.classList.toggle('cart-open', payload === true);
      }
    }
  });

  // 6. Network Link Discovery (Mobile Wi-Fi Connection Link)
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
      // In browser fallback when served over HTTP
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

  // 7. Check URL Query Parameters for Initial View & Device Simulation
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view');
  if (initialView && ['pos', 'kitchen', 'inventory', 'sales'].includes(initialView)) {
    switchView(initialView);
  }

  const initialSim = urlParams.get('sim');
  if (initialSim && ['auto', 'desktop', 'tablet', 'mobile'].includes(initialSim)) {
    setViewport(initialSim);
  }

  // Pre-seed demonstration data if requested
  if (urlParams.get('demo') === '1' && window.appStore.orders.length === 0) {
    window.appStore.cart = [
      { id: 'TN-CUR-01', name: 'Chicken Katsu Curry', category: 'curry', price: 110.00, quantity: 2 },
      { id: 'TN-SDA-01', name: 'Green Apple Fruit Soda (16oz)', category: 'soda', price: 39.00, quantity: 2 }
    ];
    window.appStore.placeOrder({ method: 'Cash', tendered: '300.00', change: '2.00' });

    window.appStore.cart = [
      { id: 'TN-TAK-02', name: 'Classic Octopus Takoyaki (8 pcs)', category: 'takoyaki', price: 95.00, quantity: 1 },
      { id: 'TN-RAM-01', name: 'Tonkotsu Rich Broth Ramen', category: 'ramen', price: 120.00, quantity: 1 }
    ];
    window.appStore.setOrderType('Take-Out');
    window.appStore.placeOrder({ method: 'GCash', tendered: '215.00', change: '0.00', gcashRef: '1008291048201' });

    // Mark second order as Preparing
    if (window.appStore.orders[0]) {
      window.appStore.orders[0].status = 'Preparing';
    }

    // Pre-populate cart with 1 item for POS view
    window.appStore.addToCart(window.appStore.products[0]);
    window.appStore.addToCart(window.appStore.products[3]);
  }
});
