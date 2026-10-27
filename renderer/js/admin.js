// ============================================================================
// TONARI POS - ADMIN & ACCESS CONTROL DASHBOARD CONTROLLER (VIEW 6)
// Observes: Modern Minimalist Standards, Granular RBAC, Zero-Emoji, Toast Alerts
// ============================================================================

const AdminController = {
  currentTab: 'accounts', // 'accounts' | 'privileges' | 'categories'

  init() {
    this.container = document.getElementById('view-admin');
    this.userTableBody = document.getElementById('admin-users-table-body');
    this.privilegeMatrixBody = document.getElementById('admin-privilege-matrix-body');
    this.categoryTableBody = document.getElementById('admin-categories-table-body');

    // Modals
    this.userModal = document.getElementById('admin-user-modal');
    this.categoryModal = document.getElementById('admin-category-modal');

    // Stat Displays
    this.statTotalUsers = document.getElementById('admin-stat-total-users');
    this.statCurrentRole = document.getElementById('admin-stat-current-role');

    this.bindEvents();
    this.render();

    // Subscribe to state changes
    if (window.appStore) {
      window.appStore.subscribe((event) => {
        if (event === 'users-updated' || event === 'categories-updated' || event === 'user-changed') {
          this.render();
        }
      });
    }
  },

  bindEvents() {
    // Admin Sub-Nav Tabs
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchTab(btn.dataset.tab);
      });
    });

    // Create Account Triggers
    const btnCreateUser = document.getElementById('btn-admin-create-user');
    if (btnCreateUser) {
      btnCreateUser.addEventListener('click', () => this.openUserModal());
    }

    const btnCloseUserModal = document.getElementById('btn-close-admin-user-modal');
    if (btnCloseUserModal) {
      btnCloseUserModal.addEventListener('click', () => this.closeUserModal());
    }

    const btnCancelUserModal = document.getElementById('btn-cancel-admin-user');
    if (btnCancelUserModal) {
      btnCancelUserModal.addEventListener('click', () => this.closeUserModal());
    }

    const btnSaveUser = document.getElementById('btn-save-admin-user');
    if (btnSaveUser) {
      btnSaveUser.addEventListener('click', () => this.saveUserModal());
    }

    // Add Category Triggers
    const btnOpenAddCat = document.getElementById('btn-admin-add-category');
    if (btnOpenAddCat) {
      btnOpenAddCat.addEventListener('click', () => this.openCategoryModal());
    }

    const btnOpenAddCatInv = document.getElementById('btn-open-add-category-modal');
    if (btnOpenAddCatInv) {
      btnOpenAddCatInv.addEventListener('click', () => this.openCategoryModal());
    }

    const btnCloseCatModal = document.getElementById('btn-close-admin-cat-modal');
    if (btnCloseCatModal) {
      btnCloseCatModal.addEventListener('click', () => this.closeCategoryModal());
    }

    const btnCancelCatModal = document.getElementById('btn-cancel-admin-cat');
    if (btnCancelCatModal) {
      btnCancelCatModal.addEventListener('click', () => this.closeCategoryModal());
    }

    const btnSaveCat = document.getElementById('btn-save-admin-cat');
    if (btnSaveCat) {
      btnSaveCat.addEventListener('click', () => this.saveCategoryModal());
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabAccounts = document.getElementById('admin-tab-accounts');
    const tabPrivileges = document.getElementById('admin-tab-privileges');
    const tabCategories = document.getElementById('admin-tab-categories');

    if (tabAccounts) tabAccounts.style.display = tabName === 'accounts' ? 'block' : 'none';
    if (tabPrivileges) tabPrivileges.style.display = tabName === 'privileges' ? 'block' : 'none';
    if (tabCategories) tabCategories.style.display = tabName === 'categories' ? 'block' : 'none';

    this.render();
  },

  render() {
    this.renderStats();
    if (this.currentTab === 'accounts') this.renderUsers();
    if (this.currentTab === 'privileges') this.renderPrivileges();
    if (this.currentTab === 'categories') this.renderCategories();
  },

  renderStats() {
    const users = (window.appStore && window.appStore.getUsers) ? window.appStore.getUsers() : [];
    if (this.statTotalUsers) this.statTotalUsers.textContent = users.length;
    if (this.statCurrentRole && window.appStore && window.appStore.currentUser) {
      this.statCurrentRole.textContent = window.appStore.currentUser.role || 'Cashier';
    }
  },

  renderUsers() {
    if (!this.userTableBody) return;
    const users = (window.appStore && window.appStore.getUsers) ? window.appStore.getUsers() : [];
    let html = '';

    users.forEach(u => {
      const isMaster = u.id === 'USR-001';
      const roleLower = (u.role || 'cashier').toLowerCase();
      html += `
        <tr>
          <td class="font-mono text-sub font-bold">${u.id}</td>
          <td><strong>${u.name}</strong></td>
          <td class="font-mono text-sub">@${u.username}</td>
          <td><span class="badge-role-${roleLower}">${u.role}</span></td>
          <td class="font-mono tabular-nums text-sub">4-Digit PIN Configured</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-secondary btn-small btn-edit-user" data-id="${u.id}">Edit</button>
              ${isMaster ? '' : `<button type="button" class="btn-secondary btn-small btn-delete-user text-danger" data-id="${u.id}">Delete</button>`}
            </div>
          </td>
        </tr>
      `;
    });

    this.userTableBody.innerHTML = html;

    this.userTableBody.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => this.openUserModal(btn.dataset.id));
    });
    this.userTableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => this.deleteUser(btn.dataset.id));
    });
  },

  renderPrivileges() {
    if (!this.privilegeMatrixBody) return;

    const MATRIX_ROWS = [
      { feature: 'POS Register Order Entry', admin: 'Full Access', cashier: 'Full Access', kitchen: 'Restricted' },
      { feature: 'Cart Stepper & Line Item Deletion', admin: 'Full Access', cashier: 'Full Access', kitchen: 'Restricted' },
      { feature: 'Order Tender & Cash/GCash Checkout', admin: 'Full Access', cashier: 'Full Access', kitchen: 'Restricted' },
      { feature: 'Order Void & Inventory Restoral', admin: 'Full Access', cashier: 'Manager PIN Gated', kitchen: 'Restricted' },
      { feature: 'Kitchen Display System (KDS Queue)', admin: 'Full Access', cashier: 'Restricted', kitchen: 'Full Access' },
      { feature: 'Kitchen Spoilage & Waste Logging', admin: 'Full Access', cashier: 'Restricted', kitchen: 'Full Access' },
      { feature: 'Daily Sales Ledger & Z-Reading', admin: 'Full Access', cashier: 'Manager PIN Gated', kitchen: 'Restricted' },
      { feature: 'Physical Restock & Recipe Authoring', admin: 'Full Access', cashier: 'Manager PIN Gated', kitchen: 'Restricted' },
      { feature: 'Staff Account & Role Administration', admin: 'Full Access', cashier: 'Restricted', kitchen: 'Restricted' }
    ];

    let html = '';
    MATRIX_ROWS.forEach(row => {
      html += `
        <tr>
          <td><strong>${row.feature}</strong></td>
          <td><span class="priv-allowed">&check; ${row.admin}</span></td>
          <td>${row.cashier === 'Full Access' 
            ? '<span class="priv-allowed">&check; Full Access</span>' 
            : (row.cashier === 'Manager PIN Gated' 
                ? '<span class="priv-pin">&#9881; Manager PIN Gated</span>' 
                : '<span class="priv-denied">&cross; Restricted</span>')}</td>
          <td>${row.kitchen === 'Full Access' 
            ? '<span class="priv-allowed">&check; Full Access</span>' 
            : '<span class="priv-denied">&cross; Restricted</span>'}</td>
        </tr>
      `;
    });

    this.privilegeMatrixBody.innerHTML = html;
  },

  renderCategories() {
    if (!this.categoryTableBody) return;
    const categories = (window.appStore && window.appStore.categories) ? window.appStore.categories : [];
    let html = '';

    categories.forEach(c => {
      const isRaw = c.type === 'raw';
      html += `
        <tr>
          <td class="font-mono text-sub font-bold">${c.id}</td>
          <td><strong>${c.name}</strong></td>
          <td>
            <span class="product-stock-badge ${isRaw ? 'badge-low' : 'badge-in-stock'}">
              ${isRaw ? 'Raw Supply' : 'Menu Dish'}
            </span>
          </td>
          <td class="text-sub font-small">${c.description || 'Standard POS Category'}</td>
          <td>
            <button type="button" class="btn-secondary btn-small btn-del-category text-danger" data-id="${c.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    this.categoryTableBody.innerHTML = html;

    this.categoryTableBody.querySelectorAll('.btn-del-category').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCategory(btn.dataset.id));
    });
  },

  openUserModal(userId = null) {
    if (!this.userModal) return;
    const titleEl = document.getElementById('admin-user-modal-title');
    const idInput = document.getElementById('admin-user-id');
    const nameInput = document.getElementById('admin-user-name');
    const userInput = document.getElementById('admin-user-username');
    const roleSelect = document.getElementById('admin-user-role');
    const pinInput = document.getElementById('admin-user-pin');

    if (userId) {
      const users = window.appStore.getUsers() || [];
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (titleEl) titleEl.textContent = 'Edit Staff Account';
      if (idInput) idInput.value = user.id;
      if (nameInput) nameInput.value = user.name;
      if (userInput) userInput.value = user.username;
      if (roleSelect) roleSelect.value = user.role;
      if (pinInput) pinInput.value = user.pin;
    } else {
      if (titleEl) titleEl.textContent = 'Create Staff Account';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (userInput) userInput.value = '';
      if (roleSelect) roleSelect.value = 'Cashier';
      if (pinInput) pinInput.value = '';
    }

    this.userModal.classList.add('modal-visible');
  },

  closeUserModal() {
    if (this.userModal) this.userModal.classList.remove('modal-visible');
  },

  saveUserModal() {
    const idInput = document.getElementById('admin-user-id');
    const nameInput = document.getElementById('admin-user-name');
    const userInput = document.getElementById('admin-user-username');
    const roleSelect = document.getElementById('admin-user-role');
    const pinInput = document.getElementById('admin-user-pin');

    const name = nameInput ? nameInput.value.trim() : '';
    const username = userInput ? userInput.value.trim() : '';
    const role = roleSelect ? roleSelect.value : 'Cashier';
    const pin = pinInput ? pinInput.value.trim() : '';
    const userId = idInput ? idInput.value : '';

    if (!name || !username || !pin) {
      window.appStore.showToast('Please provide Name, Username, and 4-Digit PIN.', 'warning');
      return;
    }

    if (userId) {
      const res = window.appStore.updateUser(userId, { name, username, role, pin });
      if (res && res.success) {
        window.appStore.showToast(`Updated account for ${name}.`, 'success');
        this.closeUserModal();
      } else {
        window.appStore.showToast(res && res.error ? res.error : 'Failed to update account.', 'error');
      }
    } else {
      const res = window.appStore.addUser({ name, username, role, pin });
      if (res && res.success) {
        window.appStore.showToast(`Staff account for ${name} created.`, 'success');
        this.closeUserModal();
      } else {
        window.appStore.showToast(res && res.error ? res.error : 'Failed to create account.', 'error');
      }
    }
  },

  deleteUser(userId) {
    if (userId === 'USR-001') {
      window.appStore.showToast('The master administrator account cannot be deleted.', 'error');
      return;
    }

    const res = window.appStore.deleteUser(userId);
    if (res && res.success) {
      window.appStore.showToast('Staff account deleted.', 'info');
    } else {
      window.appStore.showToast(res && res.error ? res.error : 'Cannot delete user.', 'error');
    }
  },

  openCategoryModal() {
    if (!this.categoryModal) return;
    const nameInput = document.getElementById('admin-cat-name');
    const descInput = document.getElementById('admin-cat-desc');
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    this.categoryModal.classList.add('modal-visible');
  },

  closeCategoryModal() {
    if (this.categoryModal) this.categoryModal.classList.remove('modal-visible');
  },

  saveCategoryModal() {
    const nameInput = document.getElementById('admin-cat-name');
    const typeSelect = document.getElementById('admin-cat-type');
    const descInput = document.getElementById('admin-cat-desc');

    const name = nameInput ? nameInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : 'menu';
    const description = descInput ? descInput.value.trim() : '';

    if (!name) {
      window.appStore.showToast('Category name is required.', 'warning');
      return;
    }

    const res = window.appStore.addCategory({ name, type, description });
    if (res && res.success) {
      window.appStore.showToast(`Category "${name}" created successfully.`, 'success');
      this.closeCategoryModal();
    } else {
      window.appStore.showToast(res && res.error ? res.error : 'Failed to create category.', 'error');
    }
  },

  deleteCategory(categoryId) {
    const res = window.appStore.deleteCategory(categoryId);
    if (res && res.success) {
      window.appStore.showToast('Category deleted.', 'info');
    } else {
      window.appStore.showToast(res && res.error ? res.error : 'Cannot delete category.', 'error');
    }
  }
};

window.AdminController = AdminController;
