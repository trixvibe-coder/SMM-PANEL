// ============================================
// KONFIGURASI - VERSI PROXY VERCEL
// ============================================
const CONFIG = {
    // API_URL sekarang ngarah ke proxy Vercel lo
    API_URL: '/api/proxy', // Ini otomatis ke backend lo di Vercel
    DANA_NUMBER: '0857-1405-4900', // Ganti dengan nomor DANA lo
    ADMIN_PASSWORD: 'admin123'
};

// ============================================
// STATE
// ============================================
let state = {
    services: [],
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
// 1. FETCH SERVICES - VIA PROXY VERCEL
// ============================================
async function fetchServices() {
    try {
        DOM.loadingServices.style.display = 'block';
        DOM.servicesGrid.innerHTML = '';
        
        // Panggil proxy Vercel dengan parameter action
        const url = `${CONFIG.API_URL}?action=services`;
        console.log('📤 Fetching from proxy:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Response from proxy:', result);
        
        // Cek status dari PusatPanelSMM (via proxy)
        if (result.status === true && Array.isArray(result.data)) {
            state.services = result.data;
            renderServices(result.data);
            populateSelect(result.data);
            showToast(`✅ ${result.data.length} layanan dimuat`, 'success');
        } else {
            throw new Error(result.data?.msg || result.message || 'Gagal memuat data');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        DOM.servicesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-circle" style="font-size: 40px; color: #EF4444;"></i>
                <h3 style="margin: 12px 0; color: #991B1B;">Gagal Memuat Layanan</h3>
                <p style="color: #64748B; margin-bottom: 8px;">${error.message}</p>
                <details style="margin: 12px auto; text-align: left; max-width: 400px; background: #F1F5F9; padding: 12px; border-radius: 8px;">
                    <summary style="cursor: pointer; font-weight: 600;">🔍 Detail</summary>
                    <pre style="font-size: 12px; color: #475569; white-space: pre-wrap; word-break: break-all; margin-top: 8px;">${error.stack || error.message}</pre>
                </details>
                <button onclick="fetchServices()" class="btn btn-primary" style="margin-top: 16px;">
                    <i class="fas fa-sync"></i> Coba Lagi
                </button>
            </div>
        `;
    } finally {
        DOM.loadingServices.style.display = 'none';
    }
}

// ============================================
// 2. RENDER SERVICES
// ============================================
function renderServices(services) {
    if (!services || services.length === 0) {
        DOM.servicesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p>Tidak ada layanan tersedia</p>
            </div>
        `;
        return;
    }
    
    DOM.servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service.id}" onclick="selectService('${service.id}')">
            <div class="service-icon">
                <i class="fas fa-${getServiceIcon(service.category || 'social')}"></i>
            </div>
            <div class="service-name">${service.name || 'Layanan'}</div>
            <div class="service-category">${service.category || 'Sosial Media'}</div>
            <div class="service-price">
                Rp ${formatNumber(service.price || 0)}
                <small>/unit</small>
            </div>
            <div class="service-min">Min. Order: ${service.min || 0}</div>
            ${service.max ? `<div class="service-max" style="font-size:13px;color:var(--gray-500);">Max. Order: ${service.max}</div>` : ''}
            ${service.note ? `<div class="service-note" style="font-size:12px;color:var(--gray-400);margin-top:8px;">${service.note}</div>` : ''}
        </div>
    `).join('');
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
                ${service.name} - Rp ${formatNumber(service.price || 0)}/unit
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
    
    const price = service.price || 0;
    const min = service.min || 0;
    const max = service.max || Infinity;
    
    DOM.pricePerUnit.textContent = `Rp ${formatNumber(price)}`;
    DOM.minOrder.textContent = min;
    DOM.maxOrder.textContent = max === Infinity ? '∞' : max;
    DOM.qtyMinDisplay.textContent = min;
    
    const minQty = min || 1;
    DOM.quantityInput.value = minQty;
    DOM.quantityInput.min = minQty;
    if (max !== Infinity) DOM.quantityInput.max = max;
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
    const price = service.price || 0;
    const total = qty * price;
    
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
    
    const total = quantity * (service.price || 0);
    
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
        'youtube': 'fa-youtube',
        'facebook': 'fa-facebook',
        'twitter': 'fa-twitter',
        'telegram': 'fa-telegram',
        'spotify': 'fa-spotify',
        'social': 'fa-share-alt'
    };
    return icons[category?.toLowerCase()] || 'fa-share-alt';
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
// 16. INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    document.querySelectorAll('.dana-number').forEach(el => {
        el.textContent = CONFIG.DANA_NUMBER;
    });
});