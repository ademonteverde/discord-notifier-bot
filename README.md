# Discord Notifier Bot

Welcome to the Discord Notifier Bot — a versatile and reliable assistant designed to enhance your server with timely updates, engaging interactions, and a touch of charm to keep your community connected and entertained.

## What It Does

This bot is built to bring a little more life into your community. Here’s what it can do:

- Birthday greetings at midnight in the user’s timezone
- Welcoming new members with a custom message and a fun icebreaker
- Auto-assigning roles when someone joins
- Tracking first messages and intro posts, complete with reactions
- Logging member data like display names, roles, and join dates
- Admin-only test commands and error logging
- YouTube live stream notifications
- Data persistence via JSON files

## Features in Plain English

- `/birthday`: Users can set their birthday and timezone.
- `/mybirthday`: View your saved birthday and remove it if you want.
- `/testgreet`: Sends a test welcome message (admin only).
- `/dumpmembers`: Saves member info to a file (admin only).
- `/testerror`: Just what it sounds like — throws a test error.

## How It's Built

- Node.js
- discord.js
- node-cron
- dotenv
- JSON files for data storage

## Folder Vibes

- `index.js` – The main bot script
- `handlers/` – Handles commands and events (birthday, welcome, message tracking)
- `utils/` – Helper functions, birthday logic, storage, and API integrations
- `data/` – Where real user and member data lives (gitignored)
- `data-sample/` – Sample JSON files so you know what the data should look like
- `.env.example` – Shows you what secrets to set

## Getting Started

1. Clone the repo:

   git clone https://github.com/ademonteverde/discord-notifier-bot.git
   cd discord-notifier-bot

2. Install the stuff:

   npm install

3. Make a `.env` file and fill in your secrets:

   DISCORD_TOKEN=your_token_here  
   DISCORD_WELCOME_CHANNEL_ID=channel_id_here  
   DISCORD_LOG_CHANNEL_ID=channel_id_here  
   DISCORD_INTRO_CHANNEL_ID=channel_id_here  
   DISCORD_AUTO_ROLES=role_id_1,role_id_2  
   DISCORD_FIRST_REACT_EMOJI_ID=emoji_id_here  

   YOUTUBE_API_KEY=your_key_here  
   YOUTUBE_CHANNEL_ID=your_channel_id_here  

4. Run the bot:

   npm run start

## Setup Notes

This project ignores the `data/` folder and `.env` for privacy.  

To test the bot locally:

1. Create a `.env` file based on `.env.example`.
2. Use the files in `data-sample/` (`birthdays.json`, `members.json`, `icebreakerStats.json`, `timezones.json`) to see what the data should look like
3. The bot will auto-create `data/*.json` if not present.

## Notes

- Make sure your bot has the necessary permissions in the Discord server.
- This project is in active development and will evolve over time.

