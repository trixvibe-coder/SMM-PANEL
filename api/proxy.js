// File: api/proxy.js
// DINONAKTIFKAN SEMENTARA - PAKE DATA DUMMY

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
        status: true,
        message: 'Proxy dinonaktifkan, menggunakan data dummy',
        data: []
    });
}
