async function handleFirstMessageReaction(message, tracker, saveFn) {
  // Skip if user already tracked
  if (tracker.has(message.author.id)) return;

  try {
    // Get custom emoji by ID from environment variable
    const customEmoji = message.guild.emojis.cache.get(process.env.DISCORD_FIRST_REACT_EMOJI_ID);

    // React to the message if the emoji is found
    if (customEmoji) {
      await message.react(customEmoji);
    }

    // Add user ID to tracker and save
    tracker.add(message.author.id);
    saveFn();
  } catch (err) {
    console.error('❌ Failed to handle first message reaction:', err.message);
  }
}

module.exports = {
  handleFirstMessageReaction,
};
