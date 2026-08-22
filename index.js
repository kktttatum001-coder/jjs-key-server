const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let keyData = { key: "", expiresAt: 0 };
const KEY_DURATION_MINUTES = 60;

function refreshKeyIfNeeded() {
    const now = Date.now();
    if (!keyData.key || now >= keyData.expiresAt) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        keyData = {
            key: `JJS-${randomCode}`,
            expiresAt: now + (KEY_DURATION_MINUTES * 60 * 1000)
        };
    }
}

// 🌐 เพิ่มคำสั่งนี้เพื่อให้เซิร์ฟเวอร์แสดงหน้าเว็บ index.html ทันทีที่เข้าลิงก์หลัก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API สำหรับดึงคีย์
app.get('/api/get-key', (req, res) => {
    refreshKeyIfNeeded();
    res.json(keyData);
});

// API ตรวจสอบคีย์
app.get('/api/verify', (req, res) => {
    refreshKeyIfNeeded();
    const userKey = req.query.key;
    const isValid = (userKey === keyData.key) && (Date.now() < keyData.expiresAt);
    res.json({ valid: isValid });
});

app.listen(process.env.PORT || 3000);
