const { DateTime } = require('luxon');
const { loadBirthdays, saveBirthdays } = require('../utils/birthdayUtils.js');
const TIMEZONE_MAP = require('../data/timezones.json');

const birthdays = loadBirthdays();

// Helper to safely delete messages
const safeDelete = async msg => {
  if (msg?.deletable) await msg.delete().catch(() => { });
};

// /mybirthday command
async function handleMyBirthdayCommand(message) {
  if (message.content !== '/mybirthday') return;

  const userId = message.author.id;
  const userData = birthdays[userId];

  if (!userData) {
    return message.channel.send(
      `❌ <@${userId}>, I don’t have your birthday saved. Please use \`/birthday\` to enter it.`
    );
  }

  const now = DateTime.now().setZone(userData.timezone);
  let birthdayThisYear = DateTime.fromObject(
    {
      year: now.year,
      month: parseInt(userData.month),
      day: parseInt(userData.day),
      hour: 0,
      minute: 0,
      second: 0
    },
    { zone: userData.timezone }
  );

  if (birthdayThisYear < now) birthdayThisYear = birthdayThisYear.plus({ years: 1 });

  const { days = 0, hours = 0, minutes = 0 } = birthdayThisYear.diff(now, ['days', 'hours', 'minutes']).toObject();
  const unix = Math.floor(birthdayThisYear.toSeconds());

  const birthdayMsg = await message.channel.send(
    `🎂 <@${userId}>, your birthday is **${userData.display}** (in \`MM/DD\` format) and your timezone is **${userData.timezone}**.\n\n🎉 Your birthday is <t:${unix}:R> — that's \`${Math.floor(days)}d ${Math.floor(hours)}h ${Math.floor(minutes)}m\` away!`
  );

  const promptMsg = await message.channel.send(
    `🗑️ Do you want me to delete this message? Reply with \`yes\` or \`no\` within **60 seconds**.`
  );

  const filter = m => m.author.id === userId;

  try {
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const reply = collected.first();
    const response = reply.content.toLowerCase().trim();

    const deleteTriggers = ['yes', 'y', '✅'];
    const keepTriggers = ['no', 'n'];

    if (deleteTriggers.includes(response)) {
      await Promise.all([safeDelete(birthdayMsg), safeDelete(promptMsg), safeDelete(reply), safeDelete(message)]);
    } else if (keepTriggers.includes(response)) {
      await promptMsg.edit('❎ Got it! I’ll keep the message up.');
      await safeDelete(reply);
    } else {
      await Promise.all([safeDelete(birthdayMsg), safeDelete(promptMsg), safeDelete(reply), safeDelete(message)]);
    }
  } catch {
    await safeDelete(birthdayMsg);
    await promptMsg.edit('⏰ No response. I deleted the message to keep chat clean.');
  }
}

// /birthday command
async function handleBirthdayCommand(message) {
  if (message.content !== '/birthday') return;

  const userId = message.author.id;
  const filter = m => m.author.id === userId;

  try {
    await safeDelete(message);

    const prompt = await message.channel.send(
      '📅 Please enter your **birthday and city/region** in this format: `MM/DD, CityName`\nExample: `04/20, Manila`\n\n_You can use a major city in the same timezone if you want more privacy._\n_(Don’t worry, I’ll auto-delete your response!)_'
    );


    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const response = collected.first();

    await Promise.all([safeDelete(response), safeDelete(prompt)]);

    const [datePart, cityInput] = response.content.split(',').map(s => s.trim());

    if (!datePart || !cityInput) {
      return message.channel.send('❌ Please enter both a date and city in the format: `MM/DD, CityName`.');
    }

    const [month, day] = datePart.split('/').map(Number);
    const cityKey = cityInput.toLowerCase().replace(/\s+/g, '');

    const isValidDate = (m, d) => DateTime.fromObject({ month: m, day: d }).isValid;

    if (isNaN(month) || isNaN(day) || !isValidDate(month, day) || !TIMEZONE_MAP[cityKey]) {
      return message.channel.send(
        '❌ Invalid input. Please use the format `MM/DD, CityName` and ensure the city is supported.'
      );
    }

    birthdays[userId] = {
      month,
      day,
      timezone: TIMEZONE_MAP[cityKey],
      display: `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
    };

    saveBirthdays(birthdays);

    return message.channel.send(
      `✅ <@${userId}>, I’ve saved your birthday and timezone.`
    );
  } catch {
    return message.channel.send(
      `⌛ <@${message.author.id}>, you didn’t respond in time. Please try \`/birthday\` again when you're ready.`
    );
  }
}

// /birthdaylist command
async function handleBirthdayListCommand(message, client) {
  if (message.content !== '/birthdaylist') return; // ✅ Prevents auto-trigger

  const logChannel = await client.channels.fetch(process.env.DISCORD_LOG_CHANNEL_ID);
  if (!logChannel) return message.reply('❌ Could not find the log channel.');

  const allBirthdays = loadBirthdays();
  const entries = Object.entries(allBirthdays);

  if (entries.length === 0) {
    return logChannel.send('📭 No birthdays have been saved yet.');
  }

  const pages = [];
  for (let i = 0; i < entries.length; i += 30) {
    const chunk = entries.slice(i, i + 30)
      .map(([userId, { display, timezone }]) => `• <@${userId}> — \`${display}\` (${timezone})`)
      .join('\n');
    pages.push(chunk);
  }

  for (const [i, page] of pages.entries()) {
    await logChannel.send({
      content: `📅 **Birthday List** ${pages.length > 1 ? `(Page ${i + 1})` : ''}`,
      embeds: [{
        title: 'Saved Birthdays',
        description: page,
        color: 0xFFB6C1
      }]
    });
  }

  await logChannel.send(`✅ <@${message.author.id}> posted the birthday list here.`);
}

module.exports = {
  handleBirthdayCommand,
  handleMyBirthdayCommand,
  handleBirthdayListCommand
};
