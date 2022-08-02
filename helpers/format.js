export function formatCurrencies(currencies, columns) {
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

export function formatCryptocurrencies(cryptoCurrencies, columns) {
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