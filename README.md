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
- Plain ol’ JSON files for data storage

## Folder Vibes

- `data/` – Where user and member data lives
- `handlers/` – Handles commands and events
- `utils/` – Helper functions, birthday logic, and more
- `index.js` – The main bot script

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

4. Run the bot:

   node index.js

## Setup Notes

This project ignores the `data/` folder and `.env` for privacy.  

To test the bot locally:

1. Create a `.env` file based on `.env.example`.
2. Use the `data-sample/` files to understand expected structure.
3. The bot will auto-create `data/*.json` if not present.

## Notes

- Make sure your bot has the necessary permissions in the Discord server.

- This project is in active development and will evolve over time.

