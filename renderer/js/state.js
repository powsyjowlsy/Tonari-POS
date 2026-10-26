// Central Reactive State Store with LocalStorage Persistence for Tonari POS
// Observes: Silent Failure Hunting (try/catch logging), Zero-Emoji, Educational Commenting
// Implements: SRS RTM-FR-001 (Flavor Selection), RTM-FR-005 (PIN Security), RTM-FR-007 (Cash Float), RTM-FR-009 (Waste Logger)

class Store {
  constructor() {
    // ------------------------------------------------------------------------
    // Persistence Storage Keys
    // ------------------------------------------------------------------------
    this.STORAGE_KEYS = {
      PRODUCTS: 'tonari_pos_products',
      ORDERS: 'tonari_pos_orders',
      SETTINGS: 'tonari_pos_settings',
      WASTE_LOGS: 'tonari_pos_waste_logs',
      USERS: 'tonari_pos_users',
      CURRENT_USER: 'tonari_pos_current_user',
      INGREDIENTS: 'tonari_pos_ingredients',
      RECIPES: 'tonari_pos_recipes'
    };

    // Core In-Memory Domain State
    this.products = this.loadProducts();
    this.orders = this.loadOrders();
    this.settings = this.loadSettings();
    this.wasteLogs = this.loadWasteLogs();
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.ingredients = this.loadIngredients();
    this.recipes = this.loadRecipes();

    // Synchronize product stock with initial limiting ingredient bottleneck counts
    this.refreshProductPortions();

    // Ephemeral Transaction State
    this.cart = [];
    this.orderType = 'Dine-In';
    this.discountRate = 0; // 0 = none, 0.05 = student, 0.20 = senior/pwd
    this.discountLabel = 'None';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.activeView = 'dashboard'; // Default to executive store performance dashboard
    this.deviceMode = 'auto'; // 'auto', 'desktop', 'tablet', 'mobile'
    this.isMobileCartOpen = false;

    // Security State (SRS RTM-FR-005)
    this.isManagerAuthenticated = false;
    this.failedPinAttempts = 0;

    // Reactive Observer Listeners
    this.listeners = [];
  }

