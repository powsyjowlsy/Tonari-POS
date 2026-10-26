// Store Performance Dashboard Controller for Tonari POS
// Inspired directly by "UI interface POS inspiration.webp" (Executive Retail Dashboard)
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const DashboardController = {
  init() {
    this.kpiSalesEl = document.getElementById('dash-kpi-sales');
    this.kpiUnitsEl = document.getElementById('dash-kpi-units');
    this.kpiTransEl = document.getElementById('dash-kpi-trans');
    this.kpiLowStockEl = document.getElementById('dash-kpi-lowstock');
    this.trendContainer = document.getElementById('dash-trend-bars-container');
    this.trendSummaryEl = document.getElementById('dash-trend-summary-text');
    this.recentActivityTable = document.getElementById('dash-recent-activity-body');

    this.bindEvents();
    this.render();

    // Subscribe to state mutations to keep dashboard synchronized in real-time
    window.appStore.subscribe((event) => {
      if (event === 'orders-updated' || event === 'order-placed' || event === 'products-updated') {
        this.render();
      }
    });
  },

  bindEvents() {
    // Quick action: "View All in Sales History" button
    const btnViewAll = document.getElementById('btn-dash-view-all-sales');
    if (btnViewAll) {
      btnViewAll.addEventListener('click', () => {
        if (window.switchAppView) {
          window.switchAppView('sales');
        } else {
          window.appStore.setView('sales');
        }
      });
    }

    // Quick action: "Go to POS" top button
    const btnGoPos = document.getElementById('top-btn-go-pos');
    if (btnGoPos) {
      btnGoPos.addEventListener('click', () => {
        if (window.switchAppView) {
          window.switchAppView('pos');
        } else {
          window.appStore.setView('pos');
        }
      });
    }
  },

  render() {
    this.renderKpis();
    this.renderSalesTrend();
    this.renderRecentActivity();
  },

  // --------------------------------------------------------------------------
  // 1. KPI Metric Cards (Today's Operations)
  // --------------------------------------------------------------------------
  renderKpis() {
    const orders = window.appStore.orders.filter(o => o.status !== 'Voided');
    const todaySales = orders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);
    const unitsSold = orders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const totalTransactions = orders.length;

    // Calculate low stock items (< minStock)
    const lowStockCount = window.appStore.products.filter(p => p.stock <= p.minStock).length;

    if (this.kpiSalesEl) {
      this.kpiSalesEl.textContent = `PHP ${todaySales.toFixed(2)}`;
    }
    if (this.kpiUnitsEl) {
      this.kpiUnitsEl.textContent = `${unitsSold} units`;
    }
    if (this.kpiTransEl) {
      this.kpiTransEl.textContent = `${totalTransactions}`;
    }
    if (this.kpiLowStockEl) {
      this.kpiLowStockEl.textContent = `${lowStockCount}`;
    }
  },

  // --------------------------------------------------------------------------
  // 2. 7-Day Sales Trend & Performance Chart
  // --------------------------------------------------------------------------
  renderSalesTrend() {
    if (!this.trendContainer) return;

    const trend = window.appStore.getWeeklySalesTrend();
    const maxRev = Math.max(...trend.map(t => t.revenue), 150); // Minimum scale baseline

    let totalWeeklyRev = 0;
    let totalWeeklyTrans = 0;
    let peakDay = trend[0];

    trend.forEach(d => {
      totalWeeklyRev += d.revenue;
      totalWeeklyTrans += d.count;
      if (d.revenue > (peakDay ? peakDay.revenue : 0)) {
        peakDay = d;
      }
    });

    let barsHtml = '';
    trend.forEach(day => {
      // Scale height between 10% and 100%
      const heightPct = day.revenue > 0 
        ? Math.max(12, Math.round((day.revenue / maxRev) * 100))
        : 6;

      const isPeak = peakDay && day.revenue === peakDay.revenue && day.revenue > 0;

      barsHtml += `
        <div class="trend-col" title="${day.dayLabel} (${day.dateSub}): PHP ${day.revenue.toFixed(2)} across ${day.count} order(s)">
          <div class="trend-col-amount tabular-price">${day.revenue > 0 ? `PHP ${day.revenue.toFixed(0)}` : 'PHP 0'}</div>
          <div class="trend-col-bar-wrap">
            <div class="trend-col-bar ${isPeak ? 'bar-peak' : ''}" style="height: ${heightPct}%;"></div>
          </div>
          <div class="trend-col-label">${day.dayLabel}</div>
          <div class="trend-col-sub">${day.dateSub}</div>
        </div>
      `;
    });

    this.trendContainer.innerHTML = barsHtml;

    if (this.trendSummaryEl) {
      const peakText = (peakDay && peakDay.revenue > 0)
        ? ` Peak day: ${peakDay.dayLabel} (${peakDay.dateSub}) with PHP ${peakDay.revenue.toFixed(2)}.`
        : ' No sales recorded during this cycle yet.';

      this.trendSummaryEl.textContent = `7-Day Performance: PHP ${totalWeeklyRev.toFixed(2)} gross revenue across ${totalWeeklyTrans} transaction(s).${peakText}`;
    }
  },

  // --------------------------------------------------------------------------
  // 3. Recent Sales Activity Table
  // --------------------------------------------------------------------------
  renderRecentActivity() {
    if (!this.recentActivityTable) return;

    const recentOrders = window.appStore.orders.slice(0, 6);

    if (recentOrders.length === 0) {
      this.recentActivityTable.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-sub">No sales recorded today yet. Switch to POS Register to place an order.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    recentOrders.forEach(o => {
      const isVoid = o.status === 'Voided';
      const itemsList = o.items.map(i => {
        return `${i.name}${i.flavor ? ` [${i.flavor}]` : ''} (${i.quantity})`;
      }).join(', ');

      let statusBadge = '';
      if (isVoid) {
        statusBadge = '<span class="status-badge badge-out-of-stock">Voided</span>';
      } else if (o.status === 'Completed') {
        statusBadge = '<span class="status-badge badge-in-stock">Completed</span>';
      } else if (o.status === 'Ready') {
        statusBadge = '<span class="status-badge badge-in-stock">Ready</span>';
      } else {
        statusBadge = '<span class="status-badge badge-low-stock">In Kitchen</span>';
      }

      rowsHtml += `
        <tr>
          <td class="font-bold text-main font-mono">#${o.id}</td>
          <td class="text-sub font-mono font-small">${o.time}</td>
          <td class="text-sub">${o.cashier}</td>
          <td class="text-main">${itemsList}</td>
          <td class="tabular-price font-bold ${isVoid ? 'text-sub' : 'text-main'}" style="${isVoid ? 'text-decoration: line-through;' : ''}">
            PHP ${parseFloat(o.totalDue).toFixed(2)}
          </td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    this.recentActivityTable.innerHTML = rowsHtml;
  }
};

window.DashboardController = DashboardController;
