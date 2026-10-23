// Inventory Management, Threshold Warning & Stock Replenishment Controller

const InventoryController = {
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,

  init() {
    this.tableBody = document.getElementById('inventory-table-body');
    this.alertBanner = document.getElementById('inventory-alert-banner');
    this.editModal = document.getElementById('inventory-edit-modal');

    this.bindEvents();
    this.render();

    window.appStore.subscribe((event) => {
      if (event === 'products-updated') {
        this.render();
      }
    });
  },

  render() {
    if (!this.tableBody) return;

    let products = window.appStore.products.slice();

    // Filter by category
    if (this.activeCategory !== 'all') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    // Filter by search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }

    // Check low stock across all products
    const lowStockItems = window.appStore.products.filter(p => p.stock <= p.minStock && p.stock > 0);
    const outOfStockItems = window.appStore.products.filter(p => p.stock === 0);

    // Update alert banner
    if (this.alertBanner) {
      if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
        let msg = '';
        if (outOfStockItems.length > 0) {
          msg += `<strong>OUT OF STOCK (${outOfStockItems.length}):</strong> ${outOfStockItems.map(p => p.name).join(', ')}. `;
        }
        if (lowStockItems.length > 0) {
          msg += `<strong>LOW STOCK WARNING (${lowStockItems.length}):</strong> ${lowStockItems.map(p => `${p.name} (${p.stock} left)`).join(', ')}.`;
        }
        this.alertBanner.innerHTML = msg;
        this.alertBanner.style.display = 'block';
      } else {
        this.alertBanner.style.display = 'none';
      }
    }

    if (products.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">No inventory products found matching filters.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    products.forEach(p => {
      let statusBadge = '';
      if (p.stock === 0) {
        statusBadge = '<span class="status-badge badge-out-of-stock">Out of Stock</span>';
      } else if (p.stock <= p.minStock) {
        statusBadge = `<span class="status-badge badge-low-stock">Low Stock (${p.stock})</span>`;
      } else {
        statusBadge = `<span class="status-badge badge-in-stock">In Stock (${p.stock})</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="font-mono text-sub">${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td><span class="category-tag">${p.categoryName || p.category}</span></td>
          <td class="tabular-price">PHP ${p.price.toFixed(2)}</td>
          <td class="tabular-price font-bold">${p.stock} units</td>
          <td class="tabular-price text-sub">${p.minStock} units</td>
          <td>${statusBadge}</td>
          <td>
            <div class="inventory-actions">
              <button class="btn-restock" data-id="${p.id}" data-amount="10">+10</button>
              <button class="btn-restock" data-id="${p.id}" data-amount="25">+25</button>
              <button class="btn-edit-item" data-id="${p.id}">Edit</button>
            </div>
          </td>
        </tr>
      `;
    });

    this.tableBody.innerHTML = rowsHtml;

    // Attach row events
    this.tableBody.querySelectorAll('.btn-restock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const amt = parseInt(btn.dataset.amount, 10);
        window.appStore.replenishStock(id, amt);
      });
    });

    this.tableBody.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openEditModal(btn.dataset.id);
      });
    });
  },

  openEditModal(productId) {
    const prod = window.appStore.products.find(p => p.id === productId);
    if (!prod) return;

    this.selectedProduct = prod;

    document.getElementById('edit-item-name').textContent = prod.name;
    document.getElementById('edit-item-id').textContent = prod.id;
    document.getElementById('edit-item-price').value = prod.price.toFixed(2);
    document.getElementById('edit-item-threshold').value = prod.minStock;

    if (this.editModal) {
      this.editModal.classList.add('modal-visible');
    }
  },

  closeEditModal() {
    if (this.editModal) {
      this.editModal.classList.remove('modal-visible');
    }
    this.selectedProduct = null;
  },

  saveEditItem() {
    if (!this.selectedProduct) return;

    const priceInput = document.getElementById('edit-item-price');
    const threshInput = document.getElementById('edit-item-threshold');

    const newPrice = parseFloat(priceInput.value);
    const newThresh = parseInt(threshInput.value, 10);

    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price.');
      return;
    }

    if (isNaN(newThresh) || newThresh < 0) {
      alert('Please enter a valid threshold.');
      return;
    }

    window.appStore.updateProductDetails(this.selectedProduct.id, newPrice, newThresh);
    this.closeEditModal();
  },

  bindEvents() {
    const searchInput = document.getElementById('inventory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }

    const catSelect = document.getElementById('inventory-category-select');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.render();
      });
    }

    const btnCloseModal = document.getElementById('btn-close-edit-modal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeEditModal());

    const btnSaveModal = document.getElementById('btn-save-edit-modal');
    if (btnSaveModal) btnSaveModal.addEventListener('click', () => this.saveEditItem());
  }
};

window.InventoryController = InventoryController;
