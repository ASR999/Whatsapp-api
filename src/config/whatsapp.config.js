module.exports = {
  // Puppeteer options
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  },

  // Session configuration
  session: {
    clientId: 'whatsapp-api-client',
  },

  // Webhook configuration (optional)
  webhook: {
    enabled: false,
    url: process.env.WEBHOOK_URL || ''
  },

  // Message options
  message: {
    readIncomingMessages: true,
    sendSeen: true
  }
};