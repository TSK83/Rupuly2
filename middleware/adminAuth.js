const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * میدلور ادمین
 * ابتدا JWT را بررسی می‌کند، سپس نقش admin را چک می‌کند
 */
async function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'توکن احراز هویت ارسال نشده است',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'دسترسی ادمین ندارید',
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'توکن نامعتبر یا منقضی شده است',
    });
  }
}

module.exports = adminAuth;
