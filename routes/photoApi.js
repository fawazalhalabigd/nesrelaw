const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

// ========================
// ⚡ Config
// ========================
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ========================
// 🗂 Multer Setup
// ========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const tempName = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, tempName);
    }
});
const upload = multer({ storage });

// ========================
// 🚀 Routes
// ========================

// GET - HTML Form for testing
router.get('/image', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Upload Image</title>
    </head>
    <body>
        <h2>Upload Image</h2>
        <form action="/image/upload" method="POST" enctype="multipart/form-data">
            <label>Select image:</label><br>
            <input type="file" name="photo" accept="image/*" required><br><br>
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
    `);
});

// POST - Upload and convert image to WebP
router.post('/image/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith('photo-') && f.endsWith('.webp'));
        const nextNumber = files.length + 1;
        const newName = `photo-${nextNumber}.webp`;
        const newPath = path.join(UPLOAD_DIR, newName);

        await sharp(req.file.path)
            .webp({ quality: 70 })
            .toFile(newPath);

        fs.unlinkSync(req.file.path);

        res.json({
            message: "✅ Photo uploaded and converted to WebP successfully",
            filename: newName,
            path: `/uploads/${newName}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST - Delete image by number
router.post('/image/delete', (req, res) => {
    const number = String(req.body.number);
    if (!number) return res.status(400).json({ error: "Number is required." });

    const filename = `photo-${number}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.unlink(filePath, err => {
        if (err) return res.status(500).json({ error: "Failed to delete file. Maybe it doesn't exist." });
        res.json({ message: `🗑️ File ${filename} deleted successfully.` });
    });
});

module.exports = router;
