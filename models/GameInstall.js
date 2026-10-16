const mongoose = require('mongoose');

// ثبت نصب بازی توسط کاربر
const gameInstallSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },

    installedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

gameInstallSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('GameInstall', gameInstallSchema);
