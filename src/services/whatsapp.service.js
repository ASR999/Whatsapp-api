const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const config = require('../config/whatsapp.config');
const logger = require('../utils/logger');

let client;
let qrCodeData = null;
let isReady = false;
let isInitializing = false;

// Initialize WhatsApp client
const initializeWhatsApp = () => {
  if (isInitializing) {
    logger.info('WhatsApp client is already initializing');
    return;
  }

  isInitializing = true;

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: config.session.clientId
    }),
    puppeteer: config.puppeteer
  });

  console.log("HELLLOOO");
  

  // QR Code event
  client.on('qr', async (qr) => {
    logger.info('QR Code received, scan with your phone');
    qrcodeTerminal.generate(qr, { small: true });
    
    // Generate QR code as data URL for API
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      logger.info('QR Code generated successfully');
    } catch (err) {
      logger.error('Error generating QR code:', err);
    }
  });


  console.log("Helloo2");
  
  // Ready event
  client.on('ready', () => {
    isReady = true;
    isInitializing = false;
    qrCodeData = null;
    logger.info('WhatsApp client is ready!');
  });

  console.log("Hellooo3");
  

  // Authenticated event
  client.on('authenticated', () => {
    logger.info('WhatsApp client authenticated');
  });


  console.log("Helloooo4");
  

  // Authentication failure event
  client.on('auth_failure', (msg) => {
    logger.error('Authentication failure:', msg);
    isReady = false;
    isInitializing = false;
  });


  console.log("Hellooo5");
  

  // Disconnected event
  client.on('disconnected', (reason) => {
    logger.warn('WhatsApp client disconnected:', reason);
    isReady = false;
    isInitializing = false;
    qrCodeData = null;
  });


  console.log("Hellooo5");
  // Message event
  client.on('message', async (message) => {
    logger.info(`Message received from ${message.from}: ${message.body}`);
    
    // You can add auto-reply logic here
    // Example: if (message.body === 'ping') { message.reply('pong'); }
  });

  // Initialize the client
  client.initialize();
};

// Get WhatsApp client
const getClient = () => {
  if (!client) {
    throw new Error('WhatsApp client not initialized');
  }
  return client;
};

// Check if client is ready
const isClientReady = () => {
  return isReady;
};

// Get QR code
const getQRCode = () => {
  return qrCodeData;
};

// Format phone number
const formatNumber = (number) => {
  // Remove all non-numeric characters
  let cleaned = number.replace(/\D/g, '');
  
  // Add country code if not present
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned + '@c.us';
};

// Send text message
const sendMessage = async (number, message) => {
  // if (!isReady) {
  //   throw new Error('WhatsApp client is not ready');
  // }

  console.log("Hellooosend1");
  const formattedNumber = formatNumber(number);
  console.log("Hellooosend1");
  try {
    const chat = await client.sendMessage(formattedNumber, message);
    logger.info(`Message sent to ${number}`);
    return { success: true, messageId: chat.id._serialized };
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
};

// Send media message
const sendMediaMessage = async (number, mediaUrl, caption = '') => {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready');
  }

  const formattedNumber = formatNumber(number);
  
  try {
    const media = await MessageMedia.fromUrl(mediaUrl);
    const chat = await client.sendMessage(formattedNumber, media, { caption });
    logger.info(`Media sent to ${number}`);
    return { success: true, messageId: chat.id._serialized };
  } catch (error) {
    logger.error('Error sending media:', error);
    throw error;
  }
};

// Send file from buffer
const sendMediaFromBuffer = async (number, buffer, filename, mimetype, caption = '') => {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready');
  }

  const formattedNumber = formatNumber(number);
  
  try {
    const media = new MessageMedia(mimetype, buffer.toString('base64'), filename);
    const chat = await client.sendMessage(formattedNumber, media, { caption });
    logger.info(`Media file sent to ${number}`);
    return { success: true, messageId: chat.id._serialized };
  } catch (error) {
    logger.error('Error sending media file:', error);
    throw error;
  }
};

// Get all chats
const getChats = async () => {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready');
  }

  try {
    const chats = await client.getChats();
    return chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage ? {
        body: chat.lastMessage.body,
        timestamp: chat.lastMessage.timestamp
      } : null
    }));
  } catch (error) {
    logger.error('Error getting chats:', error);
    throw error;
  }
};

// Get contact info
const getContactInfo = async (number) => {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready');
  }

  const formattedNumber = formatNumber(number);
  
  try {
    const contact = await client.getContactById(formattedNumber);
    return {
      id: contact.id._serialized,
      name: contact.name || contact.pushname,
      number: contact.number,
      isMyContact: contact.isMyContact,
      isBlocked: contact.isBlocked
    };
  } catch (error) {
    logger.error('Error getting contact info:', error);
    throw error;
  }
};

// Get client state
const getClientState = async () => {
  if (!client) {
    return { state: 'NOT_INITIALIZED' };
  }

  try {
    const state = await client.getState();
    return { state, isReady };
  } catch (error) {
    return { state: 'ERROR', error: error.message, isReady };
  }
};

// Logout
const logout = async () => {
  if (!client) {
    throw new Error('WhatsApp client not initialized');
  }

  try {
    await client.logout();
    isReady = false;
    qrCodeData = null;
    logger.info('WhatsApp client logged out');
    return { success: true };
  } catch (error) {
    logger.error('Error logging out:', error);
    throw error;
  }
};

module.exports = {
  initializeWhatsApp,
  getClient,
  isClientReady,
  getQRCode,
  sendMessage,
  sendMediaMessage,
  sendMediaFromBuffer,
  getChats,
  getContactInfo,
  getClientState,
  logout
};