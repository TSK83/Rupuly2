const mongoose = require('mongoose');

const taskProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'شناسه کاربر الزامی است'],
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'شناسه تسک الزامی است'],
    },

    status: {
      type: String,
      enum: {
        values: ['started', 'completed'],
        message: 'وضعیت باید started یا completed باشد',
      },
      default: 'started',
    },
  },
  {
    timestamps: true,
  }
);

// هر کاربر فقط یک بار می‌تواند یک تسک را شروع کند
taskProgressSchema.index({ userId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('TaskProgress', taskProgressSchema);
