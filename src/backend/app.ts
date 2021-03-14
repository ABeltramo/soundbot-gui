import DiscordOauth from "./discord-oauth";
import Http from "./http";
import Websocket from "./websocket";

const oAuth = new DiscordOauth();
const httpServer = new Http(oAuth);
const wss = new Websocket(httpServer.getServer())

httpServer.start()