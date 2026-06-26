// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
    ADMIN_PASSWORD: 'WAnzSHOP0812'
};

// ============================================
// STATE
// ============================================
let state = {
    orders: [],
    currentOrderId: null,
    filterStatus: 'all'
};

// ============================================
// DOM REFERENCES
// ============================================
const DOM = {
    statPending: document.getElementById('statPending'),
    statProcessed: document.getElementById('statProcessed'),
    statCompleted: document.getElementById('statCompleted'),
    statRejected: document.getElementById('statRejected'),
    statTotal: document.getElementById('statTotal'),
    recentOrdersBody: document.getElementById('recentOrdersBody'),
    allOrdersBody: document.getElementById('allOrdersBody'),
    historyBody: document.getElementById('historyBody'),
    filterStatus: document.getElementById('filterStatus'),
    pendingCount: document.getElementById('pendingCount'),
    tabLinks: document.querySelectorAll('.sidebar-nav a'),
    tabContents: document.querySelectorAll('.tab-content'),
    pageTitle: document.getElementById('pageTitle'),
    proofModal: document.getElementById('proofModal'),
    proofModalClose: document.getElementById('proofModalClose'),
    proofImageDisplay: document.getElementById('proofImageDisplay'),
    proofSender: document.getElementById('proofSender'),
    proofService: document.getElementById('proofService'),
    proofTotal: document.getElementById('proofTotal'),
    proofRejectReason: document.getElementById('proofRejectReason'),
    proofApprove: document.getElementById('proofApprove'),
    proofReject: document.getElementById('proofReject'),
    proofComplete: document.getElementById('proofComplete'),
    settingsForm: document.getElementById('settingsForm'),
    adminPassword: document.getElementById('adminPassword'),
    danaNumber: document.getElementById('danaNumber'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    adminSidebar: document.getElementById('adminSidebar'),
    adminLogout: document.getElementById('adminLogout'),
    currentTime: document.getElementById('currentTime')
};

// ============================================
// 1. CHECK AUTH
// ============================================
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) window.location.href = 'login.html';
}

// ============================================
// 2. LOAD ORDERS
// ============================================
function loadOrders() {
    state.orders = JSON.parse(localStorage.getItem('orders')) || [];
    updateStats();
    renderRecentOrders();
    renderAllOrders();
    renderHistory();
    updatePendingBadge();
}

// ============================================
// 3. UPDATE STATS
// ============================================
function updateStats() {
    const pending = state.orders.filter(o => o.status === 'pending').length;
    const processed = state.orders.filter(o => o.status === 'processed').length;
    const completed = state.orders.filter(o => o.status === 'completed').length;
    const rejected = state.orders.filter(o => o.status === 'rejected').length;
    const totalRevenue = state.orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
    
    DOM.statPending.textContent = pending;
    DOM.statProcessed.textContent = processed;
    DOM.statCompleted.textContent = completed;
    DOM.statRejected.textContent = rejected;
    DOM.statTotal.textContent = `Rp ${formatNumber(totalRevenue)}`;
}

