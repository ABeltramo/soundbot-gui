import grant from "grant";
import {env} from "../helpers/env";
import {GroupData} from "../../common/serverInterface";
import got, {OptionsOfJSONResponseBody} from "got";
import {Session} from "express-session";

interface Guild {
    id: string,
    name: string,
    icon: string,
    owner: boolean,
    permissions: string,
    features: string[]
}

declare module "express-session" {
    interface Session {
        groups?: GroupData[]
        grant?: {
            response?: {
                error?: string,
                raw?: {
                    access_token: string
                    token_type: string
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
            "scope": ["guilds"],
            "overrides": {
                "bot": {
                    "scope": ["bot"]
                }
            }
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
    public authEndpoint() {
        return "/connect/discord/"
    }

    public async getServers(session: Session): Promise<GroupData[] | undefined> {
        const auth = session.grant?.response?.raw
        const cachedGuilds = session.groups
        if (cachedGuilds) {
            return cachedGuilds
        } else if (!auth) {
            return undefined
        } else {
            const opts: OptionsOfJSONResponseBody = {
                headers: {
                    "Authorization": auth.token_type + " " + auth.access_token
                },
                responseType: 'json'
            }
            const response = await got.get("https://discord.com/api/v8/users/@me/guilds", opts)
            const guilds = response.body as Guild[]
            const servers = guilds.map(guild => {
                return {
                    groupId: guild.id,
                    groupName: guild.name,
                    icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : undefined
                }
            })
            session.groups = servers // save back into session
            return servers
        }
    }
}