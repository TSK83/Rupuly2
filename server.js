const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// ────────────────────────────── Models ──────────────────────────────
const User = require('./models/User');
const Task = require('./models/Task');
const TaskProgress = require('./models/TaskProgress');

// ────────────────────────────── Routes ──────────────────────────────
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const providerRoutes = require('./routes/providerRoutes');
const gameRoutes = require('./routes/gameRoutes');

// ────────────────────────────── App Setup ───────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ────────────────────────────── Database ─────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ اتصال به MongoDB برقرار شد'))
  .catch((err) => {
    console.error('❌ خطا در اتصال به MongoDB:', err.message);
    process.exit(1);
  });

// ────────────────────────────── Helpers ──────────────────────────────

/**
 * ساخت امضای HMAC-SHA256 از بدنه درخواست با کلید مخفی تسک
 * @param {object} body - بدنه درخواست
 * @param {string} secret - کلید webhookSecret تسک
 * @returns {string} هش hex
 */
function generateSignature(body, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
}

// ──────────────────────── API Routes ────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/games', gameRoutes);

// ──────────────────────── Webhook Route ─────────────────────────────

/**
 * POST /api/webhook/complete
 *
 * Headers:  x-signature  (HMAC-SHA256 of JSON body with task's webhookSecret)
 * Body:     { userId, taskId }
 *
 * Flow:
 *  1. Find the Task → get webhookSecret
 *  2. Verify HMAC signature
 *  3. Update TaskProgress status → "completed"
 *  4. Add task reward to User balance
 */
app.post('/api/webhook/complete', async (req, res) => {
  try {
    const { userId, taskId } = req.body;
    const signature = req.headers['x-signature'];

    // ─── Validation ──────────────────────────────────────────────
    if (!userId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'فیلدهای userId و taskId الزامی هستند',
      });
    }

    if (!signature) {
      return res.status(401).json({
        success: false,
        message: 'هدر x-signature ارسال نشده است',
      });
    }

    // ─── 1) Find Task ────────────────────────────────────────────
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'تسک مورد نظر یافت نشد',
      });
    }

    // ─── 2) Verify Signature ─────────────────────────────────────
    const expectedSignature = generateSignature(req.body, task.webhookSecret);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'امضای درخواست نامعتبر است',
      });
    }

    // ─── 3) Update TaskProgress → completed ──────────────────────
    const progress = await TaskProgress.findOneAndUpdate(
      { userId, taskId, status: 'started' },
      { status: 'completed' },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'رکورد پیشرفت تسک یافت نشد یا قبلاً تکمیل شده است',
      });
    }

    // ─── 4) Add reward to User balance ───────────────────────────
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: task.reward } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر مورد نظر یافت نشد',
      });
    }

    // ─── Success ─────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: `تسک با موفقیت تکمیل شد. پاداش ${task.reward} تومان به حساب اضافه شد.`,
      data: {
        userId: user._id,
        newBalance: user.balance,
        taskTitle: task.gameTitle,
        reward: task.reward,
      },
    });
  } catch (error) {
    console.error('❌ خطا در وبهوک:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

// ────────────────────────────── Start Server ────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 سرور روی پورت ${PORT} اجرا شد`);
  console.log('─'.repeat(40));
  console.log('📡 روت‌های فعال:');
  console.log('   POST /api/auth/send-otp');
  console.log('   POST /api/auth/verify-otp');
  console.log('   GET  /api/tasks');
  console.log('   POST /api/tasks/:id/start');
  console.log('   GET  /api/user/profile');
  console.log('   POST /api/user/withdraw');
  console.log('   GET  /api/user/transactions');
  console.log('   POST /api/webhook/complete');
  console.log('   ── Admin ──');
  console.log('   GET  /api/admin/stats');
  console.log('   GET  /api/admin/tasks');
  console.log('   POST /api/admin/tasks');
  console.log('   PUT  /api/admin/tasks/:id');
  console.log('   DEL  /api/admin/tasks/:id');
  console.log('   GET  /api/admin/users');
  console.log('   GET  /api/admin/transactions');
  console.log('   PUT  /api/admin/transactions/:id');
  console.log('─'.repeat(40));
});
