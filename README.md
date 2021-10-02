# soundbot
[![build Docker images](https://github.com/ABeltramo/soundbot-gui/actions/workflows/docker-hub-build.yml/badge.svg)](https://github.com/ABeltramo/soundbot-gui/actions/workflows/docker-hub-build.yml) [![Docker hub - abeltramo/cloudflare-ddns](https://img.shields.io/badge/docker-abeltramo%2Fsoundbot--gui-success)](https://hub.docker.com/repository/docker/abeltramo/soundbot-gui) [![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/abeltramo/soundbot-gui)](https://hub.docker.com/repository/docker/abeltramo/soundbot-gui/tags?page=1&ordering=last_updated)


A soundboard UI and a bot!

## Running

```
docker run \
    --name soundbot-gui \
    --port 3000:3000
    --env BOT_TOKEN=abcdefgh... \
    --env OAUTH_KEY=0123456789... \
    --env OAUTH_SECRET=abcdefgh... \
    ghcr.io/abeltramo/soundbot-gui
```

## Env variables

**TODO: to markdown**

```json
{
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
```

## Develop

I use Docker for development, you can also easily setup a local Node installation instead.

### Docker quick-start

First you'll need to setup secrets:

```
mkdir node_modules
```

Create file `.env` and set secrets variables: `BOT_TOKEN`, `OAUTH_KEY`, `OAUTH_SECRET`

Run it using
```
docker-compose build
docker-compose up
```

## Run tests:

```
docker run --env-file .env -v ${PWD}:/app -it ghcr.io/abeltramo/soundbot-gui npm run test
```