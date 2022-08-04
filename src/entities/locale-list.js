export const locales = [
    {code: 'en', flag: '🇬🇧', text: 'English'},
    {code: 'uk', flag: '🇺🇦', text: 'Українська мова'},
    {code: 'ru', flag: '🇷🇺', text: 'Русский язык'},
      
];

export const localeActions = locales.map(locale => `locale-${locale.code}`);