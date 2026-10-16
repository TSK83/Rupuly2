const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();

// ─── Google OAuth Client ─────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── ذخیره موقت OTP در حافظه (بعداً با Firebase/SQL جایگزین می‌شود) ────
const otpStore = new Map();
const OTP_EXPIRY_MS = 2 * 60 * 1000; // ۲ دقیقه

// کد بک‌دور برای توسعه — در پروداکشن حذف شود
const BACKDOOR_OTP = process.env.ADMIN_BACKDOOR_OTP || '12345';

// ─── تشخیص نوع ورودی (موبایل یا ایمیل) ─────────────────────────
function detectIdentifierType(identifier) {
  if (/^09\d{9}$/.test(identifier)) return 'mobile';
  if (/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(identifier)) return 'email';
  return null;
}

/**
 * POST /api/auth/send-otp
 * Body: { identifier: "09123456789" } یا { identifier: "user@email.com" }
 */
router.post('/send-otp', (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'شماره موبایل یا ایمیل الزامی است',
      });
    }

    const type = detectIdentifierType(identifier);

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'فرمت شماره موبایل یا ایمیل نامعتبر است',
      });
    }

    // تولید کد ۵ رقمی
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    otpStore.set(identifier, {
      code: otp,
      type,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // پاک کردن خودکار OTP منقضی شده از مموری
    setTimeout(() => {
      const stored = otpStore.get(identifier);
      if (stored && stored.code === otp) {
        otpStore.delete(identifier);
      }
    }, OTP_EXPIRY_MS);

    const label = type === 'mobile' ? '📱 SMS' : '📧 Email';
    console.log(`${label} OTP for ${identifier}: ${otp}`);

    // TODO: ارسال واقعی OTP از طریق Firebase/SMS/Email
    return res.status(200).json({
      success: true,
      message: type === 'mobile'
        ? 'کد تایید به شماره موبایل ارسال شد'
        : 'کد تایید به ایمیل ارسال شد',
      data: { type },
    });
  } catch (error) {
    console.error('❌ خطا در send-otp:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { identifier, otp }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'شماره موبایل/ایمیل و کد تایید الزامی هستند',
      });
    }

    const storedOtp = otpStore.get(identifier);
    const isBackdoor = otp === BACKDOOR_OTP;

    // بررسی بک‌دور — اگر کد بک‌دور باشد، مستقیم رد شود
    if (!isBackdoor) {
      if (!storedOtp) {
        return res.status(400).json({
          success: false,
          message: 'ابتدا درخواست کد تایید بدهید',
        });
      }

      if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ success: false, message: 'کد تایید منقضی شده است' });
      }

      if (storedOtp.code !== otp) {
        return res.status(400).json({ success: false, message: 'کد تایید اشتباه است' });
      }
    }

    const type = storedOtp?.type || detectIdentifierType(identifier);
    otpStore.delete(identifier);

    const query = type === 'mobile' ? { mobile: identifier } : { email: identifier };
    let user = await User.findOne(query);

    if (!user) {
      user = await User.create(query);
      console.log(`👤 کاربر جدید ثبت‌نام شد: ${identifier}`);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile || null,
          email: user.email || null,
          balance: user.balance,
          joinedAt: user.joinedAt,
        },
      },
    });
  } catch (error) {
    console.error('❌ خطا در verify-otp:', error.message);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
    });
  }
});

/**
 * POST /api/auth/google
 * Body: { credential }  (ID token from Google login)
 * Verify ID token → Create/find user → Issue JWT
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'توکن گوگل ارسال نشده است',
      });
    }

    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'ایمیل از حساب گوگل دریافت نشد',
      });
    }

    // ساخت یا یافتن کاربر
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
      console.log(`👤 کاربر جدید با گوگل ثبت‌نام شد: ${email}`);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'ورود با گوگل موفقیت‌آمیز',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile || null,
          email: user.email || null,
          balance: user.balance,
          joinedAt: user.joinedAt,
        },
      },
    });
  } catch (error) {
    console.error('❌ خطا در Google Auth:', error.message);
    return res.status(401).json({
      success: false,
      message: 'توکن گوگل نامعتبر است',
    });
  }
});

module.exports = router;
