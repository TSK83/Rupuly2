const express = require('express');
const authMiddleware = require('../middleware/auth');
const Provider = require('../models/Provider');
const Game = require('../models/Game');
const Assignment = require('../models/Assignment');
const AssignmentProgress = require('../models/AssignmentProgress');
const User = require('../models/User');

const router = express.Router();
router.use(authMiddleware);

// ── میدلور بررسی ارائه‌دهنده بودن ───────────────────────────────
async function requireProvider(req, res, next) {
  const provider = await Provider.findOne({ userId: req.userId, status: 'approved' });
  if (!provider) {
    return res.status(403).json({ success: false, message: 'دسترسی ارائه‌دهنده ندارید یا هنوز تایید نشده‌اید' });
  }
  req.provider = provider;
  next();
}

// ═══════════════════════════════════════════════════════════════
//  ثبت‌نام ارائه‌دهنده
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/provider/register
 * ثبت‌نام به عنوان ارائه‌دهنده (نیاز به تایید ادمین)
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, nationalId, organizationName } = req.body;

    if (!firstName || !lastName || !nationalId) {
      return res.status(400).json({ success: false, message: 'نام، نام خانوادگی و کد ملی الزامی هستند' });
    }

    const existing = await Provider.findOne({ userId: req.userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'شما قبلاً درخواست ارائه‌دهنده ثبت کرده‌اید', data: { status: existing.status } });
    }

    const provider = await Provider.create({
      userId: req.userId,
      firstName,
      lastName,
      nationalId,
      organizationName: organizationName || null,
    });

    // نقش کاربر بعد از تایید ادمین تغییر می‌کند (در adminRoutes)

    console.log(`📋 درخواست ارائه‌دهنده جدید: ${firstName} ${lastName} (${nationalId})`);

    return res.status(201).json({
      success: true,
      message: 'درخواست شما ثبت شد و در انتظار تایید ادمین است',
      data: provider,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'این کد ملی قبلاً ثبت شده است' });
    }
    console.error('❌ خطا در ثبت ارائه‌دهنده:', error.message);
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/**
 * GET /api/provider/status
 * بررسی وضعیت درخواست ارائه‌دهنده
 */
