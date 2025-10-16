const express = require('express');
const multer = require('multer');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateSendMessage, validateSendMedia } = require('../middleware/validation.middleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  }
});

// Public routes (no auth required for QR code)
router.get('/qr', messageController.getQRCode);

// Protected routes (require API key)
router.get('/status', authMiddleware, messageController.getStatus);
router.post('/send-message', authMiddleware, validateSendMessage, messageController.sendMessage);
router.post('/send-media', authMiddleware, validateSendMedia, messageController.sendMedia);
router.post('/send-file', authMiddleware, upload.single('file'), messageController.sendFile);
router.get('/chats', authMiddleware, messageController.getChats);
router.get('/contact/:number', authMiddleware, messageController.getContactInfo);
router.post('/logout', authMiddleware, messageController.logout);

module.exports = router;