// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
    DANA_NUMBER: '085216704274', // Ganti dengan nomor DANA lo
    ADMIN_PASSWORD: 'WAnzSHOP0812'
};

// ============================================
// STATE - DATA LAYANAN (HARGA SETTINGAN LO)
// ============================================
let state = {
    services: [
        // ========== INSTAGRAM ==========
        // ========== INSTAGRAM ==========
        { id: 1, name: 'Followers Instagram (Indonesia)', price: 31, min: 100, max: 2000, category: 'instagram' },
        { id: 2, name: 'Followers Instagram (Global)', price: 10, min: 100, max: 50000, category: 'instagram' },
        { id: 3, name: 'Likes Foto Instagram', price: 5, min: 50, max: 50000, category: 'instagram' },
        { id: 4, name: 'Views Reels Instagram', price: 5, min: 50, max: 100000, category: 'instagram' },
        { id: 5, name: 'Komentar Instagram', price: 10, min: 50, max: 1000, category: 'instagram' },
        { id: 6, name: 'Save Post Instagram', price: 5, min: 100, max: 5000, category: 'instagram' },
        { id: 7, name: 'Story Views Instagram', price: 3, min: 100, max: 50000, category: 'instagram' },
        { id: 8, name: 'IGTV Views', price: 5, min: 50, max: 100000, category: 'instagram' },
        
        // ========== TIKTOK ==========
        { id: 9, name: 'Followers TikTok (Indonesia)', price: 65, min: 100, max: 50000, category: 'tiktok' },
        { id: 10, name: 'Followers TikTok (Global)', price: 25, min: 100, max: 50000, category: 'tiktok' },
        { id: 11, name: 'Likes Video TikTok', price: 5, min: 100, max: 50000, category: 'tiktok' },
        { id: 12, name: 'Views TikTok', price: 3, min: 100, max: 100000, category: 'tiktok' },
        { id: 13, name: 'Share TikTok', price: 3, min: 100, max: 50000, category: 'tiktok' },
        { id: 14, name: 'Comment TikTok', price: 18, min: 100, max: 1000, category: 'tiktok' },
        { id: 15, name: 'Live Views TikTok', price: 300, min: 100, max: 50000, category: 'tiktok' },
        
        // ========== WHATSAPP ==========
        { id: 16, name: 'Pengikut Saluran WhatsApp', price: 50, min: 50, max: 500, category: 'whatsapp' },
        { id: 17, name: 'WhatsApp Verified Badge', price: 1500000, min: 1, max: 1, category: 'whatsapp' },
    ],
    selectedService: null,
    cart: {
        serviceId: null,
        target: '',
        quantity: 10,
        totalPrice: 0
    }
};

