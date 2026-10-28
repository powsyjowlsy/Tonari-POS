// Inventory Management, Threshold Warning, Bi-Directional Restock, Dynamic Category Pills & Dual Kitchen Waste Logger
// Implements: SRS RTM-FR-008 (Low-Stock Warnings) & RTM-FR-009 (Kitchen Waste / Spoilage Tracking)
// Observes: Zero-Emoji Invariant, Tabular Numerals, Educational Commenting

const InventoryController = {
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,
  currentSubTab: 'products', // 'products' | 'ingredients' | 'waste'
  currentWasteType: 'product', // 'product' | 'ingredient'
  adjustMode: 'delta', // 'delta' (+/- relative) | 'set' (= exact count)

  init() {
    // DOM Element References
    this.tableBody = document.getElementById('inventory-table-body');
    this.alertBanner = document.getElementById('inventory-alert-banner');
    this.editModal = document.getElementById('inventory-edit-modal');
    this.wasteModal = document.getElementById('inventory-waste-modal');
    this.wasteTableBody = document.getElementById('waste-log-table-body');

    this.productsTableContainer = document.getElementById('products-table-container');
    this.ingredientsTableContainer = document.getElementById('ingredients-table-container');
    this.wasteTableContainer = document.getElementById('waste-table-container');
    this.ingredientsTableBody = document.getElementById('ingredients-table-body');

    this.btnTabProducts = document.getElementById('btn-tab-inv-products');
    this.btnTabIngredients = document.getElementById('btn-tab-inv-ingredients');
    this.btnTabWaste = document.getElementById('btn-tab-inv-waste');

    this.categoryPills = document.getElementById('inventory-category-pills');
    this.categorySelect = document.getElementById('inventory-category-select');

    this.addIngModal = document.getElementById('add-ingredient-modal');
    this.addProdModal = document.getElementById('add-product-modal');

    this.bindEvents();
    this.switchSubTab('products');

    // Subscribe to reactive appStore state updates
    window.appStore.subscribe((event) => {
      if (event === 'products-updated' || event === 'waste-logs-updated' || event === 'ingredients-updated' || event === 'recipes-updated' || event === 'categories-updated') {
        this.renderCategoryFilters();
        this.render();
      }
    });
  },

  bindEvents() {
    // Custom Stock Adjustment Modal triggers
    const btnCloseAdjust = document.getElementById('btn-close-adjust-modal');
    if (btnCloseAdjust) btnCloseAdjust.addEventListener('click', () => this.closeAdjustModal());
    const btnCancelAdjust = document.getElementById('btn-cancel-restock-adjust');
    if (btnCancelAdjust) btnCancelAdjust.addEventListener('click', () => this.closeAdjustModal());
    const btnConfirmAdjust = document.getElementById('btn-confirm-restock-adjust');
    if (btnConfirmAdjust) btnConfirmAdjust.addEventListener('click', () => this.submitAdjustModal());
    // Live projected-stock preview while typing a delta or target count
    const adjustDeltaInput = document.getElementById('adjust-stock-delta');
    if (adjustDeltaInput) {
      adjustDeltaInput.addEventListener('input', () => this.updateAdjustPreview());
    }
    // Segmented mode toggle: Adjust by Delta (+/-) vs Set Exact Stock (=)
    const btnModeDelta = document.getElementById('btn-adjust-mode-delta');
    const btnModeSet = document.getElementById('btn-adjust-mode-set');
    if (btnModeDelta) btnModeDelta.addEventListener('click', () => this.setAdjustMode('delta'));
    if (btnModeSet) btnModeSet.addEventListener('click', () => this.setAdjustMode('set'));
    // Quick-preset chips add their step in 'delta' mode or set exact value in 'set' mode
    const adjustPresetContainer = document.getElementById('adjust-preset-chips');
    if (adjustPresetContainer) {
      adjustPresetContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-adjust-preset');
        if (!btn || !adjustDeltaInput) return;
        if (this.adjustMode === 'set') {
          const targetVal = parseFloat(btn.dataset.target);
          if (!isNaN(targetVal)) adjustDeltaInput.value = String(targetVal);
        } else {
          const step = parseFloat(btn.dataset.delta) || 0;
          const current = parseFloat(adjustDeltaInput.value) || 0;
          adjustDeltaInput.value = String(current + step);
        }
        this.updateAdjustPreview();
      });
    }
    // 3-Tab Segment Switching
    if (this.btnTabProducts) {
      this.btnTabProducts.addEventListener('click', () => this.switchSubTab('products'));
    }
    if (this.btnTabIngredients) {
      this.btnTabIngredients.addEventListener('click', () => this.switchSubTab('ingredients'));
    }
    if (this.btnTabWaste) {
      this.btnTabWaste.addEventListener('click', () => this.switchSubTab('waste'));
    }

    // Inventory search filter input
    const searchInput = document.getElementById('inventory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }

    // Synchronized Category Select dropdown
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.renderCategoryFilters();
        this.render();
      });
    }

    // Edit Item Modal handlers
    const btnCloseEdit = document.getElementById('btn-close-edit-modal');
    if (btnCloseEdit) btnCloseEdit.addEventListener('click', () => this.closeEditModal());
    const btnXCloseEdit = document.getElementById('btn-x-close-edit-modal');
    if (btnXCloseEdit) btnXCloseEdit.addEventListener('click', () => this.closeEditModal());
    const btnSaveEdit = document.getElementById('btn-save-edit-modal');
    if (btnSaveEdit) btnSaveEdit.addEventListener('click', () => this.saveEditModal());

    // Waste Modal Trigger & Close handlers
    const btnOpenWaste = document.getElementById('btn-open-waste-modal');
    if (btnOpenWaste) {
      btnOpenWaste.addEventListener('click', () => {
        const defaultType = this.currentSubTab === 'ingredients' ? 'ingredient' : 'product';
        this.openWasteModal(defaultType);
      });
    }
    const btnCloseWaste = document.getElementById('btn-close-waste-modal');
    if (btnCloseWaste) btnCloseWaste.addEventListener('click', () => this.closeWasteModal());
    const btnXCloseWaste = document.getElementById('btn-x-close-waste-modal');
    if (btnXCloseWaste) btnXCloseWaste.addEventListener('click', () => this.closeWasteModal());

    // Waste Modal Type Toggle Buttons
    const btnWasteDish = document.getElementById('btn-waste-type-dish');
    const btnWasteSupply = document.getElementById('btn-waste-type-supply');
    if (btnWasteDish && btnWasteSupply) {
      btnWasteDish.addEventListener('click', () => {
        this.setWasteType('product');
      });
      btnWasteSupply.addEventListener('click', () => {
        this.setWasteType('ingredient');
      });
    }

    // Confirm Waste Logging button
    const btnConfirmWaste = document.getElementById('btn-confirm-waste-log');
    if (btnConfirmWaste) {
      btnConfirmWaste.addEventListener('click', () => this.submitWasteLog());
    }

    // Add Raw Ingredient Modal triggers
    const btnOpenAddIng = document.getElementById('btn-open-add-ingredient-modal');
    if (btnOpenAddIng) btnOpenAddIng.addEventListener('click', () => this.openAddIngredientModal());
    const btnCloseAddIng = document.getElementById('btn-close-add-ing-modal');
    if (btnCloseAddIng) btnCloseAddIng.addEventListener('click', () => this.closeAddIngredientModal());
    const btnXCloseAddIng = document.getElementById('btn-x-close-add-ing-modal');
    if (btnXCloseAddIng) btnXCloseAddIng.addEventListener('click', () => this.closeAddIngredientModal());
    const btnSaveAddIng = document.getElementById('btn-save-add-ing');
    if (btnSaveAddIng) btnSaveAddIng.addEventListener('click', () => this.saveAddIngredientModal());

    // Add Menu Product & Recipe BOM Modal triggers
    const btnOpenAddProd = document.getElementById('btn-open-add-product-modal');
    if (btnOpenAddProd) btnOpenAddProd.addEventListener('click', () => this.openAddProductModal());
    const btnCloseAddProd = document.getElementById('btn-close-add-prod-modal');
    if (btnCloseAddProd) btnCloseAddProd.addEventListener('click', () => this.closeAddProductModal());
    const btnXCloseAddProd = document.getElementById('btn-x-close-add-prod-modal');
    if (btnXCloseAddProd) btnXCloseAddProd.addEventListener('click', () => this.closeAddProductModal());
    const btnAddBomRow = document.getElementById('btn-add-bom-row');
    if (btnAddBomRow) btnAddBomRow.addEventListener('click', () => this.addRecipeBomRow());
    const btnSaveAddProd = document.getElementById('btn-save-add-prod');
    if (btnSaveAddProd) btnSaveAddProd.addEventListener('click', () => this.saveAddProductModal());
  },

  // --------------------------------------------------------------------------
  // Sub-Tab Segment Switching
  // --------------------------------------------------------------------------
  switchSubTab(tabName) {
    this.currentSubTab = tabName;
    this.activeCategory = 'all';

    // Update Tab Button States
    if (this.btnTabProducts) this.btnTabProducts.classList.toggle('active', tabName === 'products');
    if (this.btnTabIngredients) this.btnTabIngredients.classList.toggle('active', tabName === 'ingredients');
    if (this.btnTabWaste) this.btnTabWaste.classList.toggle('active', tabName === 'waste');

    // Update Table Containers Visibility
    if (this.productsTableContainer) this.productsTableContainer.style.display = (tabName === 'products') ? 'block' : 'none';
    if (this.ingredientsTableContainer) this.ingredientsTableContainer.style.display = (tabName === 'ingredients') ? 'block' : 'none';
    if (this.wasteTableContainer) this.wasteTableContainer.style.display = (tabName === 'waste') ? 'block' : 'none';

    // Contextualize Toolbar Action Buttons
    const btnAddProduct = document.getElementById('btn-open-add-product-modal');
    const btnAddIngredient = document.getElementById('btn-open-add-ingredient-modal');
    if (btnAddProduct) btnAddProduct.style.display = (tabName === 'products') ? 'inline-flex' : 'none';
    if (btnAddIngredient) btnAddIngredient.style.display = (tabName === 'ingredients') ? 'inline-flex' : 'none';

    this.renderCategoryFilters();
    this.render();
  },

  // --------------------------------------------------------------------------
  // Dynamic Category Filter Pills & Synchronized Select
  // --------------------------------------------------------------------------
  renderCategoryFilters() {
    let categories = [];
    let itemCounts = {};

    // Retrieve registered categories from persistent store matching current subtab
    const registeredCats = (window.appStore.categories || []).filter(c => {
      if (this.currentSubTab === 'products') return c.type === 'menu';
      if (this.currentSubTab === 'ingredients') return c.type === 'raw';
      return false;
    });

    if (this.currentSubTab === 'products') {
      const prods = window.appStore.products || [];
      itemCounts['all'] = prods.length;

      // Seed with registered categories from store
      registeredCats.forEach(c => {
        if (!categories.includes(c.name)) {
          categories.push(c.name);
          itemCounts[c.name] = 0;
        }
      });

      prods.forEach(p => {
        const cat = p.categoryName || p.category || 'Other';
        if (!categories.includes(cat)) {
          categories.push(cat);
          itemCounts[cat] = 0;
        }
        itemCounts[cat] = (itemCounts[cat] || 0) + 1;
      });
    } else if (this.currentSubTab === 'ingredients') {
      const ings = window.appStore.ingredients || [];
      itemCounts['all'] = ings.length;

      // Seed with registered raw categories from store
      registeredCats.forEach(c => {
        if (!categories.includes(c.name)) {
          categories.push(c.name);
          itemCounts[c.name] = 0;
        }
      });

      ings.forEach(i => {
        const cat = i.category || 'Supplies';
        if (!categories.includes(cat)) {
          categories.push(cat);
          itemCounts[cat] = 0;
        }
        itemCounts[cat] = (itemCounts[cat] || 0) + 1;
      });
    } else if (this.currentSubTab === 'waste') {
      const logs = window.appStore.wasteLogs || [];
      itemCounts['all'] = logs.length;
      ['Menu Dish', 'Raw Supply'].forEach(type => {
        const count = logs.filter(l => l.itemType === type).length;
        itemCounts[type] = count;
        categories.push(type);
      });
    }

    // Synchronize Dropdown Select Options
    if (this.categorySelect) {
      let selectHtml = `<option value="all">All Categories (${itemCounts['all'] || 0})</option>`;
      categories.forEach(c => {
        selectHtml += `<option value="${c}" ${this.activeCategory === c ? 'selected' : ''}>${c} (${itemCounts[c] || 0})</option>`;
      });
      this.categorySelect.innerHTML = selectHtml;
      this.categorySelect.value = this.activeCategory;
    }

    // Render Category Button Pills
    if (this.categoryPills) {
      let pillsHtml = `
        <button type="button" class="inv-cat-pill ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
          All <span class="pill-badge">${itemCounts['all'] || 0}</span>
        </button>
      `;
      categories.forEach(c => {
        pillsHtml += `
          <button type="button" class="inv-cat-pill ${this.activeCategory === c ? 'active' : ''}" data-cat="${c}">
            ${c} <span class="pill-badge">${itemCounts[c] || 0}</span>
          </button>
        `;
      });
      this.categoryPills.innerHTML = pillsHtml;

      this.categoryPills.querySelectorAll('.inv-cat-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.dataset.cat;
          if (this.categorySelect) this.categorySelect.value = this.activeCategory;
          this.renderCategoryFilters();
          this.render();
        });
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
      window.appStore.showToast('Please enter a valid unit price.', 'warning');
      return;
    }

    if (isNaN(newThreshold) || newThreshold < 1) {
      window.appStore.showToast('Please enter a valid stock alert threshold (minimum 1).', 'warning');
      return;
    }

    window.appStore.updateProductDetails(this.selectedProduct.id, newPrice, newThreshold);
    window.appStore.showToast(`Updated product settings for ${this.selectedProduct.name}.`, 'success');
    this.closeEditModal();
  },

  // --------------------------------------------------------------------------
  // Dual-Type Kitchen Waste Modal (SRS RTM-FR-009)
  // --------------------------------------------------------------------------
  openWasteModal(defaultType = 'product') {
    this.setWasteType(defaultType);

    const qtyInput = document.getElementById('waste-qty-input');
    if (qtyInput) qtyInput.value = '1';

    const notesInput = document.getElementById('waste-notes-input');
    if (notesInput) notesInput.value = '';

    if (this.wasteModal) {
      this.wasteModal.classList.add('modal-visible');
    }
  },

  setWasteType(type) {
    this.currentWasteType = type;

    const btnDish = document.getElementById('btn-waste-type-dish');
    const btnSupply = document.getElementById('btn-waste-type-supply');
    const selectLabel = document.getElementById('waste-select-label');
    const selectEl = document.getElementById('waste-product-select');
    const unitLabel = document.getElementById('waste-unit-label');

    if (btnDish) btnDish.classList.toggle('active', type === 'product');
    if (btnSupply) btnSupply.classList.toggle('active', type === 'ingredient');

    if (!selectEl) return;

    if (type === 'ingredient') {
      if (selectLabel) selectLabel.textContent = 'Select Wasted Raw Supply:';
      let optionsHtml = '';
      (window.appStore.ingredients || []).forEach(ing => {
        optionsHtml += `<option value="${ing.id}" data-unit="${ing.unit || 'units'}" data-stock="${ing.stock}">${ing.name} (${ing.id}) - Stock: ${ing.stock} ${ing.unit}</option>`;
      });
      selectEl.innerHTML = optionsHtml;

      const updateUnit = () => {
        const opt = selectEl.options[selectEl.selectedIndex];
        if (unitLabel && opt) {
          unitLabel.textContent = opt.dataset.unit || 'units';
        }
      };
      selectEl.onchange = updateUnit;
      updateUnit();
    } else {
      if (selectLabel) selectLabel.textContent = 'Select Wasted Prepared Dish:';
      let optionsHtml = '';
      (window.appStore.products || []).forEach(p => {
        const portions = typeof window.appStore.computeAvailablePortions === 'function'
          ? window.appStore.computeAvailablePortions(p.id)
          : (p.stock || 0);
        optionsHtml += `<option value="${p.id}" data-unit="portions" data-stock="${portions}">${p.name} - Portions: ${portions}</option>`;
      });
      selectEl.innerHTML = optionsHtml;

      if (unitLabel) unitLabel.textContent = 'portions';
      selectEl.onchange = null;
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

    const itemId = selectEl.value;
    const qty = parseFloat(qtyInput.value);
    const reason = reasonSelect ? reasonSelect.value : 'Dropped / Spilled';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (isNaN(qty) || qty <= 0) {
      window.appStore.showToast('Please enter a valid wasted quantity (greater than 0).', 'warning');
      return;
    }

    const opt = selectEl.options[selectEl.selectedIndex];
    const availableStock = opt ? parseFloat(opt.dataset.stock) : Infinity;

    const success = window.appStore.logKitchenWaste(itemId, this.currentWasteType, qty, reason, notes);
    if (success) {
      window.appStore.showToast('Kitchen waste recorded.', 'success');
      this.closeWasteModal();
      this.render();
    }
  },

  // --------------------------------------------------------------------------
  // Add Raw Ingredient Modal
  // --------------------------------------------------------------------------
  openAddIngredientModal() {
    const nameInput = document.getElementById('add-ing-name');
    if (nameInput) nameInput.value = '';
    const stockInput = document.getElementById('add-ing-stock');
    if (stockInput) stockInput.value = '100';
    const threshInput = document.getElementById('add-ing-threshold');
    if (threshInput) threshInput.value = '20';
    const costInput = document.getElementById('add-ing-cost');
    if (costInput) costInput.value = '0.50';

    // Populate dynamic raw categories
    const catSelect = document.getElementById('add-ing-category');
    if (catSelect && window.appStore && window.appStore.categories) {
      const rawCats = window.appStore.categories.filter(c => c.type === 'raw');
      if (rawCats.length > 0) {
        catSelect.innerHTML = rawCats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }

    if (this.addIngModal) {
      this.addIngModal.classList.add('modal-visible');
    }
  },

  closeAddIngredientModal() {
    if (this.addIngModal) {
      this.addIngModal.classList.remove('modal-visible');
    }
  },

  saveAddIngredientModal() {
    const nameInput = document.getElementById('add-ing-name');
    const catSelect = document.getElementById('add-ing-category');
    const stockInput = document.getElementById('add-ing-stock');
    const unitSelect = document.getElementById('add-ing-unit');
    const threshInput = document.getElementById('add-ing-threshold');
    const costInput = document.getElementById('add-ing-cost');

    if (!nameInput || !nameInput.value.trim()) {
      window.appStore.showToast('Please enter a valid supply name.', 'warning');
      return;
    }

    const result = window.appStore.addIngredient({
      name: nameInput.value.trim(),
      category: catSelect ? catSelect.value : 'Proteins',
      stock: parseFloat(stockInput.value) || 0,
      unit: unitSelect ? unitSelect.value : 'g',
      minStock: parseFloat(threshInput.value) || 10,
      costPerUnit: parseFloat(costInput.value) || 0
    });

    if (result && result.success) {
      window.appStore.showToast(`Raw supply "${nameInput.value.trim()}" created.`, 'success');
      this.closeAddIngredientModal();
      this.renderCategoryFilters();
      this.render();
    } else {
      window.appStore.showToast(result && result.error ? result.error : 'Failed to add raw supply.', 'error');
    }
  },

  // --------------------------------------------------------------------------
  // Add Finished Menu Item & Recipe BOM Modal
  // --------------------------------------------------------------------------
  openAddProductModal() {
    const nameInput = document.getElementById('add-prod-name');
    if (nameInput) nameInput.value = '';
    const priceInput = document.getElementById('add-prod-price');
    if (priceInput) priceInput.value = '';
    const descInput = document.getElementById('add-prod-desc');
    if (descInput) descInput.value = '';
    const modInput = document.getElementById('add-prod-modifiers');
    if (modInput) modInput.value = '';

    const rowsContainer = document.getElementById('recipe-bom-rows-container');
    if (rowsContainer) {
      rowsContainer.innerHTML = '';
      this.addRecipeBomRow(); // Add initial blank BOM row
    }

    this.updateRecipeBomYield();

    // Populate dynamic menu categories
    const catSelect = document.getElementById('add-prod-category');
    if (catSelect && window.appStore && window.appStore.categories) {
      const menuCats = window.appStore.categories.filter(c => c.type === 'menu');
      if (menuCats.length > 0) {
        catSelect.innerHTML = menuCats.map(c => `<option value="${c.id || c.name.toLowerCase()}">${c.name}</option>`).join('');
      }
    }

    if (this.addProdModal) {
      this.addProdModal.classList.add('modal-visible');
    }
  },

  closeAddProductModal() {
    if (this.addProdModal) {
      this.addProdModal.classList.remove('modal-visible');
    }
  },

  addRecipeBomRow(selectedIngId = '', qty = 1) {
    const container = document.getElementById('recipe-bom-rows-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'recipe-bom-row';

    let optionsHtml = '<option value="">-- Choose Raw Ingredient --</option>';
    (window.appStore.ingredients || []).forEach(ing => {
      const isSel = ing.id === selectedIngId ? 'selected' : '';
      optionsHtml += `<option value="${ing.id}" data-unit="${ing.unit || 'units'}" ${isSel}>${ing.name} (${ing.id}) [${ing.unit}]</option>`;
    });

    row.innerHTML = `
      <select class="recipe-ing-select discount-select" style="padding: 6px 8px; width: 100%;">
        ${optionsHtml}
      </select>
      <input type="number" class="recipe-ing-qty search-input" value="${qty}" min="0.01" step="any" placeholder="Qty">
      <span class="recipe-ing-unit text-sub font-mono font-bold" style="font-size: 11px;">units</span>
      <button type="button" class="recipe-bom-del-btn" title="Remove ingredient">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
        </svg>
      </button>
    `;

    const selectEl = row.querySelector('.recipe-ing-select');
    const unitEl = row.querySelector('.recipe-ing-unit');
    const qtyEl = row.querySelector('.recipe-ing-qty');
    const delBtn = row.querySelector('.recipe-bom-del-btn');

    const syncUnit = () => {
      const opt = selectEl.options[selectEl.selectedIndex];
      if (opt && opt.dataset.unit) {
        unitEl.textContent = opt.dataset.unit;
      }
      this.updateRecipeBomYield();
    };

    selectEl.addEventListener('change', syncUnit);
    qtyEl.addEventListener('input', () => this.updateRecipeBomYield());

    delBtn.addEventListener('click', () => {
      row.remove();
      this.updateRecipeBomYield();
    });

    container.appendChild(row);
    syncUnit();
  },

  updateRecipeBomYield() {
    const container = document.getElementById('recipe-bom-rows-container');
    const callout = document.getElementById('recipe-bom-yield-callout');
    const textEl = document.getElementById('recipe-bom-yield-text');
    if (!container || !callout || !textEl) return;

    const rows = container.querySelectorAll('.recipe-bom-row');
    const reqs = [];
    rows.forEach(r => {
      const ingId = r.querySelector('.recipe-ing-select').value;
      const qty = parseFloat(r.querySelector('.recipe-ing-qty').value);
      if (ingId && !isNaN(qty) && qty > 0) {
        reqs.push({ ingId, qty });
      }
    });

    if (reqs.length === 0) {
      callout.style.display = 'none';
      return;
    }

    let minYield = Infinity;
    let limitingName = '';

    reqs.forEach(r => {
      const ing = (window.appStore.ingredients || []).find(i => i.id === r.ingId);
      if (ing) {
        const possible = Math.floor((Number(ing.stock) || 0) / r.qty);
        if (possible < minYield) {
          minYield = possible;
          limitingName = ing.name;
        }
      } else {
        minYield = 0;
      }
    });

    callout.style.display = 'flex';
    if (minYield === Infinity || minYield <= 0) {
      textEl.textContent = `Estimated yield: 0 portions (Bottleneck: ${limitingName || 'Insufficient stock'})`;
    } else {
      textEl.textContent = `Estimated available portion yield: ${minYield} portions (Limiting supply: ${limitingName})`;
    }
  },

  saveAddProductModal() {
    const nameInput = document.getElementById('add-prod-name');
    const priceInput = document.getElementById('add-prod-price');
    const catSelect = document.getElementById('add-prod-category');
    const minStockInput = document.getElementById('add-prod-minstock');
    const descInput = document.getElementById('add-prod-desc');
    const modInput = document.getElementById('add-prod-modifiers');

    if (!nameInput || !nameInput.value.trim()) {
      window.appStore.showToast('Product name is required.', 'warning');
      return;
    }

    const price = parseFloat(priceInput.value);
    if (isNaN(price) || price < 0) {
      window.appStore.showToast('Please enter a valid retail price.', 'warning');
      return;
    }

    // Gather Recipe BOM rows
    const container = document.getElementById('recipe-bom-rows-container');
    const recipeRows = [];
    if (container) {
      container.querySelectorAll('.recipe-bom-row').forEach(r => {
        const ingId = r.querySelector('.recipe-ing-select').value;
        const qty = parseFloat(r.querySelector('.recipe-ing-qty').value);
        if (ingId && !isNaN(qty) && qty > 0) {
          recipeRows.push({ ingredientId: ingId, quantity: qty });
        }
      });
    }

    const result = window.appStore.addProduct({
      name: nameInput.value.trim(),
      price: price,
      category: catSelect ? catSelect.value : 'curry',
      categoryName: catSelect ? catSelect.options[catSelect.selectedIndex].text : 'Menu Item',
      minStock: parseInt(minStockInput.value, 10) || 5,
      description: descInput ? descInput.value.trim() : '',
      modifiers: modInput ? modInput.value : ''
    }, recipeRows);

    if (result && result.success) {
      window.appStore.showToast(`Menu product "${nameInput.value.trim()}" created.`, 'success');
      this.closeAddProductModal();
      this.renderCategoryFilters();
      this.render();
    } else {
      window.appStore.showToast(result && result.error ? result.error : 'Failed to create product.', 'error');
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

    let products = (window.appStore.products || []).slice();

    // Filter by active category
    if (this.activeCategory !== 'all') {
      products = products.filter(p => (p.categoryName || p.category) === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }

    // Evaluate stock thresholds across all items
    const lowStockItems = (window.appStore.products || []).filter(p => p.stock <= p.minStock && p.stock > 0);
    const outOfStockItems = (window.appStore.products || []).filter(p => p.stock === 0);

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
  // Raw Ingredients & Packaging Supplies Table (Bi-Directional Adjustments)
  // --------------------------------------------------------------------------
  renderIngredientsTable() {
    if (!this.ingredientsTableBody) return;

    let ingredients = (window.appStore.ingredients || []).slice();

    // Filter by active category
    if (this.activeCategory !== 'all') {
      ingredients = ingredients.filter(i => i.category === this.activeCategory);
    }

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
            <div class="inventory-actions" style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn-restock-minus" data-id="${ing.id}" data-delta="-${step1}">-${step1}</button>
              <button type="button" class="btn-restock-plus" data-id="${ing.id}" data-delta="${step1}">+${step1}</button>
              <button type="button" class="btn-restock-minus" data-id="${ing.id}" data-delta="-${step2}">-${step2}</button>
              <button type="button" class="btn-restock-plus" data-id="${ing.id}" data-delta="${step2}">+${step2}</button>
              <button type="button" class="btn-restock-adjust" data-id="${ing.id}" data-name="${ing.name}" data-unit="${unit}">Adjust</button>
              <button type="button" class="btn-restock-set" data-id="${ing.id}" data-name="${ing.name}" data-unit="${unit}">Set</button>
            </div>
          </td>
        </tr>
      `;
    });

    this.ingredientsTableBody.innerHTML = rowsHtml;

    // Attach bi-directional restock handlers
    this.ingredientsTableBody.querySelectorAll('.btn-restock-minus, .btn-restock-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const ingId = btn.dataset.id;
        const delta = parseFloat(btn.dataset.delta);
        if (!ingId || isNaN(delta) || delta === 0) return;

        const success = window.appStore.adjustIngredientStock(ingId, delta);
        if (success) {
          this.render();
        }
      });
    });

    // Attach custom physical stock adjust (+/-) and exact set (=) handlers
    this.ingredientsTableBody.querySelectorAll('.btn-restock-adjust').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openAdjustModal(btn.dataset.id, btn.dataset.name, btn.dataset.unit, 'delta');
      });
    });
    this.ingredientsTableBody.querySelectorAll('.btn-restock-set').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openAdjustModal(btn.dataset.id, btn.dataset.name, btn.dataset.unit, 'set');
      });
    });
  },

  openAdjustModal(ingId, name, unit, mode = 'delta') {
    const modal = document.getElementById('restock-adjust-modal');
    if (!modal) return;
    // Cache baseline stock and unit for the live preview
    const ing = (window.appStore.ingredients || []).find(i => i.id === ingId);
    this.adjustCurrentStockVal = ing ? (Number(ing.stock) || 0) : 0;
    this.adjustCurrentUnitVal = unit || (ing && ing.unit) || 'units';

    const idInput = document.getElementById('adjust-ingredient-id');
    const skuEl = document.getElementById('adjust-ingredient-sku');
    const nameEl = document.getElementById('adjust-ingredient-name');
    const unitEl = document.getElementById('adjust-ingredient-unit');
    const unitBadgeEl = document.getElementById('adjust-ingredient-unit-badge');

    if (idInput) idInput.value = ingId;
    if (skuEl) skuEl.textContent = ingId;
    if (nameEl) nameEl.textContent = name;
    if (unitEl) unitEl.textContent = this.adjustCurrentUnitVal;
    if (unitBadgeEl) unitBadgeEl.textContent = `Unit: ${this.adjustCurrentUnitVal}`;

    this.setAdjustMode(mode);
    modal.classList.add('modal-visible');
  },

  setAdjustMode(mode) {
    this.adjustMode = mode === 'set' ? 'set' : 'delta';
    const isSet = this.adjustMode === 'set';

    const btnDelta = document.getElementById('btn-adjust-mode-delta');
    const btnSet = document.getElementById('btn-adjust-mode-set');
    const titleEl = document.getElementById('adjust-modal-title');
    const subtitleEl = document.getElementById('adjust-modal-subtitle');
    const midLabelEl = document.getElementById('adjust-middle-metric-label');
    const finalLabelEl = document.getElementById('adjust-final-metric-label');
    const presetGroupLabel = document.getElementById('adjust-preset-group-label');
    const inputLabelText = document.getElementById('adjust-input-label-text');
    const inputHint = document.getElementById('adjust-input-hint');
    const confirmBtn = document.getElementById('btn-confirm-restock-adjust');
    const deltaInput = document.getElementById('adjust-stock-delta');
    const presetContainer = document.getElementById('adjust-preset-chips');

    if (btnDelta) btnDelta.classList.toggle('active', !isSet);
    if (btnSet) btnSet.classList.toggle('active', isSet);
    if (titleEl) titleEl.textContent = isSet ? 'Set Physical Stock Count' : 'Adjust Physical Stock';
    if (subtitleEl) subtitleEl.textContent = isSet ? 'Override current inventory with an exact physical audit count' : 'Record a delivery or reconcile a physical count';
    if (midLabelEl) midLabelEl.textContent = isSet ? 'Net Variance' : 'Adjustment';
    if (finalLabelEl) finalLabelEl.textContent = isSet ? 'New Stock' : 'Projected Stock';
    if (presetGroupLabel) presetGroupLabel.textContent = isSet ? 'Quick Target Stock Presets' : 'Quick Adjustment Presets';
    if (inputLabelText) inputLabelText.textContent = isSet ? 'Exact Physical Stock Count' : 'Stock Adjustment Delta';
    if (inputHint) inputHint.textContent = isSet ? 'Sets the ingredient stock directly to this exact non-negative value' : 'Positive for new deliveries, negative for prep trim or corrections';
    if (confirmBtn) confirmBtn.textContent = isSet ? 'Set Stock Count' : 'Apply Adjustment';
    if (deltaInput) {
      deltaInput.value = isSet ? String(this.adjustCurrentStockVal || 0) : '';
      deltaInput.placeholder = isSet ? 'e.g. 2500' : 'e.g. +500 or -250';
      if (isSet) deltaInput.setAttribute('min', '0');
      else deltaInput.removeAttribute('min');
    }

    if (presetContainer) {
      const isBulk = this.adjustCurrentUnitVal === 'g' || this.adjustCurrentUnitVal === 'ml';
      if (isSet) {
        const targets = isBulk ? [0, 250, 500, 1000, 2500, 5000] : [0, 10, 25, 50, 100, 250];
        presetContainer.innerHTML = targets.map(t => {
          return `<button type="button" class="btn-adjust-preset is-target tabular-nums" data-target="${t}">=${t}</button>`;
        }).join('');
      } else {
        const steps = isBulk ? [-1000, -500, -100, 100, 500, 1000] : [-50, -25, -10, 10, 25, 50];
        presetContainer.innerHTML = steps.map(s => {
          const label = s > 0 ? `+${s}` : `${s}`;
          const cls = s > 0 ? 'is-positive' : 'is-negative';
          return `<button type="button" class="btn-adjust-preset ${cls} tabular-nums" data-delta="${s}">${label}</button>`;
        }).join('');
      }
    }

    this.updateAdjustPreview();
  },

  // Recomputes the Current / Adjustment / Projected stock equation card
  updateAdjustPreview() {
    const currentEl = document.getElementById('adjust-current-stock');
    const deltaEl = document.getElementById('adjust-delta-preview');
    const projEl = document.getElementById('adjust-projected-stock');
    const deltaInput = document.getElementById('adjust-stock-delta');

    const base = Number(this.adjustCurrentStockVal) || 0;
    const unit = this.adjustCurrentUnitVal || 'units';
    const rawVal = deltaInput ? parseFloat(deltaInput.value) : NaN;

    let delta = 0;
    let projected = base;
    if (this.adjustMode === 'set') {
      projected = isNaN(rawVal) ? base : Math.max(0, rawVal);
      delta = projected - base;
    } else {
      delta = isNaN(rawVal) ? 0 : rawVal;
      projected = Math.max(0, base + delta);
    }

    if (currentEl) currentEl.textContent = `${base.toLocaleString()} ${unit}`;
    if (deltaEl) {
      deltaEl.textContent = `${delta > 0 ? '+' : ''}${delta.toLocaleString()} ${unit}`;
      deltaEl.className = 'stock-metric-val tabular-nums' + (delta > 0 ? ' is-positive' : (delta < 0 ? ' is-negative' : ''));
    }
    if (projEl) {
      projEl.textContent = `${projected.toLocaleString()} ${unit}`;
      projEl.className = 'stock-metric-val tabular-nums' + (projected === 0 ? ' is-negative' : (delta > 0 ? ' is-positive' : ''));
    }
  },

  closeAdjustModal() {
    const modal = document.getElementById('restock-adjust-modal');
    if (modal) modal.classList.remove('modal-visible');
  },

  submitAdjustModal() {
    const idInput = document.getElementById('adjust-ingredient-id');
    const deltaInput = document.getElementById('adjust-stock-delta');
    if (!idInput || !deltaInput) return;

    const ingId = idInput.value;
    const val = parseFloat(deltaInput.value);

    if (this.adjustMode === 'set') {
      if (isNaN(val) || val < 0) {
        window.appStore.showToast('Please enter a valid non-negative stock count (0 or higher).', 'warning');
        return;
      }
      const success = window.appStore.setIngredientStock(ingId, val);
      if (success) {
        window.appStore.showToast(`Physical stock set to ${val.toLocaleString()} ${this.adjustCurrentUnitVal || 'units'}.`, 'success');
        this.closeAdjustModal();
        this.render();
      } else {
        window.appStore.showToast('Failed to set physical stock.', 'error');
      }
      return;
    }

    if (isNaN(val) || val === 0) {
      window.appStore.showToast('Please enter a non-zero adjustment number.', 'warning');
      return;
    }

    const success = window.appStore.adjustIngredientStock(ingId, val);
    if (success) {
      window.appStore.showToast(`Stock adjusted by ${val > 0 ? '+' : ''}${val}.`, 'success');
      this.closeAdjustModal();
      this.render();
    } else {
      window.appStore.showToast('Failed to adjust stock.', 'error');
    }
  },

  // --------------------------------------------------------------------------
  // Kitchen Waste & Spoilage Audit Log Rendering
  // --------------------------------------------------------------------------
  renderWasteLogsTable() {
    if (!this.wasteTableBody) return;

    let wasteLogs = (window.appStore.wasteLogs || []).slice();

    // Filter by active category (Menu Dish vs Raw Supply)
    if (this.activeCategory !== 'all') {
      wasteLogs = wasteLogs.filter(w => w.itemType === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      wasteLogs = wasteLogs.filter(w => 
        (w.itemName && w.itemName.toLowerCase().includes(q)) ||
        (w.productName && w.productName.toLowerCase().includes(q)) ||
        (w.reason && w.reason.toLowerCase().includes(q)) ||
        (w.notes && w.notes.toLowerCase().includes(q)) ||
        (w.id && w.id.toLowerCase().includes(q))
      );
    }

    if (wasteLogs.length === 0) {
      this.wasteTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-sub">Zero kitchen waste logged matching active filters. Use "Log Kitchen Waste" to record dropped or spoiled inventory.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    wasteLogs.slice(0, 20).forEach(w => {
      const isSupply = w.itemType === 'Raw Supply';
      const typeBadge = isSupply
        ? '<span class="status-badge badge-supply">Raw Supply</span>'
        : '<span class="status-badge badge-dish">Menu Dish</span>';

      const itemName = w.itemName || w.productName || 'Unknown Item';
      const qtyStr = w.formattedQuantity || `${w.quantity} ${w.unit || 'units'}`;

      rowsHtml += `
        <tr>
          <td class="font-mono font-bold text-main">#${w.id}</td>
          <td class="text-sub font-mono font-small">${w.time}</td>
          <td>${typeBadge}</td>
          <td><strong>${itemName}</strong></td>
          <td class="tabular-price font-bold text-danger">${qtyStr}</td>
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
