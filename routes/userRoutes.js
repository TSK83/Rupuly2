const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const TaskProgress = require('../models/TaskProgress');
const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');

const router = express.Router();

// ── تمام روت‌های این فایل نیاز به احراز هویت دارند ──────────────
router.use(authMiddleware);

/**
 * GET /api/user/profile
 * مشاهده پروفایل و موجودی کاربر
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد',
      });
    }

    // تعداد تسک‌های تکمیل‌شده
    const completedTasks = await TaskProgress.countDocuments({
      userId: req.userId,
      status: 'completed',
    });

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        mobile: user.mobile,
        email: user.email,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        pendingBalance: user.pendingBalance,
        shebaNumber: user.shebaNumber,
        walletAddress: user.walletAddress,
        joinedAt: user.joinedAt,
        role: user.role,
        completedTasks,
      },
    });
  } catch (error) {
    console.error('❌ خطا در دریافت پروفایل:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/user/withdraw
 * درخواست برداشت موجودی
 * Body: { amount, settlementMethod, destinationAddress }
 * settlementMethod: "bank_transfer" | "crypto"
 */
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, settlementMethod, destinationAddress } = req.body;

    // اعتبارسنجی ورودی‌ها
    if (!amount || !settlementMethod || !destinationAddress) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ، متد تسویه و آدرس مقصد الزامی هستند',
      });
    }

    if (amount < 10000) {
      return res.status(400).json({
        success: false,
        message: 'حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است',
      });
    }

    // بررسی موجودی کاربر
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد',
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `موجودی کافی نیست. موجودی فعلی: ${user.balance} تومان`,
      });
    }

    // کسر مبلغ از موجودی
    user.balance -= amount;
    await user.save();

    // ثبت تراکنش
    const transaction = await Transaction.create({
      userId: req.userId,
      amount,
      settlementMethod,
      destinationAddress,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'درخواست برداشت ثبت شد و در انتظار بررسی است',
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        method: transaction.settlementMethod,
        destination: transaction.destinationAddress,
        status: transaction.status,
        newBalance: user.balance,
      },
    });
  } catch (error) {
    console.error('❌ خطا در برداشت:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/user/rewards/claim
 * بررسی و آزادسازی پاداش‌های در انتظار کاربر
 */
router.post('/rewards/claim', async (req, res) => {
  try {
    const now = new Date();

    // پیدا کردن پاداش‌های در انتظار که تاریخ آزادسازی آن‌ها رسیده است
    const matureRewards = await Reward.find({
      userId: req.userId,
      status: 'pending',
      releaseDate: { $lte: now }
    });

    if (matureRewards.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'هیچ پاداش قابل آزادسازی یافت نشد',
        data: { claimedAmount: 0 }
      });
    }

    let totalClaimed = 0;
    const rewardIds = [];

    for (const reward of matureRewards) {
      totalClaimed += reward.amount;
      rewardIds.push(reward._id);
    }

    // به‌روزرسانی وضعیت پاداش‌ها
    await Reward.updateMany(
      { _id: { $in: rewardIds } },
      { $set: { status: 'released', releasedAt: now } }
    );

    // به‌روزرسانی موجودی کاربر
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: {
          balance: totalClaimed,
          pendingBalance: -totalClaimed
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${totalClaimed.toLocaleString()} تومان از پاداش‌های شما آزاد شد و به موجودی اضافه گردید`,
      data: {
        claimedAmount: totalClaimed,
        newBalance: user.balance,
        newPendingBalance: user.pendingBalance
      }
    });

  } catch (error) {
    console.error('❌ خطا در آزادسازی پاداش‌ها:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور'
    });
  }
});

/**
 * GET /api/user/transactions
 * تاریخچه تراکنش‌های کاربر
 */
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('❌ خطا در دریافت تراکنش‌ها:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

module.exports = router;
