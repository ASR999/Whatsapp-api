require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api/qr to get QR code`);
  console.log(`API Documentation: http://localhost:${PORT}/api/status`);
});