import http from "http";
import {Server, Socket} from "socket.io";
import {log} from "./helpers/log";

export default class Websocket {
    private io: Server;

    constructor(server: http.Server) {
        this.io = new Server(server, {
            path: "/wss"
        });
        this.io.on("connection", Websocket.onConnection)
    }

    private static onConnection(ws: Socket) {
        log.debug("ws: new connection")

        ws.on("ping", (msg: string) => {
            ws.emit("pong", msg)
        })
    }
}