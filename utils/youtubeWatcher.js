const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const lastLivePath = path.join(__dirname, '../data/youtubeLastLive.json');
let lastLive = { videoId: null, lastNotified: null };

// Load saved state from disk
if (fs.existsSync(lastLivePath)) {
  try {
    lastLive = JSON.parse(fs.readFileSync(lastLivePath, 'utf8'));
  } catch (err) {
    console.error('⚠️ Failed to parse youtubeLastLive.json. Resetting.');
    lastLive = { videoId: null, lastNotified: null };
  }
}

const COOLDOWN_MINUTES = 30;

async function checkYouTubeLive(client, discordChannelId, youtubeChannelId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !youtubeChannelId) return;

  try {
    const youtube = google.youtube({ version: 'v3', auth: apiKey });

    // Step 1: Search for currently live video
    const searchRes = await youtube.search.list({
      part: 'id',
      channelId: youtubeChannelId,
      eventType: 'live',
      type: 'video',
      maxResults: 1,
    });

    const liveVideo = searchRes.data.items?.[0];
    if (!liveVideo) return;

    const videoId = liveVideo.id.videoId;

    // Step 2: Check cooldown
    const now = Date.now();
    const lastTime = lastLive.lastNotified ? new Date(lastLive.lastNotified).getTime() : 0;
    const minutesSinceLast = (now - lastTime) / 60000;

    if (videoId === lastLive.videoId && minutesSinceLast < COOLDOWN_MINUTES) {
      return; // Cooldown active
    }

    // Step 3: Get video details
    const videoRes = await youtube.videos.list({
      part: 'snippet,liveStreamingDetails',
      id: videoId,
    });

    const video = videoRes.data.items?.[0];
    if (!video) return;

    const { title, channelTitle, thumbnails } = video.snippet;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const avatar = thumbnails.default?.url || thumbnails.medium?.url || thumbnails.high?.url;
    const image = thumbnails.high?.url || thumbnails.default?.url;

    // Step 4: Build the embed
    const embed = new EmbedBuilder()
      .setColor(0x2296A2)
      .setAuthor({ name: `${channelTitle} is now live on YouTube!`, iconURL: avatar, url: videoUrl })
      .setTitle(title)
      .setURL(videoUrl)
      .setDescription(`[Click here to watch the stream](${videoUrl})`)
      .setImage(image)
      .setTimestamp()
      .setFooter({ text: '🔴 Live Now • YouTube Stream' });

    // Step 5: Send to Discord
    const channel = await client.channels.fetch(discordChannelId);
    if (channel) {
      await channel.send({
        content: `@everyone <@&${process.env.DISCORD_LIVE_PING_ROLE_ID}>`,
        embeds: [embed],
      });
    }

    // Step 6: Save state
    lastLive.videoId = videoId;
    lastLive.lastNotified = new Date().toISOString();
    fs.writeFileSync(lastLivePath, JSON.stringify(lastLive, null, 2));

  } catch (err) {
    console.error('❌ YouTube Live Check Failed:', err.message);
  }
}

module.exports = { checkYouTubeLive };
