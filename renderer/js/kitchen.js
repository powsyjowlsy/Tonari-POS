// Kitchen Display System (KDS) & Order Queue Controller for Tonari POS
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const KitchenController = {
  filter: 'active', // 'active' (Pending, Preparing, Ready) or 'all'

  init() {
    this.container = document.getElementById('kitchen-cards-container');
    this.filterButtons = document.querySelectorAll('.kds-filter-btn');

    this.bindEvents();
    this.render();

    // Auto-refresh elapsed timers every 10 seconds
    setInterval(() => {
      if (window.appStore.activeView === 'kitchen') {
        this.render();
      }
    }, 10000);

    window.appStore.subscribe((event) => {
      if (event === 'orders-updated' || event === 'order-placed') {
        this.render();
      }
    });
  },

  bindEvents() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFilter(btn.dataset.filter);
      });
    });
  },

  setFilter(filterType) {
    this.filter = filterType;
    this.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filterType);
    });
    this.render();
  },

  getElapsedString(timestamp) {
    const diffMs = Math.max(0, Date.now() - new Date(timestamp).getTime());
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${mins}m ago`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s ago`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s ago`;
    }
    return `${secs}s ago`;
  },

  // Returns a CSS urgency class so slow tickets stand out from across the kitchen.
  // Under 5 minutes: no highlight. 5 to 9 minutes: warning. 10 minutes or more: critical.
  getSlaUrgencyClass(timestamp, status) {
    // Finished tickets no longer age, so they never escalate.
    if (status === 'Completed' || status === 'Voided') return '';
    const diffMins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diffMins >= 10) return 'sla-critical';
    if (diffMins >= 5) return 'sla-warning';
    return '';
  },

  render() {
    if (!this.container) return;

    let orders = window.appStore.orders.slice();
    if (this.filter === 'active') {
      orders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
    }

    const pendingCount = window.appStore.orders.filter(o => o.status === 'Pending').length;
    const preparingCount = window.appStore.orders.filter(o => o.status === 'Preparing').length;
    const readyCount = window.appStore.orders.filter(o => o.status === 'Ready').length;

    const countBadge = document.getElementById('kds-active-count');
    if (countBadge) {
      countBadge.textContent = `${pendingCount + preparingCount + readyCount} active tickets (${pendingCount} pending, ${preparingCount} cooking, ${readyCount} ready)`;
    }

    if (orders.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-title">No Active Kitchen Orders</div>
          <div class="empty-desc">New orders placed at the cashier lane will automatically appear here.</div>
        </div>
      `;
      return;
    }

    let html = '';
    orders.forEach(order => {
      const elapsed = this.getElapsedString(order.timestamp);
      const slaClass = this.getSlaUrgencyClass(order.timestamp, order.status);
      
      let statusClass = 'badge-pending';
      let nextActionBtn = '';

      if (order.status === 'Pending') {
        statusClass = 'badge-pending';
        nextActionBtn = `<button class="btn-action-kitchen btn-start-prep" data-id="${order.id}">Start Preparing</button>`;
      } else if (order.status === 'Preparing') {
        statusClass = 'badge-preparing';
        nextActionBtn = `<button class="btn-action-kitchen btn-mark-ready" data-id="${order.id}">Mark Ready to Serve</button>`;
      } else if (order.status === 'Ready') {
        statusClass = 'badge-ready';
        nextActionBtn = `<button class="btn-action-kitchen btn-mark-complete" data-id="${order.id}">Complete Order</button>`;
      } else if (order.status === 'Completed') {
        statusClass = 'badge-completed';
      } else if (order.status === 'Voided') {
        statusClass = 'badge-voided';
      }

      let itemsHtml = order.items.map(item => `
        <div class="kds-item-row">
          <span class="kds-item-qty tabular-numbers">${item.quantity}x</span>
          <span class="kds-item-name">
            ${item.name}
            ${item.flavor ? `<div class="kds-flavor-tag">[${item.flavor}]</div>` : ''}
          </span>
        </div>
      `).join('');

      html += `
        <div class="kds-card status-${order.status.toLowerCase()}">
          <div class="kds-card-header">
            <div>
              <span class="kds-order-id font-mono">#${order.id}</span>
              <span class="kds-order-type">[${order.orderType}]</span>
            </div>
            <span class="kds-status-badge ${statusClass}">${order.status}</span>
          </div>
          
          <div class="kds-time-bar">
            <span>Placed: ${order.time}</span>
            <span class="kds-elapsed tabular-numbers ${slaClass}">${elapsed}</span>
          </div>

          <div class="kds-items-list">
            ${itemsHtml}
          </div>

          <div class="kds-card-footer">
            ${nextActionBtn}
          </div>
        </div>
      `;
    });

    this.container.innerHTML = html;

    // Attach button click events
    this.container.querySelectorAll('.btn-start-prep').forEach(btn => {
      btn.addEventListener('click', () => {
        window.appStore.updateOrderStatus(btn.dataset.id, 'Preparing');
      });
    });

    this.container.querySelectorAll('.btn-mark-ready').forEach(btn => {
      btn.addEventListener('click', () => {
        window.appStore.updateOrderStatus(btn.dataset.id, 'Ready');
      });
    });

    this.container.querySelectorAll('.btn-mark-complete').forEach(btn => {
      btn.addEventListener('click', () => {
        window.appStore.updateOrderStatus(btn.dataset.id, 'Completed');
        // Confirm the hand-off so an accidental tap is noticed immediately.
        window.appStore.showToast(`Order #${btn.dataset.id} marked Completed.`, 'success');
      });
    });
  }
};

window.KitchenController = KitchenController;
