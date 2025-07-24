require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const Product = require('./models/product');
const Order = require('./models/order');

const app = express();
const PORT = 5000;

// ✅ MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Routes
app.use('/api/products', require('./routes/products')); // Supports add, get, update, delete
app.use('/api/orders', require('./routes/orders'));     // Supports place-order, aggregated

// ✅ User Schema and Auth
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ✅ Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ username, password, role });
    await newUser.save();
    res.json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// ✅ Login Route
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ username, password, role });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ✅ Invoice (Legacy PHP Redirect)
app.get('/api/invoice-link/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate('product');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const invoiceURL = `http://localhost/inventory/invoice.php?orderId=${order._id}&product=${order.product.name}&quantity=${order.quantity}&price=${order.product.price}`;
    res.json({ url: invoiceURL });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ Fallback (e.g., /generate-invoice.html refresh fix)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/generate_invoice.html'));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
