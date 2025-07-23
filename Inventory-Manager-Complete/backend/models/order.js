

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  image: String,
  customer: String // ✅ include customer field
});

module.exports = mongoose.model('Order', orderSchema);

