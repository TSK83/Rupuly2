const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'شناسه کاربر الزامی است'],
    },

    amount: {
      type: Number,
      required: [true, 'مبلغ تراکنش الزامی است'],
      min: [1, 'مبلغ باید بیشتر از صفر باشد'],
    },

    settlementMethod: {
      type: String,
      enum: {
        values: ['bank_transfer', 'crypto'],
        message: 'متد تسویه باید bank_transfer یا crypto باشد',
      },
      required: [true, 'متد تسویه الزامی است'],
    },

    destinationAddress: {
      type: String,
      required: [true, 'آدرس مقصد الزامی است'],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'وضعیت تراکنش نامعتبر است',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
