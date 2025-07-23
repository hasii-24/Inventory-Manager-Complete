const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

// Place a new order
router.post('/place-order', async (req, res) => {
  const { productId, quantity, username } = req.body;

  if (!productId || !quantity || !username) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Reduce product quantity
    product.quantity -= quantity;
    await product.save();

    // Create order
    const newOrder = new Order({
      productId,
      productName: product.name,
      quantity,
      username
    });

    await newOrder.save();

    res.status(200).json({ message: "Order placed", orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get aggregated order data for admin dashboard
router.get('/aggregated', async (req, res) => {
  try {
    const aggregated = await Order.aggregate([
      {
        $group: {
          _id: { $toLower: "$productName" },
          totalPurchased: { $sum: "$quantity" }
        }
      }
    ]);

    const allProducts = await Product.find();

    const finalResult = aggregated.map(item => {
      const matchingProduct = allProducts.find(p => p.name.toLowerCase() === item._id);
      return {
        name: item._id,
        totalPurchased: item.totalPurchased,
        image: matchingProduct ? matchingProduct.image : 'placeholder.jpg'
      };
    });

    res.json(finalResult);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: "Failed to aggregate purchased stock" });
  }
});

module.exports = router;
