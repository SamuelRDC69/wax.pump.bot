# WAX Pump Bot

A Telegram bot that monitors WAX token purchases and sends notifications to specified channels and groups with topic support.

## Features

- Real-time monitoring of WAX token purchases
- Support for multiple destinations (channels and groups)
- Topic support in groups
- Dynamic emoji display based on purchase amount
- Market cap calculation
- Testnet and mainnet support

## Prerequisites

- Node.js v16 or higher
- npm (Node Package Manager)
- Telegram Bot Token (from @BotFather)
- Substreams API Token
- CoinMarketCap API Key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wax-pump-bot
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file and configure:
```bash
cp .env.example .env
```

## Configuration

### Environment Variables

Edit your `.env` file with the following:

```env
# Telegram Bot Token (Get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Destinations (Examples below)
TELEGRAM_DESTINATIONS=@yourchannel,-100123456789,@group1:123

# API Keys
SUBSTREAMS_API_TOKEN=your_substreams_token_here
COINMARKETCAP_API_KEY=your_cmc_api_key_here

# Network (testnet or mainnet)
NETWORK=testnet
```

### Destination Format Examples

- Public channel: `@channelname`
- Private channel: `-100123456789`
- Group with topic: `@groupname:123` (where 123 is topic ID)
- Private group with topic: `-100123456789:456`
- Multiple destinations: Combine with commas

### Setting Up Topics in Groups

1. Add your bot to the group as an administrator
2. Enable topics in group settings
3. Create a topic
4. Get topic ID from URL when clicking the topic
5. Add to TELEGRAM_DESTINATIONS using the format: `groupname:topicId`

## Running the Bot

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## Troubleshooting

### Common Issues

1. Bot not posting:
   - Verify bot has admin rights in channels/groups
   - Check if channel/group IDs are correct
   - Ensure bot token is valid

2. Topic messages not working:
   - Verify topics are enabled in group
   - Check topic ID is correct
   - Confirm bot has permission to post in topics

3. Connection errors:
   - Verify Substreams API token
   - Check network setting (testnet/mainnet)
   - Ensure stable internet connection

### Getting IDs and Tokens

1. Channel ID:
   - Forward message from channel to @userinfobot
   - Use channel username with @ prefix for public channels

2. Group ID:
   - Add @userinfobot to group
   - Forward message from group to get ID

3. Topic ID:
   - Click on topic in group
   - Get ID from URL

## Monitoring and Maintenance

- Check console logs for errors
- Monitor bot status in @BotFather
- Verify API key expiration dates
- Keep dependencies updated with `npm update`

## Security Notes

- Never commit your .env file
- Keep API keys secure
- Regularly rotate tokens if possible
- Monitor bot activities

## Support

For issues and feature requests, please create an issue in the repository.

## License

[Your License]
