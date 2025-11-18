const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  rating: { type: Number, default: null },
  publicReview: { type: String, required: true },
  categories: [{
    category: String,
    rating: Number
  }],
  submittedAt: { type: Date, required: true },
  guestName: { type: String, required: true },
  listingName: { type: String, required: true },
  channel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'reviews' });

module.exports = mongoose.model('Review', reviewSchema);
