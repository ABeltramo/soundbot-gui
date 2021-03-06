import {load} from 'ts-dotenv';
import crypto from "crypto"


const schema = {
    LOG_LEVEL: {
        type: String,
        default: "info"
    },
    PORT: {
        type: Number,
        default: 3000
    },
    ORIGIN: {
        type: String,
        default: "http://localhost:3000"
    },
    SOUNDS_FOLDER: {
        type: String,
        default: "./data/sounds"
    },
    DB_CLIENT: {
        type: ["mysql2", "sqlite3"],
        default: "sqlite3"
    },
    DB_SQLITE_FILENAME: {
        optional: true,
        type: String,
        default: "./data/db.sqlite"
    },
    DB_MYSQL_HOST: {
        optional: true,
        type: String,
    },
    DB_MYSQL_USER: {
        optional: true,
        type: String,
    },
    DB_MYSQL_PASSWORD: {
        optional: true,
        type: String,
    },
    DB_MYSQL_DATABASE: {
        optional: true,
        type: String,
    },
    SESSION_SECRET: {
        type: String,
        default: crypto.randomBytes(20).toString("hex")
    },
    COOKIE_DURATION_MINUTES: {
        type: Number,
        default: 7 * 24 * 60 // a week
    },
    OAUTH_KEY: String,
    OAUTH_SECRET: String,
    BOT_TOKEN: String,
    BOT_CHANNEL_LEAVE_TIMEOUT: {
        type: Number,
        default: 10 * 1000 // defaults to 10 seconds
    }
};

export const env = load(schema, "conf.env");