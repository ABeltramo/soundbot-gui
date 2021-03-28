import grant from "grant";
import {env} from "../helpers/env";
import express from "express";

declare module "express-session" {
    interface Session {
        groupID?: string,
        grant?: {
            response?: {
                error?: string,
                raw?: {
                    guild?: {
                        id?: string
                    }
                }
            }
        }
    }
}

export default class Oauth {
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
            "scope": ["bot"],
        }
    })


    /**
     * Returns a list of middlewares needed for this Oauth class
     */
    public getMiddlewares() {
        return [
            this.oauthMiddleware
        ]
    }

    /**
     * Starts authentication process
     */
    public startAuth(req: express.Request, res: express.Response) {
        res.redirect("/connect/discord/")
    }

    public getGroupID(req: express.Request): string | undefined {
        if (req.session?.groupID) {
            return req.session.groupID
        }
        const first_login = req.session?.grant?.response?.error === undefined
        if (first_login) {
            const groupId = req.session?.grant?.response?.raw?.guild?.id;
            req.session.groupID = groupId
            req.session.grant = undefined
            return groupId
        }
    }

}