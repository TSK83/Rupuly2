const mongoose = require('mongoose');
const crypto = require('crypto');

const taskSchema = new mongoose.Schema(
  {
    gameTitle: {
      type: String,
      required: [true, 'عنوان بازی الزامی است'],
      trim: true,
    },

    reward: {
      type: Number,
      required: [true, 'مبلغ پاداش الزامی است'],
      min: [0, 'پاداش نمی‌تواند منفی باشد'],
    },

    gameUrl: {
      type: String,
      trim: true,
      default: null,
    },

    webhookSecret: {
      type: String,
      required: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
