import { getUser } from './user.js';
import { writeFile } from 'fs/promises';
import { config } from "../config.js";
import fs from 'fs';

const file_path = config.TRANSLATION_JSON_PATH;

if (!fs.existsSync(file_path)) {
    fs.writeFileSync(file_path, JSON.stringify([]), {flag: 'w'})
}
const file_data = fs.readFileSync(file_path);
const translations = JSON.parse(file_data.toString());

export const t = (text, ctx) => {
    const user = getUser(ctx?.user.id);
    const locale = ctx ? user.locale : 'en';   
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

export const getTranslations = () => translations;