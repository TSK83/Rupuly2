const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: [true, 'نام الزامی است'],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, 'نام خانوادگی الزامی است'],
      trim: true,
    },

    nationalId: {
      type: String,
      required: [true, 'کد ملی الزامی است'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'],
    },

    organizationName: {
      type: String,
      trim: true,
      default: null,
    },

    // وضعیت تایید توسط ادمین
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Provider', providerSchema);
