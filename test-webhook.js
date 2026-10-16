const crypto = require('crypto');

// ─── دیتای تستی ─────────────────────────────────────────────────
const userId = '6a90fa0b0d6d3fca12effca5';
const taskId = '6a90fa0b0d6d3fca12effca6';
const secret = 'ef03c091117ffd6c6c46b6596d95610afefd5b5811412aaf78d363ac11cb2a16';

// ─── ساخت بادی و امضا ───────────────────────────────────────────
const body = { userId, taskId };

const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(body))
  .digest('hex');

console.log('📦 Body:', JSON.stringify(body));
console.log('🔑 Signature:', signature);
console.log('─'.repeat(50));

// ─── ارسال درخواست به سرور ───────────────────────────────────────
async function testWebhook() {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/webhook/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('📡 Status:', response.status);
    console.log('📨 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWebhook();
