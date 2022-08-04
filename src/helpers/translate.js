import { translations, usersData, file_path } from "../bot.js";
import { writeFile } from 'fs/promises';

export const t = (text, ctx) => { 
    const locale = ctx ? usersData.get(ctx.user.id).locale : 'en';   
    const translation = translations.find(trans => trans.en === text)
    if (!translation) {
        translations.push({en: text});        
        writeFile(file_path, JSON.stringify(translations), {flag: 'w'});
        return text;
    } else if (!translation[locale]) {
        translation[locale] = translation.en;        
        writeFile(file_path, JSON.stringify(translations), {flag: 'w'});
        return text;
    }
    return translation[locale];
}