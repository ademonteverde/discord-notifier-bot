const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

const BIRTHDAY_FILE = path.join(__dirname, '../data/birthdays.json');

function loadBirthdays() {
  try {
    const data = fs.readFileSync(BIRTHDAY_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveBirthdays(data) {
  fs.writeFileSync(BIRTHDAY_FILE, JSON.stringify(data, null, 2));
}

async function sendBirthdayGreeting(client, channelId) {
  const birthdays = loadBirthdays();

  for (const [userId, data] of Object.entries(birthdays)) {
    const userNow = DateTime.now().setZone(data.timezone);
    const todayMonth = userNow.toFormat('MM');
    const todayDay = userNow.toFormat('dd');
    const nowTime = userNow.toFormat('HH:mm');

    if (
      todayMonth === data.month &&
      todayDay === data.day &&
      nowTime === '00:00'
    ) {
      try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) throw new Error('Channel not found');

        await channel.send(`🎉 Happy Birthday, <@${userId}>! Hope your day is full of joy and yummy food! 🎂`);
      } catch (err) {
        console.error(`❌ Failed to send birthday message to <@${userId}>:`, err.message);
      }
    }
  }
}

module.exports = { loadBirthdays, saveBirthdays, sendBirthdayGreeting };