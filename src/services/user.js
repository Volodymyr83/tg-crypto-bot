

const usersData = new Map();

export const getOrCreateUser = user_id => { 
    let user = getUser(user_id);
    if (!user) {
        user = createUser(user_id);
    }
    return user;
};

export const getUser = user_id => usersData.get(user_id);

export const saveUser = (user_id, user) => usersData.set(user_id, user);

export const createUser = user_id => {
    const user = {
        id: user_id,
        locale: 'en',
        messages: [],
        currentCurrency: '',
        currentCrypto: '',
    }
    saveUser(user_id, user);
    return getUser(user_id);
}

export const addUserMessage = (ctx, message) => {
    const user = getUser(ctx.user.id);
    user.messages.push(message);
    ctx.user = user;
}

export const clearMessages = async (ctx) => {
    const user = getUser(ctx.user.id);
    try {
        await Promise.all(user.messages.map(msg => ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id)));
        user.messages = [];
        ctx.user = user;

    } catch (error) {
        console.log(error);
    }
}

export const deleteLastMessage = async (ctx) => {
    const user = getUser(ctx.user.id);
    const lastMessage = user.messages.pop();
    if (!lastMessage) return;

    try {        
        await ctx.telegram.deleteMessage(ctx.chat.id, lastMessage.message_id);
        ctx.user = user;
    } catch (error) {
        console.log(error);
    }
}

export const changeLocale = (ctx, locale) => {
    const user = getUser(ctx.user.id);
    user.locale = locale;
    ctx.user = user;
}

export const updateCurrentCrypto = (ctx, currentCrypto) => {
    const user = getUser(ctx.user.id);
    user.currentCrypto = currentCrypto;
    ctx.user = user;
}

export const updateCurrentCurrency = (ctx, currentCurrency) => {
    const user = getUser(ctx.user.id);
    user.currentCurrency = currentCurrency;
    ctx.user = user;
}