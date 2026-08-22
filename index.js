const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let keyData = { key: "", expiresAt: 0 };
const KEY_DURATION_MINUTES = 60;

// 👑 กำหนดรหัสคีย์ส่วนตัวสำหรับเจ้าของ (เปลี่ยนข้อความในเครื่องหมายคำพูดได้ตามใจชอบเลยครับ)
const OWNER_KEY = "MY-SECRET-OWNER-KEY-999";

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

// หน้าเว็บหลัก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// หน้าเว็บแสดงคีย์
app.get('/key', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'key.html'));
});

// API ดึงคีย์ปกติ
app.get('/api/get-key', (req, res) => {
    refreshKeyIfNeeded();
    res.json(keyData);
});

// API ตรวจสอบคีย์ (รองรับทั้งคีย์ปกติและ Owner Key)
app.get('/api/verify', (req, res) => {
    refreshKeyIfNeeded();
    const userKey = req.query.key;
    
    // เช็คว่าตรงกับคีย์ประจำชั่วโมง หรือ ตรงกับ Owner Key ถาวรหรือไม่
    const isValid = (userKey === keyData.key) || (userKey === OWNER_KEY);
    
    res.json({ valid: isValid });
});

app.listen(process.env.PORT || 3000);
