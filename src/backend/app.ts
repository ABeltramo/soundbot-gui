import DiscordOauth from "./discord/oauth";
import Http from "./http";
import Websocket from "./websocket";
import {DiscordBot} from "./discord/bot";

const oAuth = new DiscordOauth();
const bot = new DiscordBot()

const httpServer = new Http(oAuth, bot);
const wss = new Websocket(httpServer.getServer())


bot.listen()

httpServer.start()