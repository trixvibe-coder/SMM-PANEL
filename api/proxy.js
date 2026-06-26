// File: api/proxy.js

const API_KEY = 'afdd33f75f265f6771070c5ce32964d824306ba194fb63b521d5f22afcd32a61';        // Ganti dengan API key asli lo
const SECRET_KEY = '96b5d8f9f69d658affee5e231acaeda26238e149d38029ed2b565c827cb0311a';  // Ganti dengan secret key asli lo
const BASE_API_URL = 'https://pusatpanelsmm.com/api/json.php';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Ambil parameter dari query string
        const { action } = req.query;
        
        // BANGUN URL DENGAN PARAMETER YANG BENAR
        // Perhatikan: action=services (pake 's')
        const targetUrl = `${BASE_API_URL}?api_key=${API_KEY}&secret_key=${SECRET_KEY}&action=${action || 'services'}`;
        
        console.log('🔄 Forwarding to:', targetUrl);

        // PAKE POST (bukan GET)
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const data = await response.json();
        console.log('📦 Response from API:', data);

        res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ Proxy Error:', error);
        res.status(500).json({
            status: false,
            message: 'Proxy error: ' + error.message
        });
    }
}
