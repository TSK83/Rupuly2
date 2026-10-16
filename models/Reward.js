const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },

    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, 'مبلغ باید بیشتر از صفر باشد'],
    },

    // آنی (زیر ۲۰۰ هزار) / در انتظار / آزاد شده
    status: {
      type: String,
      enum: ['instant', 'pending', 'released'],
      required: true,
    },

    // تاریخ آزاد شدن وجه (فقط برای pending)
    releaseDate: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index({ userId: 1, status: 1 });
rewardSchema.index({ status: 1, releaseDate: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
