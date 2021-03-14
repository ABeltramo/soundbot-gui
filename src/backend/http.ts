import express from 'express';
import {env} from "./helpers/env"
import {log} from "./helpers/log"
import DiscordOauth from "./discord-oauth"
import * as path from "path";
import http from "http";

export default class Http {
    private readonly app;
    private readonly server;
    private auth;
    private frontendPath = path.resolve("./src/frontend/build");

    constructor(auth: DiscordOauth) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.auth = auth;

        // Middlewares
        this.app.use(this.loggerMiddleware)
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
            log.info(`Running on http://localhost:${env.PORT} with the following env:`, env);
        });
        return this.server;
    }

    loggerMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        log.debug(`Received: ${req.method} on ${req.url}`)
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
        res.sendFile(this.frontendPath + "/index.html");
    }

}