import dotenv from "dotenv";
dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    LOG_CHAT_ID: process.env.LOG_CHAT_ID,
    CRYPTO_API_KEY: process.env.CRYPTO_API_KEY
}