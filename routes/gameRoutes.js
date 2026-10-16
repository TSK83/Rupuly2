const express = require('express');
const authMiddleware = require('../middleware/auth');
const Game = require('../models/Game');
const Assignment = require('../models/Assignment');
const AssignmentProgress = require('../models/AssignmentProgress');
const GameInstall = require('../models/GameInstall');
const Reward = require('../models/Reward');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/games
 * لیست بازی‌های تایید شده (عمومی)
 */
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ status: 'confirmed' })
      .populate('providerId', 'firstName lastName organizationName')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: games.length, data: games });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * GET /api/games/rewards/me
 * لیست پاداش‌های کاربر
 * ⚠️ باید قبل از /:id تعریف شود تا Express اشتباه match نکند
 */
router.get('/rewards/me', authMiddleware, async (req, res) => {
  try {
    const rewards = await Reward.find({ userId: req.userId })
      .populate('assignmentId', 'title')
      .populate('gameId', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: rewards.length, data: rewards });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * POST /api/games/assignments/:id/complete
 * تکمیل تکلیف — دریافت پاداش
 * ⚠️ باید قبل از /:id تعریف شود
 */
router.post('/assignments/:id/complete', authMiddleware, async (req, res) => {
  try {
    const progress = await AssignmentProgress.findOne({
      assignmentId: req.params.id,
      userId: req.userId,
    });

    if (!progress) {
      return res.status(400).json({ success: false, message: 'تکلیف شروع نشده است' });
    }

    if (progress.status === 'completed') {
      return res.status(409).json({ success: false, message: 'تکلیف قبلاً تکمیل شده' });
    }

    // بررسی انقضا
    if (new Date() > progress.deadline) {
      progress.status = 'failed';
      await progress.save();
      return res.status(400).json({ success: false, message: 'مهلت انجام تکلیف تمام شده است' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'تکلیف یافت نشد' });

    const game = await Game.findById(assignment.gameId);

    // تکمیل تکلیف
    progress.status = 'completed';
    progress.completedAt = new Date();
    await progress.save();

    // محاسبه پاداش
    const isInstant = assignment.reward < 200000;
    const rewardStatus = isInstant ? 'instant' : 'pending';
    let releaseDate = null;

    if (!isInstant && assignment.paymentWaitDays) {
      releaseDate = new Date(Date.now() + assignment.paymentWaitDays * 24 * 60 * 60 * 1000);
    }

    // ثبت پاداش
    await Reward.create({
      userId: req.userId,
      assignmentId: assignment._id,
      gameId: assignment.gameId,
      amount: assignment.reward,
      status: rewardStatus,
      releaseDate,
    });

    // اضافه کردن به موجودی
    const updateQuery = { $inc: { totalEarnings: assignment.reward } };
    if (isInstant) {
      updateQuery.$inc.balance = assignment.reward;
    } else {
      updateQuery.$inc.pendingBalance = assignment.reward;
    }
    await User.findByIdAndUpdate(req.userId, updateQuery);

    // در حالت پیوسته، اگر زمان اضافه آورده، به تکلیف بعدی اضافه شود و شروع شود
    if (game.timeMode === 'continuous' && assignment.type === 'main') {
      const nextAssignment = await Assignment.findOne({
        gameId: assignment.gameId,
        type: 'main',
        order: assignment.order + 1,
      });

      if (nextAssignment) {
        // زمان اضافه = deadline - completedAt
        const bonusTime = progress.deadline.getTime() - progress.completedAt.getTime();
        const bonusMs = Math.max(0, bonusTime);

        const nextDeadline = new Date(
          Date.now() + nextAssignment.timeLimitDays * 24 * 60 * 60 * 1000 + bonusMs
        );

        await AssignmentProgress.create({
          userId: req.userId,
          assignmentId: nextAssignment._id,
          gameId: assignment.gameId,
          status: 'started',
          startedAt: new Date(),
          deadline: nextDeadline,
        });
      }
    }

    const statusLabel = isInstant ? 'آنی — به حسابت اضافه شد' : `در انتظار — آزاد می‌شود در ${releaseDate?.toLocaleDateString('fa-IR')}`;
    console.log(`🎮 تکلیف "${assignment.title}" تکمیل شد — پاداش: ${assignment.reward} (${statusLabel})`);

    return res.status(200).json({
      success: true,
      message: isInstant
        ? `${assignment.reward.toLocaleString()} تومان به حسابت اضافه شد`
        : `${assignment.reward.toLocaleString()} تومان در انتظار تایید (${assignment.paymentWaitDays} روز)`,
      data: {
        reward: assignment.reward,
        rewardStatus,
        releaseDate,
      },
    });
  } catch (error) {
    console.error('❌ خطا در تکمیل تکلیف:', error.message);
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * GET /api/games/:id
 * جزئیات بازی + تکالیف (نیاز به لاگین)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, status: 'confirmed' })
      .populate('providerId', 'firstName lastName organizationName');

    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });

    // تکالیف بازی
    const assignments = await Assignment.find({ gameId: game._id }).sort({ type: 1, order: 1 });

    // وضعیت نصب
    const install = await GameInstall.findOne({ userId: req.userId, gameId: game._id });

    // وضعیت پیشرفت کاربر
    const progressList = await AssignmentProgress.find({ userId: req.userId, gameId: game._id });
    const progressMap = {};
    progressList.forEach(p => { progressMap[p.assignmentId.toString()] = p; });

    // ترکیب اطلاعات
    const assignmentsWithProgress = assignments.map(a => {
      const progress = progressMap[a._id.toString()];
      return {
        ...a.toObject(),
        userStatus: progress ? progress.status : 'locked',
        deadline: progress ? progress.deadline : null,
        startedAt: progress ? progress.startedAt : null,
        completedAt: progress ? progress.completedAt : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        game: game.toObject(),
        installed: !!install,
        installedAt: install ? install.installedAt : null,
        assignments: assignmentsWithProgress,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * POST /api/games/:id/install
 * ثبت نصب بازی — شروع تایمرها
 */
router.post('/:id/install', authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, status: 'confirmed' });
    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });

    // بررسی نصب قبلی
    const existing = await GameInstall.findOne({ userId: req.userId, gameId: game._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'بازی قبلاً نصب شده' });
    }

    // ثبت نصب
    await GameInstall.create({ userId: req.userId, gameId: game._id });

    // شروع اولین تکلیف اصلی
    const firstMainAssignment = await Assignment.findOne({ gameId: game._id, type: 'main' }).sort({ order: 1 });

    if (firstMainAssignment) {
      const now = new Date();
      const deadline = new Date(now.getTime() + firstMainAssignment.timeLimitDays * 24 * 60 * 60 * 1000);

      await AssignmentProgress.create({
        userId: req.userId,
        assignmentId: firstMainAssignment._id,
        gameId: game._id,
        status: 'started',
        startedAt: now,
        deadline,
      });

      // در حالت آنی، تمام تکالیف اصلی همزمان شروع می‌شوند
      if (game.timeMode === 'instant') {
        const allMainAssignments = await Assignment.find({ gameId: game._id, type: 'main' }).sort({ order: 1 });
        for (let i = 1; i < allMainAssignments.length; i++) {
          const aDeadline = new Date(now.getTime() + allMainAssignments[i].timeLimitDays * 24 * 60 * 60 * 1000);
          await AssignmentProgress.create({
            userId: req.userId,
            assignmentId: allMainAssignments[i]._id,
            gameId: game._id,
            status: 'started',
            startedAt: now,
            deadline: aDeadline,
          });
        }
      }
    }

    // شروع تکالیف تشویقی و روزمره هم
    const otherAssignments = await Assignment.find({ gameId: game._id, type: { $in: ['bonus', 'daily'] } }).sort({ order: 1 });
    const now = new Date();
    for (const a of otherAssignments) {
      const deadline = new Date(now.getTime() + a.timeLimitDays * 24 * 60 * 60 * 1000);
      await AssignmentProgress.create({
        userId: req.userId,
        assignmentId: a._id,
        gameId: game._id,
        status: 'started',
        startedAt: now,
        deadline,
      });
    }

    console.log(`📲 کاربر ${req.userId} بازی "${game.title}" را نصب کرد — تایمرها شروع شد`);

    return res.status(201).json({
      success: true,
      message: 'بازی نصب شد و تکالیف شروع شدند',
    });
  } catch (error) {
    console.error('❌ خطا در نصب بازی:', error.message);
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

module.exports = router;
