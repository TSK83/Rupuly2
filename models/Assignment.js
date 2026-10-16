const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'عنوان تکلیف الزامی است'],
      trim: true,
    },

    // نوع تکلیف: اصلی (دنباله‌دار) / تشویقی / روزمره
    type: {
      type: String,
      enum: {
        values: ['main', 'bonus', 'daily'],
        message: 'نوع تکلیف باید main، bonus یا daily باشد',
      },
      required: true,
      default: 'main',
    },

    reward: {
      type: Number,
      required: [true, 'مبلغ پاداش الزامی است'],
      min: [0, 'پاداش نمی‌تواند منفی باشد'],
    },

    // محدودیت زمانی (به روز)
    timeLimitDays: {
      type: Number,
      required: [true, 'محدودیت زمانی الزامی است'],
      min: [1, 'حداقل ۱ روز'],
    },

    // ترتیب نمایش (برای تکالیف دنباله‌دار)
    order: {
      type: Number,
      required: true,
      default: 0,
    },

    // زمان انتظار پرداخت (برای پاداش >= ۲۰۰ هزار تومان) — ۱ تا ۳۰ روز
    paymentWaitDays: {
      type: Number,
      min: 1,
      max: 30,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ایندکس ترکیبی برای مرتب‌سازی
assignmentSchema.index({ gameId: 1, type: 1, order: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
