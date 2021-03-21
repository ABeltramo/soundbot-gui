import express from 'express';
import {env} from "./helpers/env"
import {log} from "./helpers/log"
import DiscordOauth from "./discord/oauth"
import * as path from "path";
import http from "http";
import {emitter} from "./events";
import session from "express-session";

export class Http {
    private readonly app;
    private readonly server;
    private auth;
    private frontendPath = path.resolve("./src/frontend/build");
    public httpsession = session({
        secret: env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false
    })

    constructor(auth: DiscordOauth) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.auth = auth;

        // Middlewares
        this.app.use(this.loggerMiddleware)
        this.app.use(this.httpsession)
        this.app.use(auth.getMiddlewares())
        this.app.use(express.static(this.frontendPath, {index: false}));

        // Routes
        this.app.get("/", this.home)
        this.app.get("/app", this.authorized)
    }

    getServer() {
        return this.server;
    }

    start() {
        this.server.listen(env.PORT, () => {
            log.info(`Running on http://localhost:${env.PORT}`);
        });
        return this.server;
    }

    loggerMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        log.silly(`Received: ${req.method} on ${req.url}`)
        next()
    }

    home = (req: express.Request, res: express.Response) => {
        if (!this.auth.logged(req)) {
            this.auth.startAuth(req, res)
        } else {
            res.redirect("/app")
        }
    }

    authorized = (req: express.Request, res: express.Response) => {
        if (!this.auth.logged(req)) {
            log.warn("Access denied, ip:", req.ip)
            res.redirect("/")
            return;
        }
        // @ts-ignore
        const guildId = req.session.grant?.response.raw.guild.id;
        emitter.emit("user:login", guildId);
        // @ts-ignore
        req.session.groupId = guildId

        res.sendFile(this.frontendPath + "/index.html");
    }

}