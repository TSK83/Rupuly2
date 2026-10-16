const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function makeAdmin() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.log('❌ لطفاً شماره موبایل یا ایمیل را وارد کنید');
    console.log('   مثال: node make-admin.js 09135253945');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const query = identifier.includes('@')
      ? { email: identifier }
      : { mobile: identifier };

    const user = await User.findOneAndUpdate(
      query,
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log('❌ کاربر یافت نشد');
    } else {
      console.log(`✅ کاربر ${identifier} به ادمین تبدیل شد`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
}

makeAdmin();
