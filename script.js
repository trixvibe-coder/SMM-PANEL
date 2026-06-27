// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
    DANA_NUMBER: '085216704274',
    ADMIN_PASSWORD: 'WAnzSHOP0812'
};

// ============================================
// STATE - DATA LAYANAN
// ============================================
let state = {
    services: [
        { id: 1, name: 'Followers Instagram (Indonesia)', price: 31, min: 100, max: 2000, category: 'instagram' },
        { id: 2, name: 'Followers Instagram (Global)', price: 10, min: 100, max: 50000, category: 'instagram' },
        { id: 3, name: 'Likes Foto Instagram', price: 5, min: 50, max: 50000, category: 'instagram' },
        { id: 4, name: 'Views Reels Instagram', price: 5, min: 50, max: 100000, category: 'instagram' },
        { id: 5, name: 'Komentar Instagram', price: 10, min: 50, max: 1000, category: 'instagram' },
        { id: 6, name: 'Save Post Instagram', price: 5, min: 100, max: 5000, category: 'instagram' },
        { id: 7, name: 'Story Views Instagram', price: 3, min: 100, max: 50000, category: 'instagram' },
        { id: 8, name: 'IGTV Views', price: 5, min: 50, max: 100000, category: 'instagram' },
        { id: 9, name: 'Followers TikTok (Indonesia)', price: 65, min: 100, max: 50000, category: 'tiktok' },
        { id: 10, name: 'Followers TikTok (Global)', price: 25, min: 100, max: 50000, category: 'tiktok' },
        { id: 11, name: 'Likes Video TikTok', price: 5, min: 100, max: 50000, category: 'tiktok' },
        { id: 12, name: 'Views TikTok', price: 3, min: 100, max: 100000, category: 'tiktok' },
        { id: 13, name: 'Share TikTok', price: 3, min: 100, max: 50000, category: 'tiktok' },
        { id: 14, name: 'Comment TikTok', price: 18, min: 100, max: 1000, category: 'tiktok' },
        { id: 15, name: 'Live Views TikTok', price: 300, min: 100, max: 50000, category: 'tiktok' },
        { id: 16, name: 'Pengikut Saluran WhatsApp', price: 50, min: 50, max: 500, category: 'whatsapp' },
        { id: 17, name: 'WhatsApp Verified Badge', price: 1500000, min: 1, max: 1, category: 'whatsapp' },
    ],
    selectedService: null,
    cart: { serviceId: null, target: '', quantity: 10, totalPrice: 0 }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getServiceIcon(category) {
    const icons = {
        'instagram': 'fa-instagram',
        'tiktok': 'fa-tiktok',
        'whatsapp': 'fa-whatsapp'
    };
    return icons[category] || 'fa-share-alt';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTrackingStatusIcon(status) {
    const icons = {
        'pending': 'fa-clock',
        'processed': 'fa-spinner fa-spin',
        'completed': 'fa-check-circle',
        'rejected': 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
}

// ============================================
// FUNGSI UNTUK INDEX.HTML (LAYANAN)
// ============================================
function loadServices() {
    const grid = document.getElementById('servicesGrid');
    const loading = document.getElementById('loadingServices');
    if (loading) loading.style.display = 'none';
    if (!grid) return;
    
    if (state.services.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;"><p>Tidak ada layanan</p></div>`;
        return;
    }
    
    grid.innerHTML = state.services.map(service => `
        <div class="service-card" data-service-id="${service.id}" onclick="selectService('${service.id}')">
            <div class="service-icon">
                <img src="assets/images/logo-${service.category}.png" alt="${service.category}" style="width:32px;height:32px;object-fit:contain;" />
            </div>
            <div class="service-name">${service.name}</div>
            <div class="service-category">${capitalize(service.category)}</div>
            <div class="service-price">Rp ${formatNumber(service.price)} <small>/unit</small></div>
            <div class="service-min">Min. Order: ${service.min}</div>
            ${service.max ? `<div class="service-max">Max. Order: ${service.max}</div>` : ''}
        </div>
    `).join('');
}

function selectService(serviceId) {
    const service = state.services.find(s => s.id == serviceId);
    if (!service) return;
    state.selectedService = service;
    
    const select = document.getElementById('serviceSelect');
    const price = document.getElementById('pricePerUnit');
    const min = document.getElementById('minOrder');
    const max = document.getElementById('maxOrder');
    const qtyMin = document.getElementById('qtyMinDisplay');
    const qtyInput = document.getElementById('quantityInput');
    
    if (select) select.value = serviceId;
    if (price) price.textContent = `Rp ${formatNumber(service.price)}`;
    if (min) min.textContent = service.min;
    if (max) max.textContent = service.max || '∞';
    if (qtyMin) qtyMin.textContent = service.min;
    
    const minQty = service.min || 1;
    if (qtyInput) {
        qtyInput.value = minQty;
        qtyInput.min = minQty;
        if (service.max) qtyInput.max = service.max;
    }
    state.cart.quantity = minQty;
    
    document.querySelectorAll('.service-card').forEach(c => c.classList.toggle('selected', c.dataset.serviceId == serviceId));
    calculateTotal();
    
    const orderSection = document.getElementById('orderSection');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
}

function calculateTotal() {
    const service = state.selectedService;
    const totalEl = document.getElementById('totalAmount');
    if (!service || !totalEl) { if (totalEl) totalEl.textContent = 'Rp 0'; return; }
    const qty = parseInt(document.getElementById('quantityInput')?.value) || 0;
    const total = qty * service.price;
    state.cart.totalPrice = total;
    totalEl.textContent = `Rp ${formatNumber(total)}`;
}

// ============================================
// FUNGSI UNTUK ORDER.HTML (FORM)
// ============================================
function setupOrderForm() {
    const form = document.getElementById('orderForm');
    const select = document.getElementById('serviceSelect');
    const qtyInput = document.getElementById('quantityInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const targetInput = document.getElementById('targetInput');
    
    if (!form) return;
    
    if (select) {
        select.innerHTML = `<option value="">-- Pilih layanan --</option>
            ${state.services.map(s => `<option value="${s.id}">${s.name} - Rp ${formatNumber(s.price)}/unit</option>`).join('')}`;
    }
    
    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            const current = parseInt(qtyInput?.value) || 0;
            const min = parseInt(qtyInput?.min) || 1;
            if (current > min) { qtyInput.value = current - 1; state.cart.quantity = current - 1; calculateTotal(); }
        });
    }
    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            const current = parseInt(qtyInput?.value) || 0;
            const max = parseInt(qtyInput?.max) || Infinity;
            if (current < max) { qtyInput.value = current + 1; state.cart.quantity = current + 1; calculateTotal(); }
        });
    }
    if (qtyInput) {
        qtyInput.addEventListener('change', () => {
            let value = parseInt(qtyInput.value) || 0;
            const min = parseInt(qtyInput.min) || 1;
            const max = parseInt(qtyInput.max) || Infinity;
            if (value < min) value = min;
            if (value > max) value = max;
            qtyInput.value = value;
            state.cart.quantity = value;
            calculateTotal();
        });
    }
    
    if (select) {
        select.addEventListener('change', (e) => {
            const id = e.target.value;
            if (id) selectService(id);
            else {
                state.selectedService = null;
                document.getElementById('pricePerUnit').textContent = 'Rp 0';
                document.getElementById('minOrder').textContent = '0';
                document.getElementById('maxOrder').textContent = '0';
                document.getElementById('qtyMinDisplay').textContent = '0';
                document.getElementById('totalAmount').textContent = 'Rp 0';
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            }
        });
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const serviceId = select?.value;
        const target = targetInput?.value.trim();
        const quantity = parseInt(qtyInput?.value) || 0;
        
        if (!serviceId) { showToast('Pilih layanan!', 'error'); return; }
        if (!target) { showToast('Masukkan target akun!', 'error'); return; }
        
        const service = state.services.find(s => s.id == serviceId);
        if (!service) { showToast('Layanan tidak ditemukan!', 'error'); return; }
        
        const total = quantity * service.price;
        document.getElementById('modalService').textContent = service.name;
        document.getElementById('modalTarget').textContent = target;
        document.getElementById('modalQuantity').textContent = quantity;
        document.getElementById('modalTotal').textContent = `Rp ${formatNumber(total)}`;
        document.getElementById('modalAmount').textContent = `Rp ${formatNumber(total)}`;
        document.getElementById('hiddenService').value = serviceId;
        document.getElementById('hiddenTarget').value = target;
        document.getElementById('hiddenQuantity').value = quantity;
        document.getElementById('hiddenPrice').value = total;
        document.getElementById('paymentModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// ============================================
// FUNGSI UNTUK TRACKING.HTML
// ============================================
function setupTracking() {
    const searchBtn = document.getElementById('trackingSearchBtn');
    const searchInput = document.getElementById('trackingTargetInput');
    if (!searchBtn || !searchInput) return;
    
    searchBtn.addEventListener('click', () => {
        trackOrders(searchInput.value.trim());
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') trackOrders(searchInput.value.trim());
    });
}

function getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

function trackOrders(username) {
    const container = document.getElementById('trackingOrders');
    if (!container) return;
    
    if (!username) {
        container.innerHTML = `<div class="tracking-empty"><i class="fas fa-search"></i><p>Masukkan username untuk melacak pesanan</p></div>`;
        return;
    }
    
    const orders = getOrders().filter(o => o.target?.toLowerCase().includes(username.toLowerCase()));
    if (orders.length === 0) {
        container.innerHTML = `<div class="tracking-empty"><i class="fas fa-inbox"></i><p>Tidak ada pesanan ditemukan untuk username ini</p></div>`;
        return;
    }
    
    container.innerHTML = orders.sort((a, b) => b.id - a.id).map(order => `
        <div class="tracking-card">
            <div class="tracking-header">
                <span class="tracking-id">${order.orderId || '#' + order.id}</span>
                <span class="tracking-date">${formatDate(order.createdAt)}</span>
            </div>
            <div class="tracking-body">
                <div class="tracking-service">${order.serviceName}</div>
                <div class="tracking-target"><i class="fab ${getServiceIcon(order.category || 'social')}"></i> ${order.target}</div>
                <div class="tracking-qty">Qty: ${order.quantity} | Total: Rp ${formatNumber(order.price)}</div>
                <div class="tracking-status status-${order.status}">
                    <i class="fas ${getTrackingStatusIcon(order.status)}"></i>
                    ${capitalize(order.status)}
                </div>
                ${order.status === 'rejected' && order.reason ? `
                    <div class="tracking-reason">
                        <strong>Alasan:</strong> ${order.reason}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const msg = document.getElementById('toastMessage');
    if (msg) msg.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'toast-error' : ''}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ============================================
// MODAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('modalClose');
    const modal = document.getElementById('paymentModal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('proofImage').value = '';
            document.getElementById('senderName').value = '';
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                document.getElementById('imagePreview').innerHTML = '';
                document.getElementById('proofImage').value = '';
                document.getElementById('senderName').value = '';
            }
        });
    }
    
    const proofImage = document.getElementById('proofImage');
    if (proofImage) {
        proofImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { showToast('Maksimal 2MB!', 'error'); proofImage.value = ''; return; }
            if (!file.type.startsWith('image/')) { showToast('Harus gambar!', 'error'); proofImage.value = ''; return; }
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Bukti" />`;
            reader.readAsDataURL(file);
        });
    }
    
    const confirmForm = document.getElementById('confirmationForm');
    if (confirmForm) {
        confirmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const senderName = document.getElementById('senderName').value.trim();
            const proofFile = document.getElementById('proofImage').files[0];
            const serviceId = document.getElementById('hiddenService').value;
            const target = document.getElementById('hiddenTarget').value;
            const quantity = parseInt(document.getElementById('hiddenQuantity').value);
            const total = parseInt(document.getElementById('hiddenPrice').value);
            
            if (!senderName) { showToast('Masukkan nama pengirim!', 'error'); return; }
            if (!proofFile) { showToast('Upload bukti transfer!', 'error'); return; }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const service = state.services.find(s => s.id == serviceId);
                const order = {
                    id: Date.now(),
                    orderId: '#SMB-' + Date.now().toString().slice(-6),
                    serviceId, serviceName: service?.name || 'Unknown',
                    category: service?.category || 'social',
                    target, quantity, price: total, status: 'pending',
                    payment: { senderName, proofImage: e.target.result, transferDate: new Date().toISOString() },
                    createdAt: new Date().toISOString()
                };
                let orders = JSON.parse(localStorage.getItem('orders')) || [];
                orders.push(order);
                localStorage.setItem('orders', JSON.stringify(orders));
                
                if (modal) modal.classList.remove('active');
                document.body.style.overflow = '';
                document.getElementById('orderForm')?.reset();
                document.getElementById('totalAmount').textContent = 'Rp 0';
                document.getElementById('imagePreview').innerHTML = '';
                state.cart = { serviceId: null, target: '', quantity: 0, totalPrice: 0 };
                showToast('Pesanan berhasil dibuat!');
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                document.getElementById('serviceSelect').value = '';
                document.getElementById('pricePerUnit').textContent = 'Rp 0';
                document.getElementById('minOrder').textContent = '0';
                document.getElementById('maxOrder').textContent = '0';
                document.getElementById('qtyMinDisplay').textContent = '0';
            };
            reader.readAsDataURL(proofFile);
        });
    }
    
    const isIndex = document.getElementById('servicesGrid') !== null;
    const isOrder = document.getElementById('orderForm') !== null;
    const isTracking = document.getElementById('trackingTargetInput') !== null;
    
    if (isIndex) {
        loadServices();
    }
    if (isOrder) {
        setupOrderForm();
        const grid = document.getElementById('servicesGrid');
        if (grid) loadServices();
    }
    if (isTracking) {
        setupTracking();
    }
    
    const hamburger = document.getElementById('hamburger');
    const menu = document.querySelector('.navbar-menu');
    if (hamburger && menu) {
        hamburger.addEventListener('click', () => menu.classList.toggle('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => menu.classList.remove('active'));
        });
    }
});
