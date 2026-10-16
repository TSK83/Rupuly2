const express = require('express');
const authMiddleware = require('../middleware/auth');
const Task = require('../models/Task');
const TaskProgress = require('../models/TaskProgress');

const router = express.Router();

/**
 * GET /api/tasks
 * لیست تمام تسک‌های فعال (عمومی — بدون نیاز به توکن)
 * webhookSecret از خروجی حذف می‌شود
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().select('-webhookSecret').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('❌ خطا در دریافت لیست تسک‌ها:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/tasks/:id/start
 * شروع یک تسک توسط کاربر (نیاز به توکن)
 */
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.userId;

    // بررسی وجود تسک
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'تسک مورد نظر یافت نشد',
      });
    }

    // بررسی اینکه قبلاً شروع نکرده باشد
    const existing = await TaskProgress.findOne({ userId, taskId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'شما قبلاً این تسک را شروع کرده‌اید',
        data: { status: existing.status },
      });
    }

    // ساخت رکورد پیشرفت
    const progress = await TaskProgress.create({
      userId,
      taskId,
      status: 'started',
    });

    return res.status(201).json({
      success: true,
      message: `تسک "${task.gameTitle}" شروع شد`,
      data: {
        progressId: progress._id,
        taskTitle: task.gameTitle,
        reward: task.reward,
        status: progress.status,
      },
    });
  } catch (error) {
    console.error('❌ خطا در شروع تسک:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/tasks/:id/complete
 * تکمیل تسک توسط کاربر (برای بازی‌های داخلی/دمو)
 */
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.userId;

    // بررسی وجود تسک
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'تسک یافت نشد',
      });
    }

    // بررسی اینکه تسک شروع شده باشد
    const progress = await TaskProgress.findOne({ userId, taskId });
    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'ابتدا باید تسک را شروع کنید',
      });
    }

    if (progress.status === 'completed') {
      return res.status(409).json({
        success: false,
        message: 'این تسک قبلاً تکمیل شده است',
      });
    }

    // تکمیل تسک
    progress.status = 'completed';
    progress.completedAt = new Date();
    await progress.save();

    // اضافه کردن پاداش به موجودی کاربر
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: task.reward },
    });

    console.log(`🎮 تسک "${task.gameTitle}" توسط کاربر ${userId} تکمیل شد — پاداش: ${task.reward} تومان`);

    return res.status(200).json({
      success: true,
      message: `تبریک! ${task.reward.toLocaleString()} تومان به حسابت اضافه شد`,
      data: {
        reward: task.reward,
        taskTitle: task.gameTitle,
      },
    });
  } catch (error) {
    console.error('❌ خطا در تکمیل تسک:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

module.exports = router;
