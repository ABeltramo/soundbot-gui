import {Http} from "./http";
import {Server, Socket} from "socket.io";
import {log} from "./helpers/log";
import {emitter} from "./events";
import Oauth from "./discord/oauth";
import {Session} from "express-session";
import {ResolvedGroup} from "../common/serverInterface";
import {SoundData} from "../common/soundInterface";
import {YTData} from "../common/ytInterface";

export default class Websocket {
    private io: Server;
    private auth: Oauth

    constructor(server: Http, auth: Oauth) {
        this.auth = auth
        this.io = new Server(server.getServer(), {
            path: "/wss"
        });
        this.io.on("connection", (socket) => this.onConnection(socket))
        this.io.use((socket, next) => {
            // @ts-ignore
            server.httpsession(socket.request, {}, next)
        })
    }

    private async onConnection(ws: Socket) {
        log.silly("ws: new connection")
        // @ts-ignore
        const servers = await this.auth.getServers(ws.request.session)
        if (!servers) {
            ws.send("Authentication failed")
            ws.disconnect(true)
            log.warn("Websocket authentication failed from address:", ws.handshake.address)
            return
        }

        ws.on("servers:get?", async () => {
            const ResolvedServers = await Promise.all(servers.map(async (group) => {
                const [, channels] = await emitter.emitAsync("channel:get:by-group", group.groupId)
                return {
                    ...group,
                    channels
                }
            }))

            ws.emit("servers:get!", {
                groups: ResolvedServers,
                selectedGroupId: Websocket.getSelectedGroupId(ws)
            })
        })

        ws.on("servers:select!", (group: ResolvedGroup) => {
            Websocket.setSelectedGroupId(ws, group.groupId)
        })

        ws.on("songs:get?", async () => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (groupId) {
                const [, sounds] = await emitter.emitAsync("sounds:get:by-group", groupId)
                ws.emit("songs:get!", sounds)
            }
        })

        ws.on("songs:update!", (original: SoundData, updated: SoundData) => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (original.groupId === groupId && updated.groupId === groupId) {
                emitter.emit("sounds:update", original, updated)
            }
        })

        ws.on("songs:remove!", (song: SoundData) => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if(song.groupId === groupId){
                emitter.emit("sounds:remove", song)
            }
        })

        emitter.on("sounds:create", (sound: SoundData) => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (sound.groupId === groupId) {
                ws.emit("songs:create!", sound)
            }
        })

        ws.on("channels:get?", async () => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (groupId) {
                const [, channels] = await emitter.emitAsync("channel:get:by-group", groupId)
                ws.emit("channels:get!", channels)
            }
        })

        ws.on("play!", async ({channelID, sound}) => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (groupId) {
                return emitter.emitAsync("sound:play", sound, {
                    groupId: Websocket.getSelectedGroupId(ws),
                    channelId: channelID,
                    name: "" // TODO
                })
            }
        })

        ws.on("download:yt?", async (name: string, ytData: YTData) => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (groupId) {

                // validate input
                if (!name || name.length === 0 || !ytData.url || ytData.url.length === 0) {
                    ws.emit("download:yt!", {error: true, msg: "Fill name and url fields"})
                    return
                }

                const [, result] = await emitter.emitAsync("download:yt", {
                    groupId,
                    name,
                }, ytData)

                if (!result) {
                    ws.emit("download:yt!", {error: true, msg: "Error during downloading, please try again later."})
                } else {
                    ws.emit("download:yt!", result)
                }
            }
        })
    }

    private static getSelectedGroupId(ws: Socket): string | undefined {
        // @ts-ignore
        return ws.request.session?.groupId
    }

    private static setSelectedGroupId(ws: Socket, groupId: string) {
        // @ts-ignore
        const session: Session = ws.request.session
        // @ts-ignore
        session.groupId = groupId
    }
}