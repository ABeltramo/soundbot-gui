import {Http} from "./http";
import {Server, Socket} from "socket.io";
import {log} from "./helpers/log";
import {emitter} from "./events";
import Oauth from "./discord/oauth";
import {Session} from "express-session";
import {ResolvedGroup} from "../common/serverInterface";

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
            if (group.groupId) {
                emitter.emit("servers:selected", group)
            }
        })

        ws.on("songs:get?", async () => {
            const groupId = Websocket.getSelectedGroupId(ws)
            if (groupId) {
                const [, sounds] = await emitter.emitAsync("sounds:get:by-group", groupId)
                ws.emit("songs:get!", sounds)
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