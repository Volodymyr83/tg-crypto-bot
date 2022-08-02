import { Telegraf } from "telegraf";
import { config } from "./config.js";
import axios from 'axios';
import emojis from 'emojis-list';

import currency_pkg from 'currencies-map';
const {CODES, Currencies} = currency_pkg;
import cryptocurrencies from 'cryptocurrencies';

const bot = new Telegraf(config.BOT_TOKEN);

const currencyList = [
    {flag: '🇺🇸', code: 'USD'},
    {flag: '🇪🇺', code: 'EUR'},
    {flag: '🇬🇧', code: 'GBP'},
    {flag: '🇺🇦', code: 'UAH'},
    {flag: '🇵🇱', code: 'PLN'},
    {flag: '🇦🇺', code: 'AUD'},
    {flag: '🇨🇳', code: 'CHY'},
    {flag: '🇯🇵', code: 'JPY'},
    {flag: '🇦🇲', code: 'AMD'},
    {flag: '🇧🇬', code: 'BGN'},
    {flag: '🇧🇷', code: 'BRL'},
    {flag: '🇨🇦', code: 'CAD'},
    {flag: '🇨🇿', code: 'CZK'},
    {flag: '🇭🇺', code: 'HUF'},
    {flag: '🇲🇩', code: 'MDL'},
    {flag: '🇷🇴', code: 'RON'},
    {flag: '🇹🇷', code: 'TRY'},
    {flag: '🇰🇿', code: 'KZT'},
    {flag: '🇷🇺', code: 'RUB'},
    {flag: '🇧🇾', code: 'BYN'},
];    
const currencyActions = currencyList.map(currency => `currency-${currency.code}`);

const cryptoList = ['BTC', 'ETH', 'USDT', 'LTC', 'USDC', 'BNB', 'XRP', 'DOGE', 'TRX'];
const cryptoActions = cryptoList.map(crypto => `crypto-${crypto}`);
let currency, crypto = '';

let messages = [];
const clearMessages = async (chat_id) => {
    try {
        await Promise.all(messages.map(msg => bot.telegram.deleteMessage(chat_id, msg.message_id)));
        messages = [];

    } catch (error) {
        console.log(error);
    }
}

const deleteLastMessage = async (chat_id) => {
    const lastMessage = messages.pop();
    if (!lastMessage) return;

    try {        
        await bot.telegram.deleteMessage(chat_id, lastMessage.message_id);        
    } catch (error) {
        console.log(error);
    }
}

function formatCurrencies(currencies, columns) {
    const resultArray = [];
    let rowArray = [];
    for (let i = 0; i < currencies.length; i++) {
        rowArray.push({text: `${currencies[i].flag}${currencies[i].code}`, callback_data: `currency-${currencies[i].code}`});
        if ((i + 1) % columns === 0 || (i + 1) === currencies.length) {
            resultArray.push(rowArray);
            rowArray = [];
        }
    }
    return resultArray;
}

function formatCryptoCurrencies(cryptoCurrencies, columns) {
    const resultArray = [];
    let rowArray = [];
    for (let i = 0; i < cryptoCurrencies.length; i++) {
        rowArray.push({text: `${cryptoCurrencies[i]}`, callback_data: `crypto-${cryptoCurrencies[i]}`});
        
        if ((i + 1) % columns === 0 || (i + 1) === cryptoCurrencies.length) {
            resultArray.push(rowArray);
            rowArray = [];
        }
    }
    return resultArray;
}

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

        currency = ctx.match.input.split('-')[1];
        console.log(currency);

        const priceMessage = `Select one of the cryptocurrencies below to show info in\n<b>${Currencies.names.get(currency)} (${currency})</b>`;
        
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        ...formatCryptoCurrencies(cryptoList, 3),                        
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

    crypto = ctx.match.input.split('-')[1];
    console.log(crypto);
    
    try {
        const res = await axios
        .get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${crypto}&tsyms=${currency}&api_key=${config.CRYPTO_API_KEY}`);
        const crypto_data = res.data.DISPLAY[crypto][currency];
        // console.log('res.data.RAW', res.data.RAW)///////////////////////
        
        const infoMessage = `
Cryptocurrency: <b>${cryptocurrencies[crypto]} (${crypto})</b>
Currency: <b>${Currencies.names.get(currency)} (${currency})</b>
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
                        [{text: '🔙 Back to Crypto Menu', callback_data: `currency-${currency}`}]
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