router.get('/status', async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.userId });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'درخواست ارائه‌دهنده یافت نشد' });
    }
    return res.status(200).json({ success: true, data: { status: provider.status } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  پروفایل ارائه‌دهنده
// ═══════════════════════════════════════════════════════════════

/** GET /api/provider/profile */
router.get('/profile', requireProvider, async (req, res) => {
  try {
    const gamesCount = await Game.countDocuments({ providerId: req.provider._id });
    return res.status(200).json({
      success: true,
      data: {
        ...req.provider.toObject(),
        gamesCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** PUT /api/provider/profile */
router.put('/profile', requireProvider, async (req, res) => {
  try {
    const { firstName, lastName, organizationName } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (organizationName !== undefined) updates.organizationName = organizationName;

    const provider = await Provider.findByIdAndUpdate(req.provider._id, updates, { new: true });
    return res.status(200).json({ success: true, message: 'پروفایل بروزرسانی شد', data: provider });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  مدیریت بازی‌ها
// ═══════════════════════════════════════════════════════════════

/** GET /api/provider/games */
router.get('/games', requireProvider, async (req, res) => {
  try {
    const games = await Game.find({ providerId: req.provider._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: games.length, data: games });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** POST /api/provider/games */
router.post('/games', requireProvider, async (req, res) => {
  try {
    const { title, description, gameUrl, timeMode } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'نام بازی الزامی است' });
    }

    const game = await Game.create({
      providerId: req.provider._id,
      title,
      description: description || '',
      gameUrl: gameUrl || null,
      timeMode: timeMode || 'continuous',
    });

    return res.status(201).json({ success: true, message: 'بازی ساخته شد', data: game });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** PUT /api/provider/games/:id — فقط draft */
router.put('/games/:id', requireProvider, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, providerId: req.provider._id });

    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });
    if (game.status === 'confirmed') {
      return res.status(403).json({ success: false, message: 'بازی تایید شده قابل ویرایش نیست. ابتدا حذف و دوباره بسازید' });
    }

    const { title, description, gameUrl, timeMode } = req.body;
    if (title) game.title = title;
    if (description !== undefined) game.description = description;
    if (gameUrl !== undefined) game.gameUrl = gameUrl;
    if (timeMode) game.timeMode = timeMode;
    await game.save();

    return res.status(200).json({ success: true, message: 'بازی بروزرسانی شد', data: game });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** POST /api/provider/games/:id/confirm — تایید نهایی */
router.post('/games/:id/confirm', requireProvider, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, providerId: req.provider._id });
    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });
    if (game.status === 'confirmed') {
      return res.status(409).json({ success: false, message: 'بازی قبلاً تایید شده است' });
    }

    // بررسی وجود حداقل یک تکلیف
    const assignmentsCount = await Assignment.countDocuments({ gameId: game._id });
    if (assignmentsCount === 0) {
      return res.status(400).json({ success: false, message: 'بازی باید حداقل یک تکلیف داشته باشد' });
    }

    // بررسی حالت آنی: هر تکلیف باید حداقل ۱ روز بیشتر از قبلی باشد
    if (game.timeMode === 'instant') {
      const mainAssignments = await Assignment.find({ gameId: game._id, type: 'main' }).sort({ order: 1 });
      for (let i = 1; i < mainAssignments.length; i++) {
        if (mainAssignments[i].timeLimitDays <= mainAssignments[i - 1].timeLimitDays) {
          return res.status(400).json({
            success: false,
            message: `در حالت آنی، زمان تکلیف "${mainAssignments[i].title}" باید بیشتر از تکلیف قبلی باشد`,
          });
        }
      }
    }

    game.status = 'confirmed';
    await game.save();

    console.log(`✅ بازی "${game.title}" توسط ارائه‌دهنده تایید نهایی شد`);
    return res.status(200).json({ success: true, message: 'بازی تایید نهایی شد و برای کاربران نمایش داده می‌شود', data: game });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** DELETE /api/provider/games/:id */
router.delete('/games/:id', requireProvider, async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({ _id: req.params.id, providerId: req.provider._id });
    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });

    // حذف تکالیف مرتبط
    await Assignment.deleteMany({ gameId: req.params.id });
    await AssignmentProgress.deleteMany({ gameId: req.params.id });

    return res.status(200).json({ success: true, message: 'بازی و تکالیف مرتبط حذف شدند' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  مدیریت تکالیف
// ═══════════════════════════════════════════════════════════════

/** GET /api/provider/games/:gameId/assignments */
router.get('/games/:gameId/assignments', requireProvider, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.gameId, providerId: req.provider._id });
    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });

    const assignments = await Assignment.find({ gameId: game._id }).sort({ type: 1, order: 1 });
    return res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** POST /api/provider/games/:gameId/assignments */
router.post('/games/:gameId/assignments', requireProvider, async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.gameId, providerId: req.provider._id });
    if (!game) return res.status(404).json({ success: false, message: 'بازی یافت نشد' });
    if (game.status === 'confirmed') {
      return res.status(403).json({ success: false, message: 'بازی تایید شده — امکان اضافه کردن تکلیف نیست' });
    }

    const { title, type, reward, timeLimitDays, order, paymentWaitDays } = req.body;

    if (!title || !reward || !timeLimitDays) {
      return res.status(400).json({ success: false, message: 'عنوان، پاداش و محدودیت زمانی الزامی هستند' });
    }

    // اگر پاداش >= ۲۰۰,۰۰۰ و paymentWaitDays مشخص نشده
    if (reward >= 200000 && !paymentWaitDays) {
      return res.status(400).json({ success: false, message: 'برای پاداش بالای ۲۰۰ هزار تومان، زمان انتظار پرداخت (۱ تا ۳۰ روز) الزامی است' });
    }

    // تعیین ترتیب خودکار اگر مشخص نشده
    let assignmentOrder = order;
    if (assignmentOrder === undefined || assignmentOrder === null) {
      const lastAssignment = await Assignment.findOne({ gameId: game._id, type: type || 'main' }).sort({ order: -1 });
      assignmentOrder = lastAssignment ? lastAssignment.order + 1 : 0;
    }

    const assignment = await Assignment.create({
      gameId: game._id,
      title,
      type: type || 'main',
      reward,
      timeLimitDays,
      order: assignmentOrder,
      paymentWaitDays: reward >= 200000 ? paymentWaitDays : null,
    });

    return res.status(201).json({ success: true, message: 'تکلیف اضافه شد', data: assignment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** PUT /api/provider/assignments/:id */
router.put('/assignments/:id', requireProvider, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'تکلیف یافت نشد' });

    // بررسی مالکیت
    const game = await Game.findOne({ _id: assignment.gameId, providerId: req.provider._id });
    if (!game) return res.status(403).json({ success: false, message: 'دسترسی ندارید' });
    if (game.status === 'confirmed') {
      return res.status(403).json({ success: false, message: 'بازی تایید شده — تکلیف قابل ویرایش نیست' });
    }

    const { title, type, reward, timeLimitDays, order, paymentWaitDays } = req.body;
    if (title) assignment.title = title;
    if (type) assignment.type = type;
    if (reward !== undefined) assignment.reward = reward;
    if (timeLimitDays !== undefined) assignment.timeLimitDays = timeLimitDays;
    if (order !== undefined) assignment.order = order;
    if (paymentWaitDays !== undefined) assignment.paymentWaitDays = paymentWaitDays;

    await assignment.save();
    return res.status(200).json({ success: true, message: 'تکلیف بروزرسانی شد', data: assignment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

/** DELETE /api/provider/assignments/:id */
router.delete('/assignments/:id', requireProvider, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'تکلیف یافت نشد' });

    const game = await Game.findOne({ _id: assignment.gameId, providerId: req.provider._id });
    if (!game) return res.status(403).json({ success: false, message: 'دسترسی ندارید' });

    await Assignment.findByIdAndDelete(req.params.id);
    await AssignmentProgress.deleteMany({ assignmentId: req.params.id });

    return res.status(200).json({ success: true, message: 'تکلیف حذف شد' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
});

module.exports = router;