  // --------------------------------------------------------------------------
  // Reactive Event Subscription Bus
  // --------------------------------------------------------------------------
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Store listener execution error on event:', event, err);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Persistence Handlers (with Silent Failure Hunting & Safe Fallbacks)
  // --------------------------------------------------------------------------
  loadProducts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse products from localStorage, falling back to seed catalog:', e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_PRODUCTS || []));
  }

  saveProducts() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error('Failed to persist products to localStorage:', e);
    }
  }

  loadOrders() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse orders from localStorage:', e);
    }
    return [];
  }

  saveOrders() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error('Failed to persist orders to localStorage:', e);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse settings, using defaults:', e);
    }
    return {
      storeName: 'Tonari',
      branch: 'Tibanga, Iligan City',
      managerPin: '1234',
      openingFloat: 1000.00,
      autoPrintReceipt: true,
      soundNotifications: false
    };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to persist settings to localStorage:', e);
    }
  }

  loadWasteLogs() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WASTE_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not parse waste logs from localStorage:', e);
    }
    return [];
  }

  saveWasteLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.WASTE_LOGS, JSON.stringify(this.wasteLogs));
    } catch (e) {
      console.error('Failed to persist waste logs to localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Staff Accounts & Session Persistence (SRS RTM-FR-011)
  // --------------------------------------------------------------------------
  loadUsers() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse users from localStorage, falling back to seed staff accounts:', e);
    }
    const seed = (typeof window !== 'undefined' && window.DEFAULT_USERS) ? window.DEFAULT_USERS : [
      { id: 'USR-001', username: 'admin', name: 'Master Manager', role: 'Admin', pin: '1234' },
      { id: 'USR-002', username: 'cashier1', name: 'Staff Lane 1', role: 'Cashier', pin: '2222' },
      { id: 'USR-003', username: 'kitchen1', name: 'Kitchen Chef', role: 'Kitchen', pin: '3333' }
    ];
    if (typeof window !== 'undefined' && !window.DEFAULT_USERS) {
      window.DEFAULT_USERS = seed;
    }
    return JSON.parse(JSON.stringify(seed));
  }

  saveUsers() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to persist users to localStorage:', e);
    }
  }

  getUsers() {
    return this.users;
  }

  loadCurrentUser() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.id) {
          const matched = this.users.find(u => u.id === parsed.id);
          return matched || parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse current user from localStorage, falling back to default cashier:', e);
    }
    const defaultCashier = this.users.find(u => u.id === 'USR-002') || this.users[0];
    return defaultCashier || {
      id: 'USR-002',
      username: 'cashier1',
      name: 'Staff Lane 1',
      role: 'Cashier',
      pin: '2222'
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    if (!user || !user.id) {
      console.warn('Store.setCurrentUser: Invalid user object provided', user);
      return false;
    }
    this.currentUser = user;
    try {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error('Failed to persist current user to localStorage:', e);
    }
    this.notify('user-changed', this.currentUser);
    return true;
  }

  switchUser(userId, pin = null) {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const targetUser = this.users.find(u => u.id === userId || u.username === userId);
    if (!targetUser) {
      return { success: false, error: `User with ID "${userId}" not found` };
    }

    if (pin !== null && pin !== undefined && String(pin).trim() !== '') {
      const cleanPin = String(pin).trim();
      const legacyPin = this.settings && this.settings.managerPin ? String(this.settings.managerPin).trim() : '1234';
      const isPinValid = cleanPin === String(targetUser.pin).trim() || (targetUser.role === 'Admin' && cleanPin === legacyPin);
      if (!isPinValid) {
        return { success: false, error: 'Incorrect PIN for user' };
      }
    }

    this.setCurrentUser(targetUser);
    return { success: true, user: this.currentUser };
  }

  addUser(userData) {
    if (!userData || !userData.username || !userData.name || !userData.role || !userData.pin) {
      return { success: false, error: 'All fields (username, name, role, pin) are required' };
    }
    const newId = 'USR-' + String(this.users.length + 1).padStart(3, '0');
    const newUser = {
      id: newId,
      username: userData.username.trim().toLowerCase(),
      name: userData.name.trim(),
      role: userData.role.trim(),
      pin: String(userData.pin).trim()
    };
    this.users.push(newUser);
    this.saveUsers();
    this.notify('users-updated', this.users);
    return { success: true, user: newUser };
  }

  updateUser(userId, updates) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    Object.assign(user, updates);
    this.saveUsers();
    if (this.currentUser && this.currentUser.id === userId) {
      this.setCurrentUser(user);
    }
    this.notify('users-updated', this.users);
    return { success: true, user: user };
  }

  deleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    const adminCount = this.users.filter(u => u.role && u.role.toLowerCase() === 'admin').length;
    if (user.role && user.role.toLowerCase() === 'admin' && adminCount <= 1) {
      return { success: false, error: 'Cannot delete the sole administrator account' };
    }
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();
    if (this.currentUser && this.currentUser.id === userId) {
      const fallback = this.users.find(u => u.id === 'USR-002') || this.users[0];
      this.setCurrentUser(fallback);
    }
    this.notify('users-updated', this.users);
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // Recipe BOM & Raw Ingredient Persistence Handlers
  // --------------------------------------------------------------------------
  loadIngredients() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.INGREDIENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse ingredients from localStorage, falling back to seed catalog:', e);
    }
    const seed = (typeof window !== 'undefined' && window.DEFAULT_INGREDIENTS) ? window.DEFAULT_INGREDIENTS : [];
    return JSON.parse(JSON.stringify(seed));
  }

  saveIngredients() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.INGREDIENTS, JSON.stringify(this.ingredients));
    } catch (e) {
      console.error('Failed to persist ingredients to localStorage:', e);
    }
  }

  loadRecipes() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.RECIPES);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse recipes from localStorage, falling back to seed recipes:', e);
    }
    const seed = (typeof window !== 'undefined' && window.DEFAULT_RECIPES) ? window.DEFAULT_RECIPES : {};
    return JSON.parse(JSON.stringify(seed));
  }

  saveRecipes() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.RECIPES, JSON.stringify(this.recipes));
    } catch (e) {
      console.error('Failed to persist recipes to localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Limiting Bottleneck Engine (SRS RTM-FR-010)
  // --------------------------------------------------------------------------
  computeAvailablePortions(productId) {
    if (!productId) return 0;
    const recipe = this.recipes ? this.recipes[productId] : null;

    // Fallback for unmapped or legacy menu items
    if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
      const prod = this.products.find(p => p.id === productId);
      return prod ? Math.max(0, parseInt(prod.stock, 10) || 0) : 0;
    }

    let minPortions = Infinity;

    for (const req of recipe) {
      const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
      if (isNaN(reqQty) || reqQty <= 0) {
        continue;
      }

      const ing = this.ingredients.find(i => i.id === req.ingredientId);
      if (!ing) {
        return 0;
      }

      const currentStock = Math.max(0, Number(ing.stock) || 0);
      if (currentStock <= 0) {
        return 0;
      }

      const portionsFromIngredient = Math.floor(currentStock / reqQty);
      if (portionsFromIngredient < minPortions) {
        minPortions = portionsFromIngredient;
      }
    }

    return minPortions === Infinity ? 0 : Math.max(0, minPortions);
  }

  getBottleneckInfo(productId) {
    if (!productId) return null;
    const recipe = this.recipes ? this.recipes[productId] : null;
    if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
      return null;
    }

    let minPortions = Infinity;
    let limitingIngredient = null;
    let reqPerPortion = 0;

    for (const req of recipe) {
      const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
      if (isNaN(reqQty) || reqQty <= 0) continue;

      const ing = this.ingredients.find(i => i.id === req.ingredientId);
      if (!ing) {
        return {
          id: req.ingredientId,
          name: 'Missing Supply',
          stock: 0,
          unit: 'units',
          portions: 0
        };
      }

      const currentStock = Math.max(0, Number(ing.stock) || 0);
      const portions = Math.floor(currentStock / reqQty);

      if (portions < minPortions) {
        minPortions = portions;
        limitingIngredient = ing;
        reqPerPortion = reqQty;
      }
    }

    if (!limitingIngredient) return null;

    return {
      id: limitingIngredient.id,
      name: limitingIngredient.name,
      stock: limitingIngredient.stock,
      unit: limitingIngredient.unit || 'units',
      portions: minPortions === Infinity ? 0 : minPortions,
      reqQty: reqPerPortion
    };
  }

  refreshProductPortions() {
    if (!Array.isArray(this.products)) return;
    this.products.forEach(p => {
      p.stock = this.computeAvailablePortions(p.id);
    });
    this.saveProducts();
  }

  replenishIngredient(ingredientId, amount) {
    return this.adjustIngredientStock(ingredientId, amount);
  }

  // Bi-directional supply adjustment supporting positive restock and negative shrinkage/correction
  adjustIngredientStock(ingredientId, delta) {
    if (!ingredientId) return false;
    const ing = this.ingredients.find(i => i.id === ingredientId);
    if (!ing) return false;

    const change = Number(delta);
    if (isNaN(change) || change === 0) return false;

    ing.stock = Math.max(0, (Number(ing.stock) || 0) + change);
    this.saveIngredients();
    this.refreshProductPortions();

    this.notify('ingredients-updated', this.ingredients);
    this.notify('products-updated', this.products);
    return true;
  }

  // Add new raw kitchen ingredient or packaging supply
  addIngredient(data) {
    if (!data || !data.name || !data.unit) return { success: false, error: 'Name and Unit are required' };

    const id = data.id && data.id.trim() 
      ? data.id.trim().toUpperCase() 
      : 'ING-' + data.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15);

    if (this.ingredients.some(i => i.id === id)) {
      return { success: false, error: `Ingredient ID "${id}" already exists.` };
    }

    const newIng = {
      id: id,
      name: data.name.trim(),
      category: data.category || 'Proteins',
      stock: Math.max(0, Number(data.stock) || 0),
      unit: data.unit.trim().toLowerCase(),
      minStock: Math.max(1, Number(data.minStock) || 10),
      costPerUnit: Math.max(0, Number(data.costPerUnit) || 0)
    };

    this.ingredients.push(newIng);
    this.saveIngredients();
    this.notify('ingredients-updated', this.ingredients);
    return { success: true, ingredient: newIng };
  }

  // Add new finished menu item with optional Recipe BOM decomposition
  addProduct(data, recipeItems = []) {
    if (!data || !data.name) return { success: false, error: 'Product name is required' };

    const catCode = (data.category || 'OTH').slice(0, 3).toUpperCase();
    const id = data.id && data.id.trim()
      ? data.id.trim().toUpperCase()
      : `TN-${catCode}-${Date.now().toString().slice(-4)}`;

    if (this.products.some(p => p.id === id)) {
      return { success: false, error: `Product ID "${id}" already exists.` };
    }

    const newProd = {
      id: id,
      name: data.name.trim(),
      category: data.category || 'curry',
      categoryName: data.categoryName || data.category || 'Menu Item',
      price: Math.max(0, parseFloat(data.price) || 0),
      description: data.description ? data.description.trim() : '',
      minStock: Math.max(1, parseInt(data.minStock, 10) || 5),
      stock: 0,
      modifiers: Array.isArray(data.modifiers) ? data.modifiers : (data.modifiers ? data.modifiers.split(',').map(m => m.trim()).filter(Boolean) : [])
    };

    // Associate Recipe BOM if ingredients were selected
    if (Array.isArray(recipeItems) && recipeItems.length > 0) {
      this.recipes[id] = recipeItems.map(r => ({
        ingredientId: r.ingredientId,
        quantity: Math.max(0.01, Number(r.quantity) || 1)
      }));
      this.saveRecipes();
    }

    this.products.push(newProd);
    newProd.stock = this.computeAvailablePortions(newProd.id);
    this.saveProducts();

    this.notify('products-updated', this.products);
    this.notify('recipes-updated', this.recipes);
    return { success: true, product: newProd };
  }

  setIngredientStock(ingredientId, newStock) {
    if (!ingredientId) return false;
    const ing = this.ingredients.find(i => i.id === ingredientId);
    if (!ing) return false;

    const cleanStock = Math.max(0, Number(newStock) || 0);
    ing.stock = cleanStock;
    this.saveIngredients();
    this.refreshProductPortions();

    this.notify('ingredients-updated', this.ingredients);
    this.notify('products-updated', this.products);
    return true;
  }

  getIngredients() {
    return this.ingredients;
  }

  getRecipes() {
    return this.recipes;
  }

  getRecipeForProduct(productId) {
    return this.recipes ? this.recipes[productId] || null : null;
  }

  // --------------------------------------------------------------------------
  // Cart Operations with Flavor & Modifier Support (SRS RTM-FR-001)
  // --------------------------------------------------------------------------
  addToCart(product, selectedFlavor = null) {
    const flavor = selectedFlavor || (product.modifiers && product.modifiers.length > 0 ? product.modifiers[0] : null);
    const cartKey = flavor ? `${product.id}__${flavor}` : product.id;

    // Check aggregated available portions against existing items in cart
    const stockAvailable = this.computeAvailablePortions(product.id);
    const currentCartQty = this.cart
      .filter(item => item.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (currentCartQty + 1 > stockAvailable) {
      if (stockAvailable <= 0) {
        this.notify('cart-error', `"${product.name}" is currently sold out.`);
      } else {
        this.notify('cart-error', `Cannot add more. Only ${stockAvailable} portion(s) available.`);
      }
      return false;
    }

    const existing = this.cart.find(item => item.cartKey === cartKey || (!item.cartKey && item.id === product.id && item.flavor === flavor));

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        cartKey: cartKey,
        id: product.id,
        name: product.name,
        flavor: flavor,
        category: product.category,
        price: product.price,
        quantity: 1
      });
    }

    this.notify('cart-updated', this.cart);
    return true;
  }

  updateQuantity(itemKey, delta) {
    const item = this.cart.find(i => i.cartKey === itemKey || i.id === itemKey);
    if (!item) return;

    const maxStock = this.computeAvailablePortions(item.id);
    const currentOtherQty = this.cart
      .filter(i => i.id === item.id && (i.cartKey || i.id) !== (item.cartKey || item.id))
      .reduce((sum, i) => sum + i.quantity, 0);

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(item.cartKey || item.id);
      return;
    }

    if (newQty + currentOtherQty > maxStock) {
      this.notify('cart-error', `Max available stock for "${item.name}" is ${maxStock}.`);
      return;
    }

    item.quantity = newQty;
    this.notify('cart-updated', this.cart);
  }

  removeFromCart(itemKey) {
    this.cart = this.cart.filter(item => (item.cartKey || item.id) !== itemKey);
    this.notify('cart-updated', this.cart);
  }

  clearCart() {
    this.cart = [];
    this.notify('cart-updated', this.cart);
  }

  setOrderType(type) {
    this.orderType = type;
    this.notify('order-type-changed', type);
  }

  setDiscount(rate, label) {
    this.discountRate = rate;
    this.discountLabel = label;
    this.notify('cart-updated', this.cart);
  }

  // --------------------------------------------------------------------------
  // Financial Computation (Centavo Accuracy & Fixed Precision)
  // --------------------------------------------------------------------------
  getCartSummary() {
    const subtotal = this.cart.reduce((acc, item) => {
      return acc + (Math.round(item.price * 100) * item.quantity);
    }, 0) / 100;

    const discountAmount = Math.round(subtotal * this.discountRate * 100) / 100;
    const totalDue = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const totalItems = this.cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      discountLabel: this.discountLabel,
      totalDue: totalDue.toFixed(2),
      rawTotal: totalDue,
      totalItems: totalItems
    };
  }

  // --------------------------------------------------------------------------
  // Inventory Stock & Kitchen Waste Tracking (SRS RTM-FR-002, RTM-FR-009)
  // --------------------------------------------------------------------------
  deductStockFromCart() {
    if (!Array.isArray(this.cart) || this.cart.length === 0) {
      return;
    }

    this.cart.forEach(cartItem => {
      const productId = cartItem.id;
      const soldQty = Math.max(0, parseInt(cartItem.quantity, 10) || 0);
      if (soldQty === 0) return;

      const recipe = this.recipes ? this.recipes[productId] : null;

      if (recipe && Array.isArray(recipe) && recipe.length > 0) {
        // Deduct raw ingredients defined by recipe BOM
        recipe.forEach(req => {
          const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
          if (reqQty <= 0 || isNaN(reqQty)) return;

          const ing = this.ingredients.find(i => i.id === req.ingredientId);
          if (ing) {
            const totalDeduction = reqQty * soldQty;
            const currentStock = Math.max(0, Number(ing.stock) || 0);
            ing.stock = Math.max(0, currentStock - totalDeduction);
          }
        });
      } else {
        // Fallback deduction for unmapped or legacy items
        const prod = this.products.find(p => p.id === productId);
        if (prod) {
          prod.stock = Math.max(0, (parseInt(prod.stock, 10) || 0) - soldQty);
        }
      }
    });

    // Recompute available portions for all products based on updated raw ingredient counts
    this.refreshProductPortions();

    // Persist updated ingredients to storage
    this.saveIngredients();

    // Notify listeners that raw ingredients and finished products have changed
    this.notify('ingredients-updated', this.ingredients);
    this.notify('products-updated', this.products);
  }

  replenishStock(productId, amount) {
    const qty = Math.max(0, parseInt(amount, 10) || 0);
    if (qty <= 0) return;

    const recipe = this.recipes ? this.recipes[productId] : null;
    if (recipe && Array.isArray(recipe) && recipe.length > 0) {
      recipe.forEach(req => {
        const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
        const ing = this.ingredients.find(i => i.id === req.ingredientId);
        if (ing && reqQty > 0) {
          ing.stock = (Number(ing.stock) || 0) + (reqQty * qty);
        }
      });
      this.saveIngredients();
      this.refreshProductPortions();
      this.notify('ingredients-updated', this.ingredients);
      this.notify('products-updated', this.products);
    } else {
      const prod = this.products.find(p => p.id === productId);
      if (prod) {
        prod.stock = Math.max(0, (parseInt(prod.stock, 10) || 0) + qty);
        this.saveProducts();
        this.notify('products-updated', this.products);
      }
    }
  }

  updateProductDetails(productId, newPrice, newMinStock) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.price = Math.round(parseFloat(newPrice) * 100) / 100;
      prod.minStock = parseInt(newMinStock, 10) || 5;
      this.saveProducts();
      this.notify('products-updated', this.products);
    }
  }

  logKitchenWaste(itemId, arg2, arg3, arg4, arg5) {
    let itemType = 'product';
    let quantity = 1;
    let reason = 'Dropped / Spilled';
    let notes = '';

    if (typeof arg2 === 'string' && (arg2 === 'ingredient' || arg2 === 'product')) {
      itemType = arg2;
      quantity = arg3;
      reason = arg4;
      notes = arg5;
    } else {
      // Legacy signature: logKitchenWaste(productId, quantity, reason, notes)
      quantity = arg2;
      reason = arg3;
      notes = arg4;
      // Infer itemType if itemId matches an ingredient vs product
      if (this.ingredients && this.ingredients.some(i => i.id === itemId)) {
        itemType = 'ingredient';
      }
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return false;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
    const logId = 'WST-' + (1000 + this.wasteLogs.length + 1);

    if (itemType === 'ingredient') {
      const ing = this.ingredients.find(i => i.id === itemId);
      if (!ing) return false;

      ing.stock = Math.max(0, (Number(ing.stock) || 0) - qty);
      this.saveIngredients();
      this.refreshProductPortions();

      const unitCost = Number(ing.costPerUnit) || 0;
      const costLost = (qty * unitCost).toFixed(2);
      const wasteEntry = {
        id: logId,
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        itemId: ing.id,
        productId: ing.id,
        itemName: ing.name,
        productName: ing.name,
        itemType: 'Raw Supply',
        quantity: qty,
        unit: ing.unit || 'units',
        formattedQuantity: `${qty} ${ing.unit || 'units'}`,
        unitPrice: unitCost,
        costLost: costLost,
        reason: reason || 'Dropped / Spoilage',
        notes: notes || 'Raw supply waste logged'
      };

      this.wasteLogs.unshift(wasteEntry);
      this.saveWasteLogs();

      this.notify('ingredients-updated', this.ingredients);
      this.notify('products-updated', this.products);
      this.notify('waste-logs-updated', this.wasteLogs);
      return true;
    } else {
      // Menu Dish
      const prod = this.products.find(p => p.id === itemId);
      if (!prod) return false;

      const recipe = this.recipes ? this.recipes[itemId] : null;
      if (recipe && Array.isArray(recipe) && recipe.length > 0) {
        recipe.forEach(req => {
          const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
          const ing = this.ingredients.find(i => i.id === req.ingredientId);
          if (ing && reqQty > 0) {
            ing.stock = Math.max(0, (Number(ing.stock) || 0) - (reqQty * qty));
          }
        });
        this.saveIngredients();
        this.refreshProductPortions();
        this.notify('ingredients-updated', this.ingredients);
      } else {
        prod.stock = Math.max(0, (Number(prod.stock) || 0) - qty);
        this.saveProducts();
      }

      const costLost = (qty * prod.price).toFixed(2);
      const wasteEntry = {
        id: logId,
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        itemId: prod.id,
        productId: prod.id,
        itemName: prod.name,
        productName: prod.name,
        itemType: 'Menu Dish',
        quantity: qty,
        unit: 'portions',
        formattedQuantity: `${qty} portions`,
        unitPrice: prod.price,
        costLost: costLost,
        reason: reason || 'Dropped / Spilled',
        notes: notes || 'Menu dish waste logged'
      };

      this.wasteLogs.unshift(wasteEntry);
      this.saveWasteLogs();

      this.notify('products-updated', this.products);
      this.notify('waste-logs-updated', this.wasteLogs);
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // Cash Drawer Float & Variance Reconciliation (SRS RTM-FR-007)
  // --------------------------------------------------------------------------
  getCashDrawerSummary(countedCashInput = null) {
    const activeOrders = this.orders.filter(o => o.status !== 'Voided');
    const cashSales = activeOrders
      .filter(o => o.paymentMethod === 'Cash')
      .reduce((sum, o) => sum + parseFloat(o.totalDue), 0);
    const gcashSales = activeOrders
      .filter(o => o.paymentMethod === 'GCash')
      .reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

    const openingFloat = parseFloat(this.settings.openingFloat || 1000.00);
    const expectedCashInDrawer = openingFloat + cashSales;

    let countedCash = null;
    let variance = null;
    let varianceStatus = 'Uncounted'; // 'Balanced', 'Over', 'Short'

    if (countedCashInput !== null && countedCashInput !== '') {
      countedCash = parseFloat(countedCashInput) || 0;
      variance = countedCash - expectedCashInDrawer;
      if (Math.abs(variance) < 0.01) {
        varianceStatus = 'Balanced';
      } else if (variance > 0) {
        varianceStatus = 'Over';
      } else {
        varianceStatus = 'Short';
      }
    }

    return {
      openingFloat: openingFloat.toFixed(2),
      cashSales: cashSales.toFixed(2),
      gcashSales: gcashSales.toFixed(2),
      expectedCash: expectedCashInDrawer.toFixed(2),
      countedCash: countedCash !== null ? countedCash.toFixed(2) : null,
      variance: variance !== null ? variance.toFixed(2) : null,
      varianceStatus: varianceStatus
    };
  }

  // --------------------------------------------------------------------------
  // Weekly 7-Day Performance Trend Aggregation (Dashboard Feature)
  // --------------------------------------------------------------------------
  getWeeklySalesTrend() {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const formattedDate = d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const shortDay = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateSub = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Match orders for that day
      const dayOrders = this.orders.filter(o => o.status !== 'Voided' && o.date === formattedDate);
      const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalDue), 0);

      days.push({
        dateStr: formattedDate,
        dayLabel: shortDay,
        dateSub: dateSub,
        revenue: revenue,
        count: dayOrders.length
      });
    }

    return days;
  }

  // --------------------------------------------------------------------------
  // Staff Authentication & PIN Verification (SRS RTM-FR-005, RTM-FR-011, RTM-NFR-003)
  // --------------------------------------------------------------------------
  verifyUserPin(inputPin, requiredRole = null) {
    const cleanPin = String(inputPin || '').trim();
    if (!cleanPin) {
      return { success: false, error: 'PIN cannot be empty' };
    }

    // 1. Backward compatibility check against settings.managerPin
    const legacyPin = this.settings && this.settings.managerPin ? String(this.settings.managerPin).trim() : '1234';
    if (cleanPin === legacyPin && (!requiredRole || requiredRole.toLowerCase() === 'admin')) {
      const adminUser = this.users.find(u => u.role && u.role.toLowerCase() === 'admin') || {
        id: 'USR-001',
        username: 'admin',
        name: 'Master Manager',
        role: 'Admin',
        pin: legacyPin
      };
      return { success: true, user: adminUser };
    }

    // 2. Lookup against registered users collection
    const matchedUser = this.users.find(u => String(u.pin).trim() === cleanPin);
    if (!matchedUser) {
      return { success: false, error: 'Invalid PIN' };
    }

    // 3. Role authorization check (Admin role grants universal authorization)
    if (requiredRole) {
      const req = requiredRole.toLowerCase();
      const userRole = (matchedUser.role || '').toLowerCase();
      const isAuthorized = userRole === req || userRole === 'admin';
      if (!isAuthorized) {
        return {
          success: false,
          user: matchedUser,
          error: `Insufficient permissions: ${requiredRole} authorization required`
        };
      }
    }

    return { success: true, user: matchedUser };
  }

  verifyManagerPin(inputPin) {
    const result = this.verifyUserPin(inputPin, 'Admin');
    if (result && result.success) {
      this.isManagerAuthenticated = true;
      this.failedPinAttempts = 0;
      return true;
    }
    this.failedPinAttempts += 1;
    return false;
  }

  lockTerminal() {
    this.isManagerAuthenticated = false;
    this.notify('terminal-locked', true);
  }

  // --------------------------------------------------------------------------
  // Order Placement & Kitchen Operations
  // --------------------------------------------------------------------------
  placeOrder(paymentDetails) {
    const summary = this.getCartSummary();
    const orderNumber = 'TN-' + (1000 + this.orders.length + 1);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newOrder = {
      id: orderNumber,
      orderType: this.orderType,
      items: JSON.parse(JSON.stringify(this.cart)),
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      discountLabel: summary.discountLabel,
      totalDue: summary.totalDue,
      paymentMethod: paymentDetails.method,
      amountTendered: paymentDetails.tendered,
      changeDue: paymentDetails.change,
      gcashRef: paymentDetails.gcashRef || null,
      status: 'Pending', // 'Pending', 'Preparing', 'Ready', 'Completed', 'Voided'
      date: dateFormatted,
      time: timeFormatted,
      timestamp: now.toISOString(),
      cashier: this.currentUser ? this.currentUser.name : 'Staff Lane 1',
      voidReason: null
    };

    // Deduct physical inventory
    this.deductStockFromCart();

    // Store in order history
    this.orders.unshift(newOrder);
    this.saveOrders();

    // Clear cart and close drawer
    this.clearCart();
    this.isMobileCartOpen = false;

    this.notify('order-placed', newOrder);
    return newOrder;
  }

  createOrder(paymentDetails) {
    return this.placeOrder(paymentDetails);
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders();
      this.notify('orders-updated', this.orders);
    }
  }

  restoreStockForVoid(order) {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return;
    }

    order.items.forEach(item => {
      const productId = item.id;
      const voidQty = Math.max(0, parseInt(item.quantity, 10) || 0);
      if (voidQty === 0) return;

      const recipe = this.recipes ? this.recipes[productId] : null;

      if (recipe && Array.isArray(recipe) && recipe.length > 0) {
        // Restore raw ingredients defined by recipe BOM
        recipe.forEach(req => {
          const reqQty = req.quantity !== undefined ? Number(req.quantity) : (req.reqQty !== undefined ? Number(req.reqQty) : 0);
          if (reqQty <= 0 || isNaN(reqQty)) return;

          const ing = this.ingredients.find(i => i.id === req.ingredientId);
          if (ing) {
            const restoreAmount = reqQty * voidQty;
            const currentStock = Math.max(0, Number(ing.stock) || 0);
            ing.stock = currentStock + restoreAmount;
          }
        });
      } else {
        // Fallback restoration for unmapped or legacy items
        const prod = this.products.find(p => p.id === productId);
        if (prod) {
          prod.stock = Math.max(0, (parseInt(prod.stock, 10) || 0) + voidQty);
        }
      }
    });

    // Recompute available portions for all products based on restored raw ingredients
    this.refreshProductPortions();

    // Persist updated ingredients to storage
    this.saveIngredients();

    // Notify listeners that raw ingredients and finished products have changed
    this.notify('ingredients-updated', this.ingredients);
    this.notify('products-updated', this.products);
  }

  voidOrder(orderId, reason) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || order.status === 'Voided') return false;

    order.status = 'Voided';
    order.voidReason = reason || 'Customer request / cashier void';

    // Restore stock back to inventory via Recipe BOM
    this.restoreStockForVoid(order);

    this.saveOrders();
    this.notify('orders-updated', this.orders);
    return true;
  }

  // --------------------------------------------------------------------------
  // Navigation & Viewport Setters
  // --------------------------------------------------------------------------
  setView(viewName) {
    this.activeView = viewName;
    this.notify('view-changed', viewName);
  }

  setDeviceMode(mode) {
    this.deviceMode = mode;
    this.notify('device-mode-changed', mode);
  }

  setCategory(catId) {
    this.activeCategory = catId;
    this.notify('category-changed', catId);
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notify('search-changed', query);
  }

  toggleMobileCart(isOpen) {
    this.isMobileCartOpen = typeof isOpen === 'boolean' ? isOpen : !this.isMobileCartOpen;
    this.notify('mobile-cart-toggled', this.isMobileCartOpen);
  }
}

// Instantiate global store
window.appStore = new Store();
