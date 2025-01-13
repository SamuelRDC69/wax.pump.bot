# WAX Pump Bot Setup Guide

## Prerequisites

1. Node.js (v16 or higher)
2. npm (Node Package Manager)
3. Git

## Required Accounts & API Keys

Before starting, you'll need:

1. Telegram Bot Token (from @BotFather)
2. Telegram Channel ID
3. Substreams API Token (from Pinax)
4. CoinMarketCap API Key

## Installation Steps

1. Clone the repository
```bash
git clone <your-repo-url>
cd wax-pump-bot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials:
- Add your Telegram Bot Token
- Add your Telegram Channel ID
- Add your Substreams API Token
- Add your CoinMarketCap API Key
- Verify NETWORK=testnet

## Setting up the Telegram Bot

1. Create a new bot:
   - Open Telegram and search for @BotFather
   - Send `/newbot` command
   - Follow the prompts to create your bot
   - Save the API token provided

2. Create a Telegram channel:
   - Create a new channel in Telegram
   - Make it public or private
   - Add your bot as an administrator with posting permissions

3. Get the Channel ID:
   - Forward a message from your channel to @userinfobot
   - It will show you the channel ID
   - For public channels, use the channel username with @ prefix
   - For private channels, use the numeric ID (usually starts with -100)

## Running the Bot

1. Start in development mode (with auto-reload):
```bash
npm run dev
```

2. Start in production mode:
```bash
npm start
```

## Testing the Setup

1. Verify the bot is running:
   - Check console output for "Starting WAX Token Bot on testnet..."
   - No error messages should appear

2. Verify Telegram connection:
   - The bot should be online in your Telegram channel
   - Check the bot's status in @BotFather

3. Monitor logs:
   - Watch the console output for incoming transactions
   - Check for any error messages or connection issues

## Troubleshooting

Common issues and solutions:

1. Connection errors:
   - Verify your Substreams API token
   - Check your internet connection
   - Ensure the testnet endpoint is accessible

2. Telegram errors:
   - Verify bot has admin rights in the channel
   - Check if the channel ID is correct
   - Ensure the bot token is valid

3. Missing transactions:
   - Verify the contract address is correct
   - Check if you're connected to the right network
   - Ensure the Substreams module is properly configured

## Directory Structure

```
wax-pump-bot/
├── src/
│   └── index.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## Maintenance

- Keep dependencies updated with `npm update`
- Monitor error logs regularly
- Check for updates to the Substreams package
- Verify API key expiration dates

## Security Notes

- Never commit your .env file
- Keep your API keys secure
- Regularly rotate API keys if possible
- Monitor bot activity for unusual patterns
