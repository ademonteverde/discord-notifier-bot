// birthdayHandler.js
const { DateTime } = require('luxon');
const { loadBirthdays, saveBirthdays } = require('../utils/birthday.js');
const TIMEZONE_MAP = require('../data/timezones.json');

const birthdays = loadBirthdays();

async function handleMyBirthdayCommand(message) {
  if (message.content !== '/mybirthday') return;

  const userData = birthdays[message.author.id];

  if (!userData) {
    return await message.channel.send(
      `❌ <@${message.author.id}>, I don’t have your birthday saved. Please use \`/birthday\` to enter it.`
    );
  }

  const now = DateTime.now().setZone(userData.timezone);
  let birthdayThisYear = DateTime.fromObject(
    {
      month: parseInt(userData.month),
      day: parseInt(userData.day),
      hour: 0,
      minute: 0,
      second: 0,
      year: now.year
    },
    { zone: userData.timezone }
  );

  if (birthdayThisYear < now) {
    birthdayThisYear = birthdayThisYear.plus({ years: 1 });
  }

  const diff = birthdayThisYear.diff(now, ['days', 'hours', 'minutes']).toObject();
  const unix = Math.floor(birthdayThisYear.toSeconds());
  const countdownText = `🎉 Your birthday is <t:${unix}:R> — that's \`${Math.floor(diff.days)}d ${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m\` away!`;

  const birthdayMsg = await message.channel.send(
    `🎂 <@${message.author.id}>, your birthday is **${userData.display}** (in \`MM/DD\` format) and your timezone is **${userData.timezone}**.\n\n${countdownText}`
  );

  const promptMsg = await message.channel.send(
    `🗑️ Do you want me to delete this message? Reply with \`yes\` or \`no\` within **60 seconds**.`
  );

  const filter = m => m.author.id === message.author.id;

  try {
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000,
      errors: ['time']
    });

    const userReply = collected.first();
    const responseText = userReply.content.toLowerCase().trim();

    const deleteTriggers = ["yes", "y", "✅"];
    const keepTriggers = ["no", "n"];

    if (deleteTriggers.includes(responseText)) {
      await birthdayMsg.delete().catch(() => {});
      await promptMsg.delete().catch(() => {});
      await userReply.delete().catch(() => {});
      if (message.deletable) await message.delete().catch(() => {});
    } else if (keepTriggers.includes(responseText)) {
      await promptMsg.edit('❎ Got it! I’ll keep the message up.');
      await userReply.delete().catch(() => {});
    } else {
      await birthdayMsg.delete().catch(() => {});
      await promptMsg.delete().catch(() => {});
      await userReply.delete().catch(() => {});
      if (message.deletable) await message.delete().catch(() => {});
    }
  } catch {
    await birthdayMsg.delete().catch(() => {});
    await promptMsg.edit('⏰ No response. I deleted the message to keep chat clean.');
  }
}

async function handleBirthdayCommand(message) {
  if (message.content !== '/birthday') return;

  const filter = m => m.author.id === message.author.id;

  try {
    if (message.deletable) await message.delete();

    const prompt = await message.channel.send(
      '📅 Please enter your **birthday and city/region** in this format: `MM/DD, CityName`\nExample: `04/20, Manila`\n_You can use a major city in the same timezone if you want more privacy._\n_(Don’t worry, I’ll auto-delete your response!)_'
    );

    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
      errors: ['time']
    });

    const response = collected.first();
    if (response.deletable) await response.delete();
    if (prompt.deletable) await prompt.delete();

    const [datePart, cityInput] = response.content.split(',').map(s => s.trim());
    const [month, day] = datePart.split('/').map(n => parseInt(n));
    const cityName = cityInput.toLowerCase().replace(/\s+/g, '');

    if (
      !month || !day ||
      isNaN(month) || isNaN(day) ||
      month < 1 || month > 12 || day < 1 || day > 31 ||
      !TIMEZONE_MAP[cityName]
    ) {
      return await message.channel.send(
        `❌ Invalid input. Please use the format \`MM/DD, CityName\` and ensure the city is supported.`
      );
    }

    birthdays[message.author.id] = {
      month,
      day,
      timezone: TIMEZONE_MAP[cityName],
      display: `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
    };
    saveBirthdays(birthdays);

    return await message.channel.send(
      `✅ <@${message.author.id}>, I’ve saved your birthday as \`${month}/${day}\` in the timezone \`${TIMEZONE_MAP[cityName]}\`.`
    );

  } catch {
    return await message.channel.send(
      `⌛ <@${message.author.id}>, you didn’t respond in time. Please try \`/birthday\` again when you're ready.`
    );
  }
}

module.exports = {
  handleBirthdayCommand,
  handleMyBirthdayCommand
};
