const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'نام بازی الزامی است'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    gameUrl: {
      type: String,
      trim: true,
      default: null,
    },

    // وضعیت: پیش‌نویس یا تایید نهایی شده
    status: {
      type: String,
      enum: ['draft', 'confirmed'],
      default: 'draft',
    },

    // حالت زمان‌بندی تکالیف
    timeMode: {
      type: String,
      enum: {
        values: ['continuous', 'instant'],
        message: 'حالت زمان باید continuous یا instant باشد',
      },
      required: [true, 'حالت زمان‌بندی الزامی است'],
      default: 'continuous',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Game', gameSchema);
