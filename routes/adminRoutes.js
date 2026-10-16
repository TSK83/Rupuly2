const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');
const TaskProgress = require('../models/TaskProgress');
const Provider = require('../models/Provider');
const Game = require('../models/Game');
const Assignment = require('../models/Assignment');

const router = express.Router();

// ── تمام روت‌های ادمین نیاز به احراز هویت ادمین دارند ──────────
router.use(adminAuth);

// ═══════════════════════════════════════════════════════════════
//  مدیریت تسک‌ها (بازی‌ها)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/tasks
 * لیست تمام تسک‌ها (شامل webhookSecret)
 */
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * POST /api/admin/tasks
 * ساخت تسک جدید
 * Body: { gameTitle, reward }
 */
router.post('/tasks', async (req, res) => {
  try {
    const { gameTitle, reward } = req.body;

    if (!gameTitle || !reward) {
      return res.status(400).json({
        success: false,
        message: 'عنوان بازی و پاداش الزامی هستند',
      });
    }

    const task = await Task.create({ gameTitle, reward });

    return res.status(201).json({
      success: true,
      message: 'تسک جدید ساخته شد',
      data: task,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * PUT /api/admin/tasks/:id
 * ویرایش تسک
 */
router.put('/tasks/:id', async (req, res) => {
  try {
    const { gameTitle, reward } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { gameTitle, reward },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'تسک یافت نشد' });
    }

    return res.status(200).json({
      success: true,
      message: 'تسک بروزرسانی شد',
      data: task,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * DELETE /api/admin/tasks/:id
 * حذف تسک
 */
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'تسک یافت نشد' });
    }

    // حذف رکوردهای پیشرفت مرتبط
    await TaskProgress.deleteMany({ taskId: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'تسک حذف شد',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  مدیریت کاربران
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/users
 * لیست تمام کاربران
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  مدیریت تراکنش‌ها (برداشت‌ها)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/transactions
 * لیست تمام تراکنش‌ها
 */
router.get('/transactions', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const transactions = await Transaction.find(filter)
      .populate('userId', 'mobile email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * PUT /api/admin/transactions/:id
 * تغییر وضعیت تراکنش (تایید یا رد)
 * Body: { status: "completed" | "failed" }
 */
router.put('/transactions/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت باید processing، completed یا failed باشد',
      });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'تراکنش یافت نشد' });
    }

    // اگر رد شد و قبلاً تکمیل نشده بود، مبلغ را به کاربر برگردان
    if (status === 'failed' && (transaction.status === 'pending' || transaction.status === 'processing')) {
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { balance: transaction.amount },
      });
    }

    transaction.status = status;
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: `وضعیت تراکنش به "${status}" تغییر کرد`,
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  مدیریت ارائه‌دهندگان
// ═══════════════════════════════════════════════════════════════

/** GET /api/admin/providers */
router.get('/providers', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const providers = await Provider.find(filter)
      .populate('userId', 'mobile email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** PUT /api/admin/providers/:id — تایید یا رد ارائه‌دهنده */
router.put('/providers/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'وضعیت باید approved یا rejected باشد' });
    }

    const provider = await Provider.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!provider) return res.status(404).json({ success: false, message: 'ارائه‌دهنده یافت نشد' });

    // آپدیت نقش کاربر
    if (status === 'approved') {
      await User.findByIdAndUpdate(provider.userId, { role: 'provider' });
    } else {
      await User.findByIdAndUpdate(provider.userId, { role: 'user' });
    }

    console.log(`📋 ارائه‌دهنده ${provider.firstName} ${provider.lastName}: ${status}`);
    return res.status(200).json({ success: true, message: `ارائه‌دهنده ${status === 'approved' ? 'تایید' : 'رد'} شد`, data: provider });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  آمار داشبورد ادمین
// ═══════════════════════════════════════════════════════════════

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalTasks, totalTransactions, pendingWithdrawals, totalProviders, totalGames, pendingProviders] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'pending' }),
      Provider.countDocuments({ status: 'approved' }),
      Game.countDocuments({ status: 'confirmed' }),
      Provider.countDocuments({ status: 'pending' }),
    ]);

    const totalPaidOut = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTasks,
        totalTransactions,
        pendingWithdrawals,
        totalProviders,
        totalGames,
        pendingProviders,
        totalPaidOut: totalPaidOut[0]?.total || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

module.exports = router;