// ============================================
// 4. RENDER RECENT ORDERS
// ============================================
function renderRecentOrders() {
    const recent = state.orders.sort((a, b) => b.id - a.id).slice(0, 5);
    if (recent.length === 0) {
        DOM.recentOrdersBody.innerHTML = `<tr><td colspan="8" class="text-center">Belum ada pesanan</td></tr>`;
        return;
    }
    DOM.recentOrdersBody.innerHTML = recent.map(order => `
        <tr>
            <td>${order.orderId || '#' + order.id}</td>
            <td>${order.serviceName || 'Unknown'}</td>
            <td>${order.target || '-'}</td>
            <td>${order.quantity || 0}</td>
            <td>Rp ${formatNumber(order.price || 0)}</td>
            <td>${getStatusBadge(order.status)}</td>
            <td>
                ${order.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="openProofModal('${order.id}')"><i class="fas fa-eye"></i></button>` : '-'}
            </td>
        </tr>
    `).join('');
}

// ============================================
// 5. RENDER ALL ORDERS
// ============================================
function renderAllOrders() {
    let filtered = state.orders;
    if (DOM.filterStatus.value !== 'all') filtered = filtered.filter(o => o.status === DOM.filterStatus.value);
    filtered = filtered.sort((a, b) => b.id - a.id);
    
    if (filtered.length === 0) {
        DOM.allOrdersBody.innerHTML = `<tr><td colspan="9" class="text-center">Tidak ada pesanan</td></tr>`;
        return;
    }
    DOM.allOrdersBody.innerHTML = filtered.map(order => `
        <tr>
            <td>${order.orderId || '#' + order.id}</td>
            <td>${order.serviceName || 'Unknown'}</td>
            <td>${order.target || '-'}</td>
            <td>${order.quantity || 0}</td>
            <td>Rp ${formatNumber(order.price || 0)}</td>
            <td>${order.payment?.senderName || '-'}</td>
            <td>${getStatusBadge(order.status)}</td>
            <td>
                ${order.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="openProofModal('${order.id}')"><i class="fas fa-eye"></i></button>` : '-'}
            </td>
        </tr>
    `).join('');
}

// ============================================
// 6. RENDER HISTORY
// ============================================
function renderHistory() {
    const history = state.orders.filter(o => o.status === 'completed' || o.status === 'rejected').sort((a, b) => b.id - a.id);
    if (history.length === 0) {
        DOM.historyBody.innerHTML = `<tr><td colspan="8" class="text-center">Belum ada riwayat</td></tr>`;
        return;
    }
    DOM.historyBody.innerHTML = history.map(order => `
        <tr>
            <td>${order.orderId || '#' + order.id}</td>
            <td>${order.serviceName || 'Unknown'}</td>
            <td>${order.target || '-'}</td>
            <td>${order.quantity || 0}</td>
            <td>Rp ${formatNumber(order.price || 0)}</td>
            <td>${getStatusBadge(order.status)}</td>
            <td>${formatDate(order.createdAt)}</td>
        </tr>
    `).join('');
}

// ============================================
// 7. STATUS BADGE
// ============================================
function getStatusBadge(status) {
    const badges = {
        pending: '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>',
        processed: '<span class="status-badge status-processed"><i class="fas fa-spinner fa-spin"></i> Diproses</span>',
        completed: '<span class="status-badge status-completed"><i class="fas fa-check-circle"></i> Selesai</span>',
        rejected: '<span class="status-badge status-rejected"><i class="fas fa-times-circle"></i> Ditolak</span>'
    };
    return badges[status] || badges.pending;
}

// ============================================
// 8. UPDATE PENDING BADGE
// ============================================
function updatePendingBadge() {
    const pending = state.orders.filter(o => o.status === 'pending').length;
    DOM.pendingCount.textContent = pending;
    DOM.pendingCount.style.display = pending > 0 ? 'inline' : 'none';
}

