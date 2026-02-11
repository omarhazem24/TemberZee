const express = require('express');
const dotenv = require('dotenv');
// Load env vars before importing routes that might use them
dotenv.config();

const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const slideRoutes = require('./routes/slideRoutes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/coupons', couponRoutes);

// Make uploads folder static
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
