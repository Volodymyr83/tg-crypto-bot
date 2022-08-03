import { Telegraf } from "telegraf";
import { config } from "./config.js";
import axios from 'axios';
import currency_pkg from 'currencies-map';
const {CODES, Currencies} = currency_pkg;
import cryptocurrencies from 'cryptocurrencies';
import {currencyList, currencyActions} from './entities/currency-list.js';
import {cryptoList, cryptoActions} from './entities/crypto-list.js';
import {formatCurrencies, formatCryptocurrencies} from './helpers/format.js';

import { readFile, writeFile, stat } from 'fs/promises';
import fs from 'fs';
import path from 'path';

// import { createRequire } from "module"; // Bring in the ability to create the 'require' method
// const require = createRequire(import.meta.url); // construct the require method
// const readJsonSync = require('read-json-sync');
const locale = 'en';

const t = ([text]) => {
    const file_path = config.TRANSLATION_JSON_PATH;
    if (!fs.existsSync(file_path)) {
        fs.writeFileSync(file_path, JSON.stringify([]), {flag: 'w'})
    }
        const file_data = fs.readFileSync(file_path);
        const translations = JSON.parse(file_data.toString());
        const translation = translations.find(trans => trans.en === text)
        if(!translation) {
            translations.push({en: text});
            fs.writeFileSync(file_path, JSON.stringify(translations), {flag: 'w'})
        }
        console.log(translations);


    return translation[locale] || text;
}

async function changeLocale() {
    // const fileContents = await fs.promises.readFile('./dist/uk.po.json');
    
    // console.log()
    // const uk_locale_data = JSON.parse(fileContents.toString())
    
    // useLocale(uk);
}

changeLocale();

const bot = new Telegraf(config.BOT_TOKEN);

let currentCurrency, currentCrypto = '';
let messages = [];

bot.telegram.setMyCommands([
    {command: 'start', description: t`Start Bot`},
])

bot.command('start', async ctx => {
    bot.telegram.sendStartMessage(ctx);
    messages.push(ctx.message);
    await sendStartMessage(ctx);      
});

bot.action('start', async ctx => {
    await sendStartMessage(ctx);
});

const sendStartMessage = async ctx => {
    try {
        await clearMessages(ctx.chat.id);
        const startMessage = '🌎 ' + t`Welcome, this bot gives you cryptocurrency information`;
        const message = await bot.telegram.sendMessage(ctx.chat.id, startMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🪙 ' + t`Crypto Prices`, callback_data: 'choose currency'}],
                        [{text: '📉 ' + t`CoinMarketCap`, url: 'https://coinmarketcap.com/'}],
                        [{text: 'ℹ️ ' + t`Bot Info`, callback_data: 'info'}],
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
        const priceMessage = '💵 ' + t`Select one of the target currencies below`;    
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                reply_markup: {
                    inline_keyboard: [
                        ...formatCurrencies(currencyList, 4),
                        [{text: '🔙 ' + t`Back to Main Menu`, callback_data: 'start'}],
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
        const priceMessage = t`Select one of the cryptocurrencies below to show info in` + `\n<b>${Currencies.names.get(currentCurrency)} (${currentCurrency})</b>`;
        
        const message = await bot.telegram.sendMessage(ctx.chat.id, priceMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        ...formatCryptocurrencies(cryptoList, 3),                        
                        [{text: '🔙 ' + t`Back to Currency Menu`, callback_data: 'choose currency'}],
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
        
        const infoMessage = t`
Cryptocurrency: `+ `<b>${cryptocurrencies[currentCrypto]} (${currentCrypto})</b>\n` +
t`Currency: ` + `<b>${Currencies.names.get(currentCurrency)} (${currentCurrency})</b>\n  ` +
    t`Price: ` + `${crypto_data.PRICE}\n  ` +
    t`Open: ` + `${crypto_data.OPENDAY}\n  ` +
    t`High: ` + `${crypto_data.HIGHDAY}\n  ` +
    t`Low: ` + `${crypto_data.LOWDAY}\n  ` +
    t`Supply: ` + `${crypto_data.SUPPLY}\n  ` + 
    t`Market Cap: ` + `${crypto_data.MKTCAP}\n`;
                
        const message = await bot.telegram.sendMessage(ctx.chat.id, infoMessage,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{text: '🔙 ' + t`Back to Crypto Menu`, callback_data: `currency-${currentCurrency}`}]
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
        const message = await bot.telegram.sendMessage(ctx.chat.id, t`Bot Info`,
            {
                reply_markup: {
                    keyboard: [
                        [{text: t`Credits`}, {text: t`API`}],
                        [{text: t`Remove Keyboard`}],
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

bot.hears(t`Credits`, async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await ctx.reply(t`This bot was made by @volodymyr198`);
    messages.push(message);
});

bot.hears(t`API`, async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id)

    const message = await ctx.replyWithHTML(t`This bot uses <b>Cryptocompare API</b>`);
    messages.push(message);
});

bot.hears(t`Remove Keyboard`, async ctx => {
    messages.push(ctx.message);
    await deleteLastMessage(ctx.chat.id);

    const message = await bot.telegram.sendMessage(ctx.chat.id, t`Removed keyboard`,
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