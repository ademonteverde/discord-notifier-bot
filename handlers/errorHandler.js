const { EmbedBuilder } = require('discord.js');

async function logError(client, message) {
  try {
    const channel = await client.channels.fetch(process.env.DISCORD_LOG_CHANNEL_ID);
    const timestamp = new Date().toISOString();

    if (channel) {
      await channel.send(`❌ **[${timestamp}]** Error: ${message}`);
    }
  } catch (err) {
    console.error('Failed to send error to log channel:', err.message);
  }
}


module.exports = { logError }; 
