import { config } from "../config.js";

export function logger(ctx) {
    let message = '';
    if (ctx.message.text) {
        message = `@${ctx.from.username} said '${ctx.message.text}'`;
    } else if (ctx.message.sticker) {
        message = `@${ctx.from.username} send a sticker`;
    }

    console.log(message);    
    ctx.telegram.sendMessage(config.LOG_CHAT_ID, message);
}