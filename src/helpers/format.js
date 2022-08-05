import { plus_session } from "./session.js";

export function formatCurrencies(currencies, columns) {
    return format(currencies, columns, currency => (
        {text: `${currency.flag} ${currency.code}`, callback_data: plus_session + `currency-${currency.code}`}
    ));
}

export function formatCryptocurrencies(cryptoCurrencies, columns) {
    return format(cryptoCurrencies, columns, crypto => (
        {text: `${crypto}`, callback_data: plus_session + `crypto-${crypto}`}
    ));
}

export function formatLocales(locales, columns) {
    return format(locales, columns, locale => (
        {text: `${locale.flag} ${locale.text}`, callback_data: plus_session + `locale-${locale.code}`}
    ));
}

export function format(dataArray, columns, callback) {
    const resultArray = [];
    let rowArray = [];
    for (let i = 0; i < dataArray.length; i++) {
        rowArray.push(callback(dataArray[i]));
        if ((i + 1) % columns === 0 || (i + 1) === dataArray.length) {
            resultArray.push(rowArray);
            rowArray = [];
        }
    }
    
    return resultArray;    
}