// ============================================
// DOM REFERENCES
// ============================================
const DOM = {
    servicesGrid: document.getElementById('servicesGrid'),
    loadingServices: document.getElementById('loadingServices'),
    serviceSelect: document.getElementById('serviceSelect'),
    pricePerUnit: document.getElementById('pricePerUnit'),
    minOrder: document.getElementById('minOrder'),
    maxOrder: document.getElementById('maxOrder'),
    qtyMinDisplay: document.getElementById('qtyMinDisplay'),
    targetInput: document.getElementById('targetInput'),
    quantityInput: document.getElementById('quantityInput'),
    qtyMinus: document.getElementById('qtyMinus'),
    qtyPlus: document.getElementById('qtyPlus'),
    totalAmount: document.getElementById('totalAmount'),
    orderForm: document.getElementById('orderForm'),
    paymentModal: document.getElementById('paymentModal'),
    modalClose: document.getElementById('modalClose'),
    modalService: document.getElementById('modalService'),
    modalTarget: document.getElementById('modalTarget'),
    modalQuantity: document.getElementById('modalQuantity'),
    modalTotal: document.getElementById('modalTotal'),
    modalAmount: document.getElementById('modalAmount'),
    confirmationForm: document.getElementById('confirmationForm'),
    senderName: document.getElementById('senderName'),
    proofImage: document.getElementById('proofImage'),
    imagePreview: document.getElementById('imagePreview'),
    hiddenService: document.getElementById('hiddenService'),
    hiddenTarget: document.getElementById('hiddenTarget'),
    hiddenQuantity: document.getElementById('hiddenQuantity'),
    hiddenPrice: document.getElementById('hiddenPrice'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    hamburger: document.getElementById('hamburger'),
    navbarMenu: document.querySelector('.navbar-menu')
};

// ============================================
// 1. LOAD SERVICES (LANGSUNG DARI STATE)
// ============================================
function loadServices() {
    console.log('🚀 loadServices() dipanggil');
    DOM.loadingServices.style.display = 'none';
    
    console.log('📦 Jumlah layanan:', state.services.length);
    
    if (!DOM.servicesGrid) {
        console.error('❌ DOM.servicesGrid tidak ditemukan!');
        return;
    }
    
    if (state.services.length === 0) {
        DOM.servicesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p>Tidak ada layanan tersedia</p>
            </div>
        `;
        return;
    }
    
    renderServices(state.services);
    populateSelect(state.services);
}

// ============================================
// 2. RENDER SERVICES
// ============================================
function renderServices(services) {
    if (!services || !Array.isArray(services)) {
        console.error('❌ services bukan array:', services);
        return;
    }
    
    if (services.length === 0) {
        DOM.servicesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p>Tidak ada layanan tersedia</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    services.forEach(service => {
        html += `
            <div class="service-card" data-service-id="${service.id}" onclick="selectService('${service.id}')">
                <div class="service-icon">
                    <i class="fab fa-${getServiceIcon(service.category)}"></i>
                </div>
                <div class="service-name">${service.name}</div>
                <div class="service-category">${capitalize(service.category)}</div>
                <div class="service-price">
                    Rp ${formatNumber(service.price)}
                    <small>/unit</small>
                </div>
                <div class="service-min">Min. Order: ${service.min}</div>
                ${service.max ? `<div class="service-max" style="font-size:13px;color:var(--gray-500);">Max. Order: ${service.max}</div>` : ''}
            </div>
        `;
    });
    
    DOM.servicesGrid.innerHTML = html;
}

// ============================================
// 3. POPULATE SELECT
// ============================================
function populateSelect(services) {
    if (!services || services.length === 0) return;
    
    DOM.serviceSelect.innerHTML = `
        <option value="">-- Pilih layanan --</option>
        ${services.map(service => `
            <option value="${service.id}">
                ${service.name} - Rp ${formatNumber(service.price)}/unit
            </option>
        `).join('')}
    `;
}

// ============================================
// 4. SELECT SERVICE
// ============================================
function selectService(serviceId) {
    const service = state.services.find(s => s.id == serviceId);
    if (!service) return;
    
    state.selectedService = service;
    DOM.serviceSelect.value = serviceId;
    
    DOM.pricePerUnit.textContent = `Rp ${formatNumber(service.price)}`;
    DOM.minOrder.textContent = service.min;
    DOM.maxOrder.textContent = service.max || '∞';
    DOM.qtyMinDisplay.textContent = service.min;
    
    const minQty = service.min || 1;
    DOM.quantityInput.value = minQty;
    DOM.quantityInput.min = minQty;
    if (service.max) DOM.quantityInput.max = service.max;
    state.cart.quantity = minQty;
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.serviceId == serviceId);
    });
    
    calculateTotal();
    document.getElementById('orderSection').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// 5. HANDLE QUANTITY
// ============================================
DOM.qtyMinus.addEventListener('click', () => {
    const current = parseInt(DOM.quantityInput.value) || 0;
    const min = parseInt(DOM.quantityInput.min) || 1;
    if (current > min) {
        DOM.quantityInput.value = current - 1;
        state.cart.quantity = current - 1;
        calculateTotal();
    }
});

DOM.qtyPlus.addEventListener('click', () => {
    const current = parseInt(DOM.quantityInput.value) || 0;
    const max = parseInt(DOM.quantityInput.max) || Infinity;
    if (current < max) {
        DOM.quantityInput.value = current + 1;
        state.cart.quantity = current + 1;
        calculateTotal();
    }
});

DOM.quantityInput.addEventListener('change', () => {
    const value = parseInt(DOM.quantityInput.value) || 0;
    const min = parseInt(DOM.quantityInput.min) || 1;
    const max = parseInt(DOM.quantityInput.max) || Infinity;
    
    if (value < min) {
        DOM.quantityInput.value = min;
        state.cart.quantity = min;
    } else if (value > max) {
        DOM.quantityInput.value = max;
        state.cart.quantity = max;
    } else {
        state.cart.quantity = value;
    }
    calculateTotal();
});

// ============================================
// 6. CALCULATE TOTAL
// ============================================
function calculateTotal() {
    const service = state.selectedService;
    if (!service) {
        DOM.totalAmount.textContent = 'Rp 0';
        return;
    }
    
    const qty = parseInt(DOM.quantityInput.value) || 0;
    const total = qty * service.price;
    
    state.cart.totalPrice = total;
    DOM.totalAmount.textContent = `Rp ${formatNumber(total)}`;
}

// ============================================
// 7. HANDLE ORDER FORM SUBMIT
// ============================================
DOM.orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serviceId = DOM.serviceSelect.value;
    const target = DOM.targetInput.value.trim();
    const quantity = parseInt(DOM.quantityInput.value) || 0;
    
    if (!serviceId) {
        showToast('Pilih layanan terlebih dahulu!', 'error');
        return;
    }
    
    if (!target) {
        showToast('Masukkan username/link akun!', 'error');
        return;
    }
    
    const service = state.services.find(s => s.id == serviceId);
    if (!service) {
        showToast('Layanan tidak ditemukan!', 'error');
        return;
    }
    
    const total = quantity * service.price;
    
    DOM.modalService.textContent = service.name;
    DOM.modalTarget.textContent = target;
    DOM.modalQuantity.textContent = quantity;
    DOM.modalTotal.textContent = `Rp ${formatNumber(total)}`;
    DOM.modalAmount.textContent = `Rp ${formatNumber(total)}`;
    
    DOM.hiddenService.value = serviceId;
    DOM.hiddenTarget.value = target;
    DOM.hiddenQuantity.value = quantity;
    DOM.hiddenPrice.value = total;
    
    DOM.paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// ============================================
// 8. CLOSE MODAL
// ============================================
function closeModal() {
    DOM.paymentModal.classList.remove('active');
    document.body.style.overflow = '';
    DOM.imagePreview.innerHTML = '';
    DOM.proofImage.value = '';
    DOM.senderName.value = '';
}

DOM.modalClose.addEventListener('click', closeModal);

DOM.paymentModal.addEventListener('click', (e) => {
    if (e.target === DOM.paymentModal) {
        closeModal();
    }
});

// ============================================
// 9. HANDLE PROOF IMAGE UPLOAD
// ============================================
DOM.proofImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file terlalu besar! Maksimal 2MB.', 'error');
        DOM.proofImage.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar!', 'error');
        DOM.proofImage.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Bukti Transfer" />`;
    };
    reader.readAsDataURL(file);
});

