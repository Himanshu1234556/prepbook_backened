const cron = require('node-cron');
const pool = require('../config/db'); // PostgreSQL connection
const redis = require('../config/redisClient'); // Redis connection
const { sendWhatsAppMessage } = require('../helpers/otpHelper');


const TTL = 2592000; // 30 days in seconds (30 * 24 * 60 * 60)

async function checkAndSendMessages() {
    try {
        console.log('🔍 Checking for users with missing entries...');

        const result = await pool.query(`
            SELECT id, phone, COALESCE(name, phone) AS display_name
            FROM users 
            WHERE  (created_at < NOW() - INTERVAL '3 minutes' OR updated_at < NOW() - INTERVAL '3 minutes')
        `);

        if (result.rows.length === 0) {
            console.log('✅ No users with missing entries.');
            return;
        }

        for (const user of result.rows) {
            const userKey = `user:${user.id}`;
            const alreadySent = await redis.exists(userKey);

            if (!alreadySent) {
                const sent = await sendWhatsAppMessage(user.phone, "new_report", [user.display_name, "Here’s a quick video to help you get started: 🎉"]);

                if (sent) {
                    await redis.setex(userKey, TTL, 'sent'); // Store in Redis with 30-day expiry
                    console.log(`✅ Message sent to ${user.display_name} (${user.phone}). Next notification after 30 days.`);
                } else {
                    console.error(`❌ Failed to send message to ${user.display_name} (${user.phone})`);
                }
            } else {
                console.log(`⚠️ User ${user.id} (${user.display_name}) was already notified. Skipping.`);
            }
        }
    } catch (error) {
        console.error('❌ Error in checkAndSendMessages:', error.message);
    }
}

// Schedule the cron job to run every 5 minute
cron.schedule('*/3 * * * *', checkAndSendMessages);

console.log('🚀 Cron job started: Checking for incomplete users every minute.');
