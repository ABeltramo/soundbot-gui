import DiscordOauth from "./discord/oauth";
import {Http} from "./http";
import Websocket from "./websocket";
import {DiscordBot} from "./discord/bot";
import "./db/channels"
import "./db/sounds"
import "./sound-files"
import "./sound-queue"
import "./ytdl"
import {emitter} from "./events"
import {log} from "./helpers/log";
import {env} from "./helpers/env";

async function start() {
    log.info("Loaded env:", env)
    const oAuth = new DiscordOauth();
    const bot = new DiscordBot()

    const httpServer = new Http(oAuth);
    new Websocket(httpServer, oAuth)

    await bot.listen()
    await httpServer.start()
    log.debug("Registered events:", emitter.eventNames())
}

start()