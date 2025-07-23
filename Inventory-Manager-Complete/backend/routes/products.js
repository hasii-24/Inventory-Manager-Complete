const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST: Add new product
router.post('/add', async (req, res) => {
  const { name, quantity, price, image } = req.body;
  try {
    const newProduct = new Product({ name, quantity, price, image });
    await newProduct.save();
    res.json({ message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT: Update product by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE: Remove product by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
