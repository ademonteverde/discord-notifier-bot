const { EmbedBuilder } = require('discord.js');
const icebreakers = require('../data/icebreakerData');
const { getRandomIcebreaker } = require('../utils/icebreakerUtils');

async function sendWelcomeMessage(member, channel, question) {
  const cleanDisplayName = member.displayName.replace(/[`]/g, "'");

  const embed = new EmbedBuilder()
    .setColor('#00B8D9')
    .setTitle(`Welcome to Dre's Dreamers, ${cleanDisplayName}!`)
    .setDescription(
      `We're excited to have you here! Please make sure to check out:\n\n` +
      `• <#${process.env.DISCORD_GUIDELINES_CHANNEL_ID}> to get familiar and verify yourself.\n` +
      `• <#${process.env.DISCORD_INTRO_CHANNEL_ID}> to introduce yourself.\n` +
      `• <#${process.env.DISCORD_VICTORY_CHANNEL_ID}> to share your wins.\n` +
      `• <#${process.env.DISCORD_SUPPORT_CHANNEL_ID}> if you need help.\n\n` +
      `Let's keep dreaming together! ✨`
    )
    .addFields([{ name: '💭 Icebreaker Question', value: `\`\`\`\n${question}\n\`\`\`` }])
    .setFooter({ text: 'Feel free to jump into any chat or VC!' });

  return await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
}

module.exports = { sendWelcomeMessage, getRandomIcebreaker };
