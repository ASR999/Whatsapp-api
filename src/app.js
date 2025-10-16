const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const messageRoutes = require('./routes/message.routes');
const { initializeWhatsApp } = require('./services/whatsapp.service');

const app = express();

// Tell Express to trust the first proxy (Render adds one)
app.set('trust proxy', 1);
// Now rate-limit will work properly
// const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 1*60*1000, max: 30 }));

// Security middleware
app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// Initialize WhatsApp client
initializeWhatsApp();

// Routes
app.use('/api', messageRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'WhatsApp API is running',
    endpoints: {
      qr: '/api/qr',
      status: '/api/status',
      sendMessage: '/api/send-message',
      sendMedia: '/api/send-media',
      chats: '/api/chats',
      contact: '/api/contact/:number',
      logout: '/api/logout'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

module.exports = app;