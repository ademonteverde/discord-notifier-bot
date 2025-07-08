async function handleFirstMessageReaction(message, tracker, saveFn) {
  if (!tracker.has(message.author.id)) {
    const customEmoji = message.guild.emojis.cache.get(process.env.DISCORD_FIRST_REACT_EMOJI_ID);
    if (customEmoji) await message.react(customEmoji);
    tracker.add(message.author.id);
    saveFn();
  }
}

module.exports = {
  handleFirstMessageReaction,
};
