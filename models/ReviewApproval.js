const mongoose = require('mongoose');

const reviewApprovalSchema = new mongoose.Schema(
  {
    reviewId: {
      type: Number,
      required: true,
      unique: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReviewApproval', reviewApprovalSchema);

