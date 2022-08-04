import { Telegraf } from "telegraf";
import { config } from "./config.js";
import axios from 'axios';
import currency_pkg from 'currencies-map';
const {CODES, Currencies} = currency_pkg;
import cryptocurrencies from 'cryptocurrencies';
import {currencyList, currencyActions} from './entities/currency-list.js';
import {cryptoList, cryptoActions} from './entities/crypto-list.js';
import {locales, localeActions} from './entities/locale-list.js';
import {formatCurrencies, formatCryptocurrencies, formatLocales} from './helpers/format.js';
import { makeLocaleTriggers } from "./helpers/triggers.js";
import { t } from "./helpers/translate.js";
import { changeLocale } from "./helpers/localize.js";
import fs from 'fs';

export const usersData = new Map();
export const file_path = config.TRANSLATION_JSON_PATH;
// console.log(CODES)
if (!fs.existsSync(file_path)) {
    fs.writeFileSync(file_path, JSON.stringify([]), {flag: 'w'})
}
const file_data = fs.readFileSync(file_path);
export const translations = JSON.parse(file_data.toString());

const bot = new Telegraf(config.BOT_TOKEN);

let currentCurrency, currentCrypto = '';
let messages = [];

bot.telegram.setMyCommands([
    {command: 'start', description: t(`Start Bot`)},
])

bot.use((ctx, next) => {
    let user = usersData.get(ctx.from.id);
    if (!user) {
        user = {id: ctx.from.id, locale: 'en'};
        usersData.set(ctx.from.id, user);
    }
    ctx.user = user;
    // console.log(ctx.from)//////////
    next();
})

bot.command('start', async ctx => {    
    messages.push(ctx.message);
    await sendStartMessage(ctx);      
});

bot.action('start', async ctx => {
    await sendStartMessage(ctx);
});

const sendStartMessage = async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const startMessage = '🌎  ' + t(`Welcome, this bot gives you cryptocurrency information`, ctx);
        const message = await bot.telegram.sendMessage(ctx.chat.id, startMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🪙  ' + t(`Crypto Prices`, ctx), callback_data: 'choose currency'}],
                        [{text: '📉  ' + t(`CoinMarketCap`, ctx), url: 'https://coinmarketcap.com/'}],
                        [{text: '🌐  ' + t(`Change language`, ctx), callback_data: 'change locale'}],
                        [{text: 'ℹ️  ' + t(`Bot Info`, ctx), callback_data: 'info'}],
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
        const priceMessage = '💵  ' + t(`Select one of the target currencies below`, ctx);    
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        ...formatCurrencies(currencyList, 4),
                        [{text: '🔙  ' + t(`Back to Main Menu`, ctx), callback_data: 'start'}],
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

bot.action('change locale', async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const localesMessage = '🌐  ' + t(`Select language`, ctx);    
        const message = await bot.telegram.sendMessage(ctx.chat.id, localesMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        ...formatLocales(locales, 2),
                        [{text: '🔙  ' + t(`Back to Main Menu`, ctx), callback_data: 'start'}],
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

bot.action(localeActions, async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const locale = ctx.match.input.split('-')[1];
        changeLocale(ctx, locale);
        await sendStartMessage(ctx);
    } catch (error) {
        console.log(error);
        ctx.answerCbQuery(error.message);
    }
})

bot.action(currencyActions, async ctx => {
    try {
        await clearMessages(ctx.chat.id);

        currentCurrency = ctx.match.input.split('-')[1];
        console.log('currentCurrency', currentCurrency)//////////////
        const priceMessage = t(`Select one of the cryptocurrencies below to show info in:\n`, ctx) + `<b>${t(Currencies.names.get(currentCurrency), ctx)} (${currentCurrency})</b>`;
        
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        ...formatCryptocurrencies(cryptoList, 3),                        
                        [{text: '🔙  ' + t(`Back to Currency Menu`, ctx), callback_data: 'choose currency'}],
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
    console.log('currentCrypto', currentCrypto)//////////////
    console.log('currentCurrency', currentCurrency)//////////////
    try {
        const res = await axios
        .get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${currentCrypto}&tsyms=${currentCurrency}&api_key=${config.CRYPTO_API_KEY}`);
        const crypto_data = res.data.DISPLAY[currentCrypto][currentCurrency];      
        
        const infoMessage = t(`
Cryptocurrency: `, ctx) + ` <b>${t(cryptocurrencies[currentCrypto], ctx)} (${currentCrypto})</b>\n` +
t(`Currency: `, ctx) + ` <b>${t(Currencies.names.get(currentCurrency), ctx)} (${currentCurrency})</b>\n  ` +
    t(`Price: `, ctx) + ` ${crypto_data.PRICE}\n  ` +
    t(`Open: `, ctx) + ` ${crypto_data.OPENDAY}\n  ` +
    t(`High: `, ctx) + ` ${crypto_data.HIGHDAY}\n  ` +
    t(`Low: `, ctx) + ` ${crypto_data.LOWDAY}\n  ` +
    t(`Supply: `, ctx) + ` ${crypto_data.SUPPLY}\n  ` + 
    t(`Market Cap: `, ctx) + ` ${crypto_data.MKTCAP}\n`;
                
        const message = await bot.telegram.sendMessage(ctx.chat.id, infoMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🔙  ' + t(`Back to Crypto Menu`, ctx), callback_data: `currency-${currentCurrency}`}]
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
        const message = await bot.telegram.sendMessage(ctx.chat.id, t(`Bot Info`, ctx),
            {
                reply_markup: {
                    keyboard: [
                        [{text: t(`Credits`, ctx), callback_data: 'credits'}, {text: t(`API`, ctx)}],
                        [{text: t(`Remove Keyboard`, ctx)}],
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

bot.hears(makeLocaleTriggers(`Credits`), async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await ctx.reply(t(`This bot was made by @volodymyr198`, ctx));
    messages.push(message);
});

bot.hears(makeLocaleTriggers(`API`), async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id)

    const message = await ctx.replyWithHTML(t(`This bot uses <b>Cryptocompare API</b>`, ctx));
    messages.push(message);
});

bot.hears(makeLocaleTriggers(`Remove Keyboard`), async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await bot.telegram.sendMessage(ctx.chat.id, t(`Removed keyboard`, ctx),
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