// ============================================
// 9. OPEN PROOF MODAL
// ============================================
function openProofModal(orderId) {
    const order = state.orders.find(o => o.id == orderId);
    if (!order) return;
    state.currentOrderId = orderId;
    DOM.proofImageDisplay.src = order.payment?.proofImage || '';
    DOM.proofSender.textContent = order.payment?.senderName || '-';
    DOM.proofService.textContent = order.serviceName || '-';
    DOM.proofTotal.textContent = `Rp ${formatNumber(order.price || 0)}`;
    DOM.proofRejectReason.value = '';
    DOM.proofModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================
// 10. CLOSE PROOF MODAL
// ============================================
function closeProofModal() {
    DOM.proofModal.classList.remove('active');
    document.body.style.overflow = '';
    state.currentOrderId = null;
}
DOM.proofModalClose.addEventListener('click', closeProofModal);
DOM.proofModal.addEventListener('click', (e) => { if (e.target === DOM.proofModal) closeProofModal(); });

// ============================================
// 11. APPROVE ORDER (Set ke Processed)
// ============================================
DOM.proofApprove.addEventListener('click', () => {
    if (!state.currentOrderId) return;
    updateOrderStatus(state.currentOrderId, 'processed');
    closeProofModal();
    showToast('✅ Pesanan diproses!', 'success');
});

// ============================================
// 12. COMPLETE ORDER (Set ke Completed)
// ============================================
DOM.proofComplete.addEventListener('click', () => {
    if (!state.currentOrderId) return;
    updateOrderStatus(state.currentOrderId, 'completed');
    closeProofModal();
    showToast('✅ Pesanan selesai!', 'success');
});

// ============================================
// 13. REJECT ORDER
// ============================================
DOM.proofReject.addEventListener('click', () => {
    if (!state.currentOrderId) return;
    const reason = DOM.proofRejectReason.value.trim() || 'Tidak ada alasan';
    updateOrderStatus(state.currentOrderId, 'rejected', reason);
    closeProofModal();
    showToast('❌ Pesanan ditolak!', 'error');
});

// ============================================
// 14. UPDATE ORDER STATUS
// ============================================
function updateOrderStatus(orderId, status, reason = '') {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const index = orders.findIndex(o => o.id == orderId);
    if (index !== -1) {
        orders[index].status = status;
        if (reason) orders[index].reason = reason;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

// ============================================
// 15. FILTER ORDERS
// ============================================
DOM.filterStatus.addEventListener('change', renderAllOrders);

// ============================================
// 16. TAB NAVIGATION
// ============================================
DOM.tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.tabLinks.forEach(l => l.classList.remove('active'));
        DOM.tabContents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        const tabId = link.dataset.tab;
        document.getElementById(`tab-${tabId}`).classList.add('active');
        const titles = { dashboard: 'Dashboard', orders: 'Pesanan Masuk', history: 'Riwayat', settings: 'Pengaturan' };
        DOM.pageTitle.textContent = titles[tabId] || 'Dashboard';
        DOM.adminSidebar.classList.remove('active');
    });
});

// ============================================
// 17. SIDEBAR TOGGLE
// ============================================
DOM.sidebarToggle.addEventListener('click', () => DOM.adminSidebar.classList.toggle('active'));

// ============================================
// 18. LOGOUT
// ============================================
DOM.adminLogout.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});

// ============================================
// 19. SAVE SETTINGS
// ============================================
DOM.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {};
    if (DOM.adminPassword.value.trim()) settings.adminPassword = DOM.adminPassword.value.trim();
    if (DOM.danaNumber.value.trim()) settings.danaNumber = DOM.danaNumber.value.trim();
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showToast('Pengaturan disimpan!', 'success');
    DOM.adminPassword.value = '';
});

// ============================================
// 20. LOAD SETTINGS
// ============================================
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    if (settings.danaNumber) DOM.danaNumber.value = settings.danaNumber;
}

// ============================================
// 21. UPDATE CLOCK
// ============================================
function updateClock() {
    const now = new Date();
    DOM.currentTime.textContent = now.toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

// ============================================
// 22. UTILITY
// ============================================
function formatNumber(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `custom-toast show ${type === 'error' ? 'toast-error' : ''}`;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; z-index: 99999;
        background: white; border-radius: 12px; padding: 16px 24px;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        display: flex; align-items: center; gap: 16px;
        border-left: 4px solid ${type === 'error' ? '#EF4444' : '#22C55E'};
        transform: translateY(100px); opacity: 0; transition: all 0.3s ease;
        max-width: 400px;
    `;
    toast.innerHTML = `
        <div style="font-size:24px;color:${type === 'error' ? '#EF4444' : '#22C55E'}">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        </div>
        <div style="font-weight:500;color:#1E293B;">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// 23. INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrders();
    loadSettings();
    updateClock();
    setInterval(updateClock, 1000);
});
