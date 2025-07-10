const { EmbedBuilder } = require('discord.js');

async function logError(client, errorMessage) {
  try {
    const channel = await client.channels.fetch(process.env.DISCORD_LOG_CHANNEL_ID);
    const timestamp = new Date().toISOString();

    const embed = new EmbedBuilder()
      .setTitle('❌ Bot Error')
      .setDescription(`\`\`\`${errorMessage}\`\`\``)
      .setColor(0xFF5555)
      .setFooter({ text: timestamp });

    if (channel) {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Failed to send error to log channel:', err.message);
  }
}

module.exports = { logError };
