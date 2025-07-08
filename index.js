require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');

const { handleBirthdayCommand, handleMyBirthdayCommand } = require('./handlers/birthdayHandler');


const { loadTracker, saveTracker, loadMembers, saveMembers } = require('./utils/storage');

const { getRandomIcebreaker, recentQuestions } = require('./utils/icebreakerUtils');

const { sendWelcomeMessage } = require('./handlers/welcomeHandler');
const { handleFirstMessageReaction } = require('./handlers/messageHandler');
const { logError } = require('./handlers/errorHandler');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = process.env.DISCORD_WELCOME_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID;
const INTRO_CHANNEL_ID = process.env.DISCORD_INTRO_CHANNEL_ID;

const FIRST_MESSAGE_FILE = './data/firstMessageUsers.json';
const INTRO_MESSAGE_FILE = './data/introMessageUsers.json';

const firstMessageTracker = loadTracker(FIRST_MESSAGE_FILE);
const introMessageTracker = loadTracker(INTRO_MESSAGE_FILE);
const membersData = loadMembers();

const cron = require('node-cron');
const { sendBirthdayGreeting } = require('./utils/birthday');

const { loadOrInitJSON } = require('./utils/storage');

const icebreakerStats = loadOrInitJSON('./data/icebreakerStats.json');
const timezones = loadOrInitJSON('./data/timezones.json', {
  "America/New_York": "Eastern Time",
  "Asia/Manila": "Philippine Time"
});

// Initialize the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

cron.schedule('*/5 * * * *', async () => {
  await sendBirthdayGreeting(client, process.env.DISCORD_WELCOME_CHANNEL_ID);
});

function isAdmin(message) {
  return message.member.permissions.has('Administrator');
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'Looking for dreams 💭',
      type: ActivityType.Streaming,
      url: 'https://www.youtube.com/watch?v=ZRrQfWd8lsg',
    }],
  });

  // 🗓️ Every month on the 1st at 3:00 AM
  cron.schedule('0 3 1 * *', async () => {
    try {
      const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      await guild.members.fetch();

      const snapshot = {};

      guild.members.cache.forEach(member => {
        snapshot[member.id] = {
          id: member.id,
          username: member.user.username,
          tag: member.user.tag,
          displayName: member.displayName,
          nickname: member.nickname || null,
          joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
          roles: member.roles.cache
            .map(role => role.name)
            .filter(name => name !== '@everyone')
        };
      });

      saveMembers(snapshot);
      console.log(`✅ [Monthly Save] Saved ${Object.keys(snapshot).length} members.`);
    } catch (err) {
      console.error(`❌ [Monthly Save] Failed to save members:`, err.message);
    }
  });
});

client.on('guildMemberAdd', async member => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) throw new Error('Welcome channel not found.');

    const question = getRandomIcebreaker();
    await sendWelcomeMessage(member, channel, question);

    const roleIds = process.env.DISCORD_AUTO_ROLES.split(',').map(id => id.trim());
    for (const roleId of roleIds) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) await member.roles.add(role);
    }

    const memberInfo = {
      id: member.id,
      username: member.user.username,
      tag: member.user.tag,
      joinedAt: member.joinedAt.toISOString(),
      displayName: member.displayName,
      nickname: member.nickname || null,
      roles: member.roles.cache.map(role => role.name).filter(name => name !== '@everyone')
    };

    membersData[member.id] = memberInfo;
    saveMembers(membersData);
  } catch (err) {
    await logError(client, `Failed to greet <@${member.id}>: ${err.message}`);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const userId = newMember.id;

    if (!membersData[userId]) {
      membersData[userId] = {
        id: userId,
        username: newMember.user.username,
        tag: newMember.user.tag,
        joinedAt: newMember.joinedAt ? newMember.joinedAt.toISOString() : null
      };
    }

    membersData[userId].displayName = newMember.displayName;
    membersData[userId].nickname = newMember.nickname || null;
    membersData[userId].roles = newMember.roles.cache
      .map(role => role.name)
      .filter(name => name !== '@everyone');

    saveMembers(membersData);
  } catch (err) {
    await logError(client, `Failed to update member info on role/nickname change: ${err.message}`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  try {
    await handleBirthdayCommand(message);
    await handleMyBirthdayCommand(message);
    await handleFirstMessageReaction(
      message,
      firstMessageTracker,
      () => saveTracker(FIRST_MESSAGE_FILE, firstMessageTracker)
    );


    if (message.channel.id === INTRO_CHANNEL_ID && !introMessageTracker.has(message.author.id)) {
      const customEmoji = message.guild.emojis.cache.get(process.env.DISCORD_FIRST_REACT_EMOJI_ID);
      if (customEmoji) await message.react(customEmoji);
      introMessageTracker.add(message.author.id);
      saveTracker(INTRO_MESSAGE_FILE, introMessageTracker);
    }

    if (message.content === '/testgreet') {
      if (!isAdmin(message)) {
        return message.reply('⛔ You need administrator permissions to run this.');
      }
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      await sendWelcomeMessage(message.member, logChannel, getRandomIcebreaker());
      await message.reply('✅ Test greet message sent to log channel.');
    }

    if (message.content === '/dumpmembers') {
      if (!isAdmin(message)) {
        return message.reply('⛔ You need administrator permissions to run this.');
      }

      await message.guild.members.fetch();
      const allMembers = {};

      message.guild.members.cache.forEach(member => {
        allMembers[member.id] = {
          id: member.id,
          username: member.user.username,
          tag: member.user.tag,
          displayName: member.displayName,
          nickname: member.nickname || null,
          joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
          roles: member.roles.cache
            .map(role => role.name)
            .filter(name => name !== '@everyone')
        };
      });

      saveMembers(allMembers);
      await message.reply(`✅ Saved ${Object.keys(allMembers).length} member entries to \`members.json\`.`);
    }

    if (message.content === '/testerror') {
      throw new Error('Intentional test error!');
    }

  } catch (err) {
    await logError(client, `Error in messageCreate: ${err.message}`);
  }
});


client.login(DISCORD_TOKEN).catch(console.error);
