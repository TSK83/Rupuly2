const mongoose = require('mongoose');

const assignmentProgressSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: {
        values: ['started', 'completed', 'failed'],
        message: 'وضعیت باید started، completed یا failed باشد',
      },
      default: 'started',
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // مهلت انجام تکلیف
    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// هر کاربر فقط یک بار می‌تواند یک تکلیف را شروع کند
assignmentProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentProgress', assignmentProgressSchema);
