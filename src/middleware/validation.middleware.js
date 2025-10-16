const { errorResponse } = require('../utils/response');

// Validate phone number format
const isValidPhoneNumber = (number) => {
  // Remove all non-numeric characters
  const cleaned = number.replace(/\D/g, '');
  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Validate send message request
const validateSendMessage = (req, res, next) => {
  const { number, message } = req.body;

  if (!number) {
    return errorResponse(res, 'Phone number is required', 400);
  }

  if (!message) {
    return errorResponse(res, 'Message is required', 400);
  }

  if (!isValidPhoneNumber(number)) {
    return errorResponse(res, 'Invalid phone number format', 400);
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return errorResponse(res, 'Message must be a non-empty string', 400);
  }

  next();
};

// Validate send media request
const validateSendMedia = (req, res, next) => {
  const { number, mediaUrl } = req.body;

  if (!number) {
    return errorResponse(res, 'Phone number is required', 400);
  }

  if (!mediaUrl) {
    return errorResponse(res, 'Media URL is required', 400);
  }

  if (!isValidPhoneNumber(number)) {
    return errorResponse(res, 'Invalid phone number format', 400);
  }

  // Basic URL validation
  try {
    new URL(mediaUrl);
  } catch (error) {
    return errorResponse(res, 'Invalid media URL format', 400);
  }

  next();
};

module.exports = {
  validateSendMessage,
  validateSendMedia
};