// ============================================
// 10. HANDLE CONFIRMATION FORM
// ============================================
DOM.confirmationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const senderName = DOM.senderName.value.trim();
    const proofFile = DOM.proofImage.files[0];
    const serviceId = DOM.hiddenService.value;
    const target = DOM.hiddenTarget.value;
    const quantity = parseInt(DOM.hiddenQuantity.value);
    const total = parseInt(DOM.hiddenPrice.value);
    
    if (!senderName) {
        showToast('Masukkan nama pengirim!', 'error');
        return;
    }
    
    if (!proofFile) {
        showToast('Upload bukti transfer!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const proofImage = e.target.result;
        const service = state.services.find(s => s.id == serviceId);
        
        const order = {
            id: Date.now(),
            serviceId: serviceId,
            serviceName: service?.name || 'Unknown',
            target: target,
            quantity: quantity,
            price: total,
            status: 'pending',
            payment: {
                senderName: senderName,
                proofImage: proofImage,
                transferDate: new Date().toISOString()
            },
            createdAt: new Date().toISOString()
        };
        
        saveOrder(order);
        
        closeModal();
        DOM.orderForm.reset();
        DOM.totalAmount.textContent = 'Rp 0';
        DOM.imagePreview.innerHTML = '';
        state.cart = { serviceId: null, target: '', quantity: 0, totalPrice: 0 };
        
        showToast('Pesanan berhasil dibuat! Tunggu konfirmasi admin.', 'success');
        
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
        });
        DOM.serviceSelect.value = '';
        DOM.pricePerUnit.textContent = 'Rp 0';
        DOM.minOrder.textContent = '0';
        DOM.maxOrder.textContent = '0';
        DOM.qtyMinDisplay.textContent = '0';
    };
    reader.readAsDataURL(proofFile);
});

