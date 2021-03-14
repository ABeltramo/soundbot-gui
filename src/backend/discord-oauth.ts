import grant from "grant";
import {env} from "./helpers/env";
import session from 'express-session'
import express from "express";

export default class DiscordOauth {
    private oauthMiddleware = grant.express({
        "defaults": {
            "origin": env.ORIGIN,
            "transport": "session",
            "state": true,
        },
        "discord": {
            "key": env.OAUTH_KEY,
            "secret": env.OAUTH_SECRET,
            "callback": "/app",
            "scope": ["bot"]
        }
    })

    private sessionMiddleware = session({
        secret: 'grant',
        saveUninitialized: true,
        resave: false
    })

    /**
     * Returns a list of middlewares needed for this Oauth class
     */
    public getMiddlewares() {
        return [
            this.sessionMiddleware,
            this.oauthMiddleware
        ]
    }

    /**
     * Starts authentication process
     */
    public startAuth(req: express.Request, res: express.Response) {
        res.redirect("/connect/discord/")
    }

    /**
     * Returns true if the current session contains a logged user
     */
    public logged(req: express.Request): boolean {
        // @ts-ignore
        return req.session?.grant && req.session.grant?.response && req.session.grant?.response?.error === undefined;
    }

}