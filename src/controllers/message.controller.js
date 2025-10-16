const whatsappService = require('../services/whatsapp.service');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

// Get QR Code
const getQRCode = async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    
    if (!qrCode) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp QR Code</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #25D366; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>WhatsApp API</h1>
            <p>Client is either already authenticated or waiting for initialization.</p>
            <p>Check the console for QR code or refresh this page in a few seconds.</p>
            <button onclick="location.reload()">Refresh</button>
          </div>
        </body>
        </html>
      `);
    }

    // Return HTML page with QR code image
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp QR Code</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #25D366; }
          img { max-width: 400px; margin: 20px 0; }
          .instructions { text-align: left; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📱 Scan QR Code with WhatsApp</h1>
          <img src="${qrCode}" alt="QR Code" />
          <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Open WhatsApp on your phone</li>
              <li>Tap Menu or Settings and select Linked Devices</li>
              <li>Tap on Link a Device</li>
              <li>Point your phone at this screen to scan the QR code</li>
            </ol>
          </div>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Refresh QR Code</button>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    logger.error('Error getting QR code:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get WhatsApp status
const getStatus = async (req, res) => {
  try {
    const isReady = whatsappService.isClientReady();
    const state = await whatsappService.getClientState();
    
    return successResponse(res, {
      ready: isReady,
      state: state.state,
      message: isReady ? 'WhatsApp client is ready' : 'WhatsApp client is not ready'
    });
  } catch (error) {
    logger.error('Error getting status:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Send text message
const sendMessage = async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return errorResponse(res, 'Number and message are required', 400);
    }

    const result = await whatsappService.sendMessage(number, message);
    return successResponse(res, result, 'Message sent successfully');
  } catch (error) {
    logger.error('Error sending message:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Send media message
const sendMedia = async (req, res) => {
  try {
    const { number, mediaUrl, caption } = req.body;

    if (!number || !mediaUrl) {
      return errorResponse(res, 'Number and mediaUrl are required', 400);
    }

    const result = await whatsappService.sendMediaMessage(number, mediaUrl, caption);
    return successResponse(res, result, 'Media sent successfully');
  } catch (error) {
    logger.error('Error sending media:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Send file
const sendFile = async (req, res) => {
  try {
    const { number, caption } = req.body;
    const file = req.file;

    if (!number || !file) {
      return errorResponse(res, 'Number and file are required', 400);
    }

    const result = await whatsappService.sendMediaFromBuffer(
      number,
      file.buffer,
      file.originalname,
      file.mimetype,
      caption
    );
    
    return successResponse(res, result, 'File sent successfully');
  } catch (error) {
    logger.error('Error sending file:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all chats
const getChats = async (req, res) => {
  try {
    const chats = await whatsappService.getChats();
    return successResponse(res, { chats, count: chats.length });
  } catch (error) {
    logger.error('Error getting chats:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get contact info
const getContactInfo = async (req, res) => {
  try {
    const { number } = req.params;

    if (!number) {
      return errorResponse(res, 'Number is required', 400);
    }

    const contact = await whatsappService.getContactInfo(number);
    return successResponse(res, contact);
  } catch (error) {
    logger.error('Error getting contact info:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const result = await whatsappService.logout();
    return successResponse(res, result, 'Logged out successfully');
  } catch (error) {
    logger.error('Error logging out:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getQRCode,
  getStatus,
  sendMessage,
  sendMedia,
  sendFile,
  getChats,
  getContactInfo,
  logout
};