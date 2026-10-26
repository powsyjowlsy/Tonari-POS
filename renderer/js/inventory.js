// Inventory Management, Threshold Warning, Quick Restock & Kitchen Waste Logger
// Implements: SRS RTM-FR-008 (Low-Stock Warnings) & RTM-FR-009 (Kitchen Waste / Spoilage Tracking)
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const InventoryController = {
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,

  init() {
    this.tableBody = document.getElementById('inventory-table-body');
    this.alertBanner = document.getElementById('inventory-alert-banner');
    this.editModal = document.getElementById('inventory-edit-modal');
    this.wasteModal = document.getElementById('inventory-waste-modal');
    this.wasteTableBody = document.getElementById('waste-log-table-body');

    this.productsTableContainer = document.getElementById('products-table-container');
    this.ingredientsTableContainer = document.getElementById('ingredients-table-container');
    this.ingredientsTableBody = document.getElementById('ingredients-table-body');
    this.btnTabProducts = document.getElementById('btn-tab-inv-products');
    this.btnTabIngredients = document.getElementById('btn-tab-inv-ingredients');
    this.currentSubTab = 'products';

    this.bindEvents();
    this.render();

    window.appStore.subscribe((event) => {
      if (event === 'products-updated' || event === 'waste-logs-updated' || event === 'ingredients-updated') {
        this.render();
      }
    });
  },

  bindEvents() {
    // Sub-Tab Segment Switching
    if (this.btnTabProducts && this.btnTabIngredients) {
      this.btnTabProducts.addEventListener('click', () => {
        this.currentSubTab = 'products';
        this.btnTabProducts.classList.add('active');
        this.btnTabIngredients.classList.remove('active');
        if (this.productsTableContainer) this.productsTableContainer.style.display = 'block';
        if (this.ingredientsTableContainer) this.ingredientsTableContainer.style.display = 'none';
        this.render();
      });

      this.btnTabIngredients.addEventListener('click', () => {
        this.currentSubTab = 'ingredients';
        this.btnTabIngredients.classList.add('active');
        this.btnTabProducts.classList.remove('active');
        if (this.productsTableContainer) this.productsTableContainer.style.display = 'none';
        if (this.ingredientsTableContainer) this.ingredientsTableContainer.style.display = 'block';
        this.render();
      });
    }

    // Inventory search filter input
    const searchInput = document.getElementById('inventory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }

    // Category filter dropdown
    const categorySelect = document.getElementById('inventory-category-select');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.render();
      });
    }

    // Edit Item Modal close button
    const btnCloseEdit = document.getElementById('btn-close-edit-modal');
    if (btnCloseEdit) {
      btnCloseEdit.addEventListener('click', () => {
        this.closeEditModal();
      });
    }
    const btnXCloseEdit = document.getElementById('btn-x-close-edit-modal');
    if (btnXCloseEdit) {
      btnXCloseEdit.addEventListener('click', () => {
        this.closeEditModal();
      });
    }

    // Edit Item Modal save button
    const btnSaveEdit = document.getElementById('btn-save-edit-modal');
    if (btnSaveEdit) {
      btnSaveEdit.addEventListener('click', () => {
        this.saveEditModal();
      });
    }

    // Open Waste / Spoilage Modal button
    const btnOpenWaste = document.getElementById('btn-open-waste-modal');
    if (btnOpenWaste) {
      btnOpenWaste.addEventListener('click', () => {
        this.openWasteModal();
      });
    }

    // Close Waste Modal button
    const btnCloseWaste = document.getElementById('btn-close-waste-modal');
    if (btnCloseWaste) {
      btnCloseWaste.addEventListener('click', () => {
        this.closeWasteModal();
      });
    }
    const btnXCloseWaste = document.getElementById('btn-x-close-waste-modal');
    if (btnXCloseWaste) {
      btnXCloseWaste.addEventListener('click', () => {
        this.closeWasteModal();
      });
    }

    // Confirm Waste Logging button
    const btnConfirmWaste = document.getElementById('btn-confirm-waste-log');
    if (btnConfirmWaste) {
      btnConfirmWaste.addEventListener('click', () => {
        this.submitWasteLog();
      });
    }
  },

  // --------------------------------------------------------------------------
  // Edit Product Details Modal
  // --------------------------------------------------------------------------
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

  saveEditModal() {
    if (!this.selectedProduct) return;

    const newPrice = parseFloat(document.getElementById('edit-item-price').value);
    const newThreshold = parseInt(document.getElementById('edit-item-threshold').value, 10);

    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid unit price.');
      return;
    }

    if (isNaN(newThreshold) || newThreshold < 1) {
      alert('Please enter a valid stock alert threshold (minimum 1).');
      return;
    }

    window.appStore.updateProductDetails(this.selectedProduct.id, newPrice, newThreshold);
    this.closeEditModal();
  },

  // --------------------------------------------------------------------------
  // Kitchen Waste & Spoilage Modal (SRS RTM-FR-009)
  // --------------------------------------------------------------------------
  openWasteModal() {
    const selectEl = document.getElementById('waste-product-select');
    if (selectEl) {
      let optionsHtml = '';
      window.appStore.products.forEach(p => {
        optionsHtml += `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`;
      });
      selectEl.innerHTML = optionsHtml;
    }

    const qtyInput = document.getElementById('waste-qty-input');
    if (qtyInput) qtyInput.value = '1';

    const notesInput = document.getElementById('waste-notes-input');
    if (notesInput) notesInput.value = '';

    if (this.wasteModal) {
      this.wasteModal.classList.add('modal-visible');
    }
  },

  closeWasteModal() {
    if (this.wasteModal) {
      this.wasteModal.classList.remove('modal-visible');
    }
  },

  submitWasteLog() {
    const selectEl = document.getElementById('waste-product-select');
    const qtyInput = document.getElementById('waste-qty-input');
    const reasonSelect = document.getElementById('waste-reason-select');
    const notesInput = document.getElementById('waste-notes-input');

    if (!selectEl || !qtyInput) return;

    const productId = selectEl.value;
    const qty = parseInt(qtyInput.value, 10);
    const reason = reasonSelect ? reasonSelect.value : 'Dropped / Spilled';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity of wasted items (at least 1).');
      return;
    }

    const prod = window.appStore.products.find(p => p.id === productId);
    if (!prod) return;

    if (qty > prod.stock) {
      alert(`Cannot log ${qty} wasted units: Current stock is only ${prod.stock}.`);
      return;
    }

    const success = window.appStore.logKitchenWaste(productId, qty, reason, notes);
    if (success) {
      this.closeWasteModal();
    }
  },

  // --------------------------------------------------------------------------
  // Inventory Table & Low-Stock Alerts Rendering
  // --------------------------------------------------------------------------
  render() {
    this.renderProductsTable();
    this.renderIngredientsTable();
    this.renderWasteLogsTable();
  },

  renderProductsTable() {
    if (!this.tableBody) return;

    let products = window.appStore.products.slice();

    // Filter by category
    if (this.activeCategory !== 'all') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }

    // Evaluate stock thresholds across all items
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
          <td colspan="8" class="text-center py-4 text-sub">No menu products found matching filters.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    products.forEach(p => {
      let statusBadge = '';
      if (p.stock === 0) {
        statusBadge = '<span class="status-badge badge-out-of-stock">Sold Out</span>';
      } else if (p.stock <= p.minStock) {
        statusBadge = `<span class="status-badge badge-low-stock">Low Stock (${p.stock})</span>`;
      } else {
        statusBadge = `<span class="status-badge badge-in-stock">In Stock (${p.stock})</span>`;
      }

      // Compute limiting bottleneck ingredient from Recipe BOM
      const bottleneck = typeof window.appStore.getBottleneckInfo === 'function'
        ? window.appStore.getBottleneckInfo(p.id)
        : null;

      let bottleneckHtml = '';
      if (bottleneck) {
        bottleneckHtml = `<span class="bottleneck-tag" title="Bottleneck: ${bottleneck.name} (Requires ${bottleneck.reqQty} ${bottleneck.unit}/portion)">${bottleneck.name} (<span class="tabular-nums">${bottleneck.stock}&nbsp;${bottleneck.unit}</span> left)</span>`;
      } else {
        bottleneckHtml = '<span class="bottleneck-tag bottleneck-ok">Raw Supplies Plentiful</span>';
      }

      rowsHtml += `
        <tr>
          <td class="font-mono text-sub">${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td><span class="category-tag">${p.categoryName || p.category}</span></td>
          <td class="tabular-price">PHP ${p.price.toFixed(2)}</td>
          <td class="tabular-price font-bold">${p.stock}&nbsp;portions</td>
          <td class="tabular-price text-sub">${p.minStock}&nbsp;portions</td>
          <td>${statusBadge}</td>
          <td>${bottleneckHtml}</td>
        </tr>
      `;
    });

    this.tableBody.innerHTML = rowsHtml;
  },

  // --------------------------------------------------------------------------
  // Raw Ingredients & Packaging Supplies Table (31 Items)
  // --------------------------------------------------------------------------
  renderIngredientsTable() {
    if (!this.ingredientsTableBody) return;

    let ingredients = window.appStore.ingredients || [];

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      ingredients = ingredients.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) || 
        (i.id && i.id.toLowerCase().includes(q)) || 
        (i.category && i.category.toLowerCase().includes(q))
      );
    }

    if (ingredients.length === 0) {
      this.ingredientsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-sub">No raw kitchen ingredients found matching filters.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    ingredients.forEach(ing => {
      const stock = Number(ing.stock) || 0;
      const minStock = Number(ing.minStock) || 0;
      const unit = ing.unit || 'units';

      let statusBadge = '';
      if (stock <= 0) {
        statusBadge = '<span class="status-badge badge-out-of-stock">Depleted (0)</span>';
      } else if (stock <= minStock) {
        statusBadge = `<span class="status-badge badge-low-stock">Low Stock (<span class="tabular-nums">${stock}</span>)</span>`;
      } else {
        statusBadge = `<span class="status-badge badge-in-stock">In Stock (<span class="tabular-nums">${stock}</span>)</span>`;
      }

      const isGramOrMl = unit === 'g' || unit === 'ml';
      const step1 = isGramOrMl ? 500 : 25;
      const step2 = isGramOrMl ? 1000 : 50;

      rowsHtml += `
        <tr>
          <td class="font-mono text-sub font-bold">${ing.id}</td>
          <td><strong>${ing.name}</strong></td>
          <td><span class="category-tag">${ing.category}</span></td>
          <td class="tabular-price font-bold">${stock.toLocaleString()}&nbsp;${unit}</td>
          <td class="text-sub font-mono font-small">${unit}</td>
          <td class="tabular-price text-sub">${minStock.toLocaleString()}&nbsp;${unit}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="inventory-actions" style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="btn-restock-ing" data-id="${ing.id}" data-amount="${step1}">+${step1}&nbsp;${unit}</button>
              <button type="button" class="btn-restock-ing" data-id="${ing.id}" data-amount="${step2}">+${step2}&nbsp;${unit}</button>
            </div>
          </td>
        </tr>
      `;
    });

    this.ingredientsTableBody.innerHTML = rowsHtml;

    // Attach event listeners to raw ingredient restock buttons
    this.ingredientsTableBody.querySelectorAll('.btn-restock-ing').forEach(btn => {
      btn.addEventListener('click', () => {
        const ingId = btn.dataset.id;
        const amount = parseFloat(btn.dataset.amount);
        if (!ingId || isNaN(amount) || amount <= 0) return;

        const success = window.appStore.replenishIngredient(ingId, amount);
        if (success) {
          this.render();
        }
      });
    });
  },

  // --------------------------------------------------------------------------
  // Kitchen Waste & Spoilage Audit Log Rendering
  // --------------------------------------------------------------------------
  renderWasteLogsTable() {
    if (!this.wasteTableBody) return;

    const wasteLogs = window.appStore.wasteLogs || [];

    if (wasteLogs.length === 0) {
      this.wasteTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-sub">Zero kitchen waste logged today. Use "Log Kitchen Waste" button to record dropped or spoiled food.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    wasteLogs.slice(0, 10).forEach(w => {
      rowsHtml += `
        <tr>
          <td class="font-mono font-bold text-main">#${w.id}</td>
          <td class="text-sub font-mono font-small">${w.time}</td>
          <td><strong>${w.productName}</strong></td>
          <td class="tabular-price font-bold text-danger">${w.quantity} units</td>
          <td class="tabular-price font-bold">PHP ${w.costLost}</td>
          <td><span class="category-tag">${w.reason}</span></td>
          <td class="text-sub font-small">${w.notes || 'N/A'}</td>
        </tr>
      `;
    });

    this.wasteTableBody.innerHTML = rowsHtml;
  }
};

window.InventoryController = InventoryController;
