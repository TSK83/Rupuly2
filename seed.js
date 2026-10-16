const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const TaskProgress = require('./models/TaskProgress');

async function seed() {
  try {
    // ─── اتصال به دیتابیس ─────────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ اتصال به MongoDB برقرار شد');

    // ─── پاک کردن کل دیتابیس برای تست تمیز ──────────────────
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  دیتابیس پاک شد');

    // ─── ساخت User تستی ──────────────────────────────────────
    const user = await User.create({
      mobile: '09123456789',
      balance: 0,
    });
    console.log('👤 کاربر تستی ساخته شد');

    // ─── ساخت Task تستی ──────────────────────────────────────
    const task = await Task.create({
      gameTitle: 'تست روپولی',
      reward: 50000,
    });
    console.log('🎮 تسک تستی ساخته شد');

    // ─── ساخت TaskProgress ───────────────────────────────────
    await TaskProgress.create({
      userId: user._id,
      taskId: task._id,
      status: 'started',
    });
    console.log('📋 رکورد پیشرفت تسک ساخته شد');

    // ─── چاپ اطلاعات مهم ─────────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('  📌 اطلاعات تستی برای وبهوک');
    console.log('══════════════════════════════════════════════');
    console.log(`  userId:        ${user._id}`);
    console.log(`  taskId:        ${task._id}`);
    console.log(`  webhookSecret: ${task.webhookSecret}`);
    console.log('══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ اتمام seed و قطع اتصال');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
}

seed();
