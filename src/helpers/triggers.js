import { getTranslations } from "../services/translate.js";

export const makeLocaleTriggers = (text) => {
    const translations = getTranslations();
    const translation = translations.find(trans => trans.en === text);
    if (!translation) {
        return text;
    }
    const entries = Object.entries(translation);
    return entries.map(entry => entry[1]);
}