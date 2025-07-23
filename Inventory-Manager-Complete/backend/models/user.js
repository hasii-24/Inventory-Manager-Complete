// Mongoose user schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String // "user" or "admin"
});

module.exports = mongoose.model('User', userSchema);
