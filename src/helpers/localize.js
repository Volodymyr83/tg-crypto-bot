import { usersData } from "../bot.js";

export const changeLocale = (ctx, locale) => {
    ctx.user.locale = locale;
    usersData.set(ctx.user.id, ctx.user);
}