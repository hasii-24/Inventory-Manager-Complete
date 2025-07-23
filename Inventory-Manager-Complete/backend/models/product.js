const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number,
    image: String // filename of the image
});

module.exports = mongoose.model('Product', productSchema);
