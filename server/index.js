const app = require('./app');
const connectDB = require('./config/db');
const { initializeWhatsApp } = require('./utils/whatsappClient');

connectDB();
initializeWhatsApp();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
