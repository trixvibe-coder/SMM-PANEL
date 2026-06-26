// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
    ADMIN_PASSWORD: 'admin123' // Default password
};

// ============================================
// DOM REFERENCES
// ============================================
const loginForm = document.getElementById('loginForm');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

// ============================================
// HANDLE LOGIN
// ============================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = loginPassword.value.trim();
    
    // Check password from localStorage or default
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    const adminPassword = settings.adminPassword || CONFIG.ADMIN_PASSWORD;
    
    if (password === adminPassword) {
        // Login success
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        // Login failed
        loginError.classList.add('show');
        loginError.textContent = 'Password salah! Silakan coba lagi.';
        loginPassword.value = '';
        loginPassword.focus();
        
        // Hide error after 3 seconds
        setTimeout(() => {
            loginError.classList.remove('show');
        }, 3000);
    }
});

// ============================================
// HANDLE ENTER KEY
// ============================================
loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// ============================================
// CHECK IF ALREADY LOGGED IN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'admin.html';
    }
});