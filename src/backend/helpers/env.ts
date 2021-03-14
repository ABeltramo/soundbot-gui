import {load} from 'ts-dotenv';

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
    OAUTH_KEY: String,
    OAUTH_SECRET: String
};

export const env = load(schema, "conf.env");