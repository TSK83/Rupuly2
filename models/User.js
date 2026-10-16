const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^09\d{9}$/, 'فرمت شماره موبایل نامعتبر است'],
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'فرمت ایمیل نامعتبر است'],
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, 'موجودی نمی‌تواند منفی باشد'],
    },

    shebaNumber: {
      type: String,
      trim: true,
      default: null,
      match: [/^IR\d{24}$/, 'فرمت شماره شبا نامعتبر است'],
    },

    walletAddress: {
      type: String,
      trim: true,
      default: null,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'provider'],
      default: 'user',
    },

    // مجموع کل درآمد از ابتدا تا امروز
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // وجه در انتظار تایید ارائه‌دهنده
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
