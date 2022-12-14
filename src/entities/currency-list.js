export const currencyList = [
    {flag: 'πΊπΈ', code: 'USD'},
    {flag: 'πͺπΊ', code: 'EUR'},
    {flag: 'π¬π§', code: 'GBP'},
    {flag: 'πΊπ¦', code: 'UAH'},
    {flag: 'π΅π±', code: 'PLN'},
    {flag: 'π¦πΊ', code: 'AUD'},
    {flag: 'π¨π³', code: 'CNY'},
    {flag: 'π―π΅', code: 'JPY'},
    {flag: 'π¦π²', code: 'AMD'},
    {flag: 'π§π¬', code: 'BGN'},
    {flag: 'π§π·', code: 'BRL'},
    {flag: 'π¨π¦', code: 'CAD'},
    {flag: 'π¨πΏ', code: 'CZK'},
    {flag: 'π­πΊ', code: 'HUF'},
    {flag: 'π²π©', code: 'MDL'},
    {flag: 'π·π΄', code: 'RON'},
    {flag: 'πΉπ·', code: 'TRY'},
    {flag: 'π°πΏ', code: 'KZT'},
    {flag: 'π·πΊ', code: 'RUB'},
    {flag: 'π§πΎ', code: 'BYN'},
];

export const currencyActions = currencyList.map(currency => `currency-${currency.code}`);