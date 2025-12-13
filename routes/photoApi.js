const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const API_PASSWORD = 'Fawaz123456!#';
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// Middleware للتحقق من كلمة السر
function checkPassword(req, res, next) {
  const pw = req.body && req.body.password;
  if (!pw) return res.status(400).json({ error: "Password is required in request body." });
  if (pw !== API_PASSWORD) return res.status(401).json({ error: "Unauthorized: wrong password." });
  delete req.body.password;
  next();
}

// Multer للتخزين المؤقت
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // سنغير الاسم بعد المعالجة
  }
});
const upload = multer({ storage });

// ===================================
// 🟢 API رفع صورة + تحويل WebP
// ===================================
router.post('/image/upload', upload.single('photo'), async (req, res) => {
  const pw = req.body && req.body.password;
  if (!pw) return res.status(400).json({ error: "Password is required in request body." });
  if (pw !== API_PASSWORD) return res.status(401).json({ error: "Unauthorized: wrong password." });
  delete req.body.password;

  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  try {
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
    return res.status(500).json({ error: "Failed to process image." });
  }
});

router.post('/image/delete', (req, res) => {
  const pw = req.body && req.body.password;
  if (!pw) return res.status(400).json({ error: "Password is required in request body." });
  if (pw !== API_PASSWORD) return res.status(401).json({ error: "Unauthorized: wrong password." });

  const number = req.body.number; // الرقم فقط كـ string
  if (!number) return res.status(400).json({ error: "Number is required in body." });

  // تحويل الرقم إلى اسم الملف الكامل
  const filename = `photo-${number}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete file. Maybe it doesn't exist." });
    res.json({ message: `🗑️ File ${filename} deleted successfully.` });
  });
});


router.get('/image', (req, res) => {
  return res.send(`
    
            <form action="/image/upload">
                <input type="text" name="password">
                <input type="image">
            </form>
    `)
});
module.exports = router;
