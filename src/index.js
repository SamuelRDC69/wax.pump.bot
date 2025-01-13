// Required dependencies
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { createConnectTransport } from '@connectrpc/connect-node';
import { streamBlocks } from '@substreams/core';
import { createRegistry, createRequest } from '@substreams/manifest';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID,
    SUBSTREAMS_API_TOKEN,
    COINMARKETCAP_API_KEY,
    NETWORK = 'testnet' // Allow switching between mainnet and testnet
} = process.env;

// Constants
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
const ENDPOINTS = {
    testnet: "https://waxtest.substreams.pinax.network:443",
    mainnet: "https://wax.substreams.pinax.network:443"
};
const CONTRACTS = {
    testnet: "pumpaccount1",
    mainnet: "main.waxfun"
};
const SPKG = "https://spkg.io/pinax-network/antelope-tokens-v0.3.1.spkg";
const MODULE = "map_transfers";
const CMC_API_URL = "https://pro-api.coinmarketcap.com/v2/tools/price-conversion";

// Use appropriate endpoint and contract based on network
const ENDPOINT = ENDPOINTS[NETWORK];
const CONTRACT_ACCOUNT = CONTRACTS[NETWORK];

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Function to get WAX price from CoinMarketCap
async function getWAXPrice() {
    try {
        const response = await fetch(`${CMC_API_URL}?amount=1&symbol=WAXP&convert=USD`, {
            headers: {
                'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        return data.data[0].quote.USD.price;
    } catch (error) {
        console.error('Error fetching WAX price:', error);
        return 0;
    }
}

// Helper function to calculate emojis based on WAX amount and price
function calculateEmojis(waxAmount, waxPrice) {
    const usdValue = waxAmount * waxPrice;
    let emojiCount = Math.min(Math.floor(usdValue / 10), 50); // 1 emoji per $10, max 50
    let emojis = '';
    const maxPerLine = 12;
    
    while (emojiCount > 0) {
        const lineLength = Math.min(emojiCount, maxPerLine);
        emojis += '🐸'.repeat(lineLength) + '\n';
        emojiCount -= lineLength;
    }
    
    return emojis.trim();
}

// Parse memo JSON
function parseMemo(memo) {
    try {
        return JSON.parse(memo);
    } catch {
        return null;
    }
}

// Extract relevant data from logbsl action
function parseLogBSL(actionData) {
    try {
        const lines = actionData.split('\n');
        const data = {};
        
        lines.forEach(line => {
            if (line.includes('buyer:')) {
                data.buyer = line.split('buyer:')[1].trim();
            } else if (line.includes('amount:') && line.includes('BSBXB')) {
                const [amount, symbol] = line.split('amount:')[1].trim().split(' ');
                data.tokenAmount = parseFloat(amount);
                data.tokenSymbol = symbol;
            } else if (line.includes('amount:') && line.includes('WAX')) {
                const [amount, symbol] = line.split('amount:')[1].trim().split(' ');
                data.waxAmount = parseFloat(amount);
            } else if (line.includes('current_price:')) {
                data.currentPrice = parseFloat(line.split('current_price:')[1].trim());
            } else if (line.includes('token_contract:')) {
                data.tokenContract = line.split('token_contract:')[1].trim();
            }
        });
        
        return data;
    } catch (error) {
        console.error('Error parsing logbsl:', error);
        return null;
    }
}

// Function to format transaction message
async function formatMessage(logData, trxId, waxPrice) {
    const {
        buyer,
        tokenAmount,
        tokenSymbol,
        waxAmount,
        currentPrice,
        tokenContract
    } = logData;

    const usdValue = waxAmount * waxPrice;
    const emojis = calculateEmojis(waxAmount, waxPrice);
    const shortTrxId = `${trxId.slice(0, 7)}…`;

    // Calculate market cap based on current price and total supply
    const marketCap = TOTAL_SUPPLY * currentPrice * waxPrice;

    const explorerPrefix = NETWORK === 'testnet' ? 'testnet.' : '';

    return `**$${tokenSymbol}** BUY!!!\n
${emojis}\n
🙋‍♂️ ${buyer}
💵 ${waxAmount.toFixed(2)} WAX ($${usdValue.toFixed(2)})
🪙 ${tokenAmount.toFixed(8)} ${tokenSymbol}
[⛓️ ${shortTrxId}](https://${explorerPrefix}waxblock.io/transaction/${trxId})
🧢 Market Cap: **$${marketCap.toLocaleString()}**\n
Contract: ${tokenContract}
Made with 💚 by Wax Bot`;
}

// Function to process transaction traces
async function processTransaction(traces, trxId) {
    try {
        // Look for the logbsl action in the traces
        const logBSLAction = traces.find(trace => 
            trace.action === 'logbsl' && 
            trace.account === CONTRACT_ACCOUNT
        );

        if (!logBSLAction) return;

        const logData = parseLogBSL(logBSLAction.data);
        if (!logData) return;

        const waxPrice = await getWAXPrice();
        const message = await formatMessage(logData, trxId, waxPrice);

        if (message) {
            await bot.sendMessage(TELEGRAM_CHANNEL_ID, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        }
    } catch (error) {
        console.error('Error processing transaction:', error);
    }
}

// Main stream processing function
async function handleStream(transport, request) {
    let retryCount = 0;
    
    try {
        for await (const response of streamBlocks(transport, request)) {
            if (response.message?.case === 'blockScopedData') {
                const transactions = response.message.value.output.mapOutput;
                
                for (const tx of transactions) {
                    if (tx.traces) {
                        await processTransaction(tx.traces, tx.id);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Stream error:', error);
        retryCount++;
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return handleStream(transport, request);
    }
}

// Main function to start the bot
async function main() {
    try {
        console.log(`Starting WAX Token Bot on ${NETWORK}...`);
        
        // Set up Substreams
        const pkg = await fetchPackage(SPKG);
        const registry = createRegistry(pkg);
        
        const transport = createConnectTransport({
            baseUrl: ENDPOINT,
            interceptors: [createAuthInterceptor(SUBSTREAMS_API_TOKEN)],
            useBinaryFormat: true,
            jsonOptions: { typeRegistry: registry }
        });
        
        const request = createRequest({
            substreamPackage: pkg,
            outputModule: MODULE,
            productionMode: true,
            startBlockNum: '-1', // Start from latest block
            stopBlockNum: '+1000000' // Run indefinitely
        });
        
        // Start streaming
        await handleStream(transport, request);
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Start the bot
main().catch(console.error);
