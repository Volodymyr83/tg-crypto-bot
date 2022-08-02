import { Telegraf } from "telegraf";
import { config } from "./config.js";
import axios from 'axios';
import currency_pkg from 'currencies-map';
const {CODES, Currencies} = currency_pkg;
import cryptocurrencies from 'cryptocurrencies';
import {currencyList, currencyActions} from './entities/currency-list.js';
import {cryptoList, cryptoActions} from './entities/crypto-list.js';
import {formatCurrencies, formatCryptocurrencies} from './helpers/format.js';


const bot = new Telegraf(config.BOT_TOKEN);

let currentCurrency, currentCrypto = '';
let messages = [];

bot.telegram.setMyCommands([
    {command: 'start', description: 'Start Bot'},
])

bot.command('start', async ctx => {
    bot.telegram.send
    messages.push(ctx.message);
    await sendStartMessage(ctx);      
});

bot.action('start', async ctx => {
    await sendStartMessage(ctx);
});

const sendStartMessage = async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const startMessage = '🌎 Welcome, this bot gives you cryptocurrency information';
        const message = await bot.telegram.sendMessage(ctx.chat.id, startMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🪙 Crypto Prices', callback_data: 'choose currency'}],
                        [{text: '📉 CoinMarketCap', url: 'https://coinmarketcap.com/'}],
                        [{text: 'ℹ️ Bot Info', callback_data: 'info'}],
                    ]
                }
            }
        );
        
        messages.push(message);
    } catch (error) {
        console.log(error);
    }    
}

bot.action('choose currency', async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const priceMessage = '💵 Select one of the target currencies below';    
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        ...formatCurrencies(currencyList, 4),
                        [{text: '🔙 Back to Main Menu', callback_data: 'start'}],
                    ]
                }
            }
        );

        messages.push(message);
    } catch (error) {
        console.log(error);
        ctx.answerCbQuery(error.message);
    }    
});

bot.action(currencyActions, async ctx => {
    try {
        await clearMessages(ctx.chat.id);

        currentCurrency = ctx.match.input.split('-')[1];
        const priceMessage = `Select one of the cryptocurrencies below to show info in\n<b>${Currencies.names.get(currentCurrency)} (${currentCurrency})</b>`;
        
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        ...formatCryptocurrencies(cryptoList, 3),                        
                        [{text: '🔙 Back to Currency Menu', callback_data: 'choose currency'}],
                    ]
                }
            }
        );

        messages.push(message);
    } catch (error) {
        console.log(error);
        ctx.answerCbQuery(error.message);
    }  
    
})

bot.action(cryptoActions, async ctx => {
    await clearMessages(ctx.chat.id);
    currentCrypto = ctx.match.input.split('-')[1];
    
    try {
        const res = await axios
        .get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${currentCrypto}&tsyms=${currentCurrency}&api_key=${config.CRYPTO_API_KEY}`);
        const crypto_data = res.data.DISPLAY[currentCrypto][currentCurrency];      
        
        const infoMessage = `
Cryptocurrency: <b>${cryptocurrencies[currentCrypto]} (${currentCrypto})</b>
Currency: <b>${Currencies.names.get(currentCurrency)} (${currentCurrency})</b>
    Price: ${crypto_data.PRICE}
    Open: ${crypto_data.OPENDAY}
    High: ${crypto_data.HIGHDAY}
    Low: ${crypto_data.LOWDAY}
    Supply: ${crypto_data.SUPPLY}
    Market Cap: ${crypto_data.MKTCAP}
    `;
                
        const message = await bot.telegram.sendMessage(ctx.chat.id, infoMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🔙 Back to Crypto Menu', callback_data: `currency-${currentCurrency}`}]
                    ]
                }
            }    
        );

        messages.push(message);
    } catch (error) {
        console.log(error);
        ctx.answerCbQuery(error.message);
    }
})

bot.action('info', async ctx => {
    try {
        ctx.answerCbQuery();
        const message = await bot.telegram.sendMessage(ctx.chat.id, 'Bot Info',
            {
                reply_markup: {
                    keyboard: [
                        [{text: 'Credits'}, {text: 'API'}],
                        [{text: 'Remove Keyboard'}],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                }
            }
        );

        messages.push(message);
    } catch (error) {
        console.log(error);
        ctx.answerCbQuery(error.message);
    }
    
});

bot.hears('Credits', async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await ctx.reply('This bot was made by @volodymyr198');
    messages.push(message);
});

bot.hears('API', async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id)

    const message = await ctx.replyWithHTML('This bot uses <b>Cryptocompare API</b>');
    messages.push(message);
});

bot.hears('Remove Keyboard', async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await bot.telegram.sendMessage(ctx.chat.id, 'Removed keyboard',
        {
            reply_markup: {
                remove_keyboard: true,
            }
        }
    );

    messages.push(message);
    await deleteLastMessage(ctx.chat.id);
});

bot.launch();

async function clearMessages(chat_id) {
    try {
        await Promise.all(messages.map(msg => bot.telegram.deleteMessage(chat_id, msg.message_id)));
        messages = [];

    } catch (error) {
        console.log(error);
    }
}

async function deleteLastMessage(chat_id) {
    const lastMessage = messages.pop();
    if (!lastMessage) return;

    try {        
        await bot.telegram.deleteMessage(chat_id, lastMessage.message_id);        
    } catch (error) {
        console.log(error);
    }
}