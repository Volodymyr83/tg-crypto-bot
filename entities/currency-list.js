export const currencyList = [
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

export const currencyActions = currencyList.map(currency => `currency-${currency.code}`);