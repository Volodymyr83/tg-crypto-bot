import { translations } from "../bot.js";

export const makeLocaleTriggers = (text) => {
    const translation = translations.find(trans => trans.en === text);
    if (!translation) {
        return text;
    }
    const entries = Object.entries(translation);
    return entries.map(entry => entry[1]);
}