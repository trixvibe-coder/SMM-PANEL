// File: api/proxy.js

// API Key dan Secret Key - AMAN di sisi server
// Ganti dengan kunci asli Anda!
const API_KEY = 'afdd33f75f265f6771070c5ce32964d824306ba194fb63b521d5f22afcd32a61';
const SECRET_KEY = '96b5d8f9f69d658affee5e231acaeda26238e149d38029ed2b565c827cb0311a';
const BASE_API_URL = 'https://pusatpanelsmm.com/api/json.php';

export default async function handler(req, res) {
    // 1. Izinkan akses dari semua domain (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Tangani preflight request (OPTIONS) dari browser
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Ambil parameter 'action' dari query string (misal: ?action=services)
    const { action } = req.query;

    // 4. Bangun URL untuk API PusatPanelSMM
    const targetUrl = `${BASE_API_URL}?api_key=${API_KEY}&secret_key=${SECRET_KEY}&action=${action}`;

    console.log(`🔄 Meneruskan request ke: ${targetUrl}`);

    try {
        // 5. Lakukan request ke API PusatPanelSMM
        const response = await fetch(targetUrl);
        const data = await response.json();

        // 6. Kirim balik data dari API ke frontend Anda
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Proxy Error:', error);
        res.status(500).json({
            status: false,
            message: 'Gagal menghubungi API melalui proxy.',
            error: error.message
        });
    }
}