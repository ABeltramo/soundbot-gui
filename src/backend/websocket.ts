import {Http} from "./http";
import {Server, Socket} from "socket.io";
import {log} from "./helpers/log";

export default class Websocket {
    private io: Server;

    constructor(server: Http) {
        this.io = new Server(server.getServer(), {
            path: "/wss"
        });
        this.io.on("connection", Websocket.onConnection)
        this.io.use((socket, next) => {
            // @ts-ignore
            server.httpsession(socket.request, {}, next)
        })
    }

    private static onConnection(ws: Socket) {
        log.silly("ws: new connection")

        // @ts-ignore
        const groupId = ws.request?.session?.groupId
        if (!groupId) {
            ws.send("Authentication failed")
            ws.disconnect(true)
            log.warn("Websocket authentication failed from address:", ws.handshake.address)
        }

        ws.on("ping", (msg: string) => {
            ws.emit("pong", msg)
        })
    }
}