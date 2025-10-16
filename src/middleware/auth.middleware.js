const { errorResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return errorResponse(res, 'API key is required', 401);
  }

  if (apiKey !== process.env.API_KEY) {
    return errorResponse(res, 'Invalid API key', 403);
  }

  next();
};

module.exports = authMiddleware;