// ============================================
// 11. SAVE ORDER
// ============================================
function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// ============================================
// 12. TOAST
// ============================================
function showToast(message, type = 'success') {
    DOM.toastMessage.textContent = message;
    DOM.toast.className = 'toast show';
    if (type === 'error') {
        DOM.toast.classList.add('toast-error');
    } else {
        DOM.toast.classList.remove('toast-error');
    }
    
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 4000);
}

// ============================================
// 13. UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

// ============================================
// 14. HAMBURGER
// ============================================
DOM.hamburger.addEventListener('click', () => {
    DOM.navbarMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        DOM.navbarMenu.classList.remove('active');
    });
});

// ============================================
// 15. SELECT CHANGE
// ============================================
DOM.serviceSelect.addEventListener('change', (e) => {
    const serviceId = e.target.value;
    if (serviceId) {
        selectService(serviceId);
    } else {
        state.selectedService = null;
        DOM.pricePerUnit.textContent = 'Rp 0';
        DOM.minOrder.textContent = '0';
        DOM.maxOrder.textContent = '0';
        DOM.qtyMinDisplay.textContent = '0';
        DOM.totalAmount.textContent = 'Rp 0';
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
        });
    }
});

// ============================================
// TRACKING ORDERS (FITUR BARU - STABIL)
// ============================================
function getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

function trackOrders(username) {
    const container = document.getElementById('trackingOrders');
    if (!container) return;
    
    if (!username) {
        container.innerHTML = `
            <div class="tracking-empty">
                <i class="fas fa-search"></i>
                <p>Masukkan username untuk melacak pesanan</p>
            </div>
        `;
        return;
    }
    
    const orders = getOrders().filter(o => 
        o.target?.toLowerCase().includes(username.toLowerCase())
    );
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="tracking-empty">
                <i class="fas fa-inbox"></i>
                <p>Tidak ada pesanan ditemukan untuk username ini</p>
            </div>
        `;
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
                <div class="tracking-target"><i class="fas fa-user"></i> ${order.target}</div>
                <div class="tracking-qty">Qty: ${order.quantity} | Total: Rp ${formatNumber(order.price)}</div>
                <div class="tracking-status status-${order.status}">
                    <i class="fas ${getTrackingStatusIcon(order.status)}"></i>
                    ${capitalize(order.status)}
                </div>
                ${order.status === 'rejected' && order.reason ? `
                    <div class="tracking-reason">
                        <i class="fas fa-info-circle"></i> ${order.reason}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getTrackingStatusIcon(status) {
    const icons = {
        pending: 'fa-clock',
        processed: 'fa-spinner fa-spin',
        completed: 'fa-check-circle',
        rejected: 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
}

// Event listener tracking (jalan otomatis)
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('trackingSearchBtn');
    const searchInput = document.getElementById('trackingTargetInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            trackOrders(searchInput.value.trim());
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackOrders(searchInput.value.trim());
            }
        });
    }
});

// ============================================
// 16. INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    // Hanya tampilkan DANA di modal (bukan di footer)
    document.querySelectorAll('#paymentModal .dana-number').forEach(el => {
        el.textContent = CONFIG.DANA_NUMBER;
    });
});
