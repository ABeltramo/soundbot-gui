import express from 'express';
import session from 'express-session'
import grant from 'grant'
import {env} from "./helpers/env"
import {log} from "./helpers/log"

const app = express()

app.listen(env.PORT, () => {
    log.info(`Running on http://localhost:${env.PORT} with the following env:`, env);
});

app.use((req, res, next) => {
    log.debug(`Received: ${req.method} on ${req.url}`)
    next()
})

app.use(session({
    secret: 'grant',
    saveUninitialized: true,
    resave: false
}))
app.use(grant.express({
    "defaults": {
        "origin": env.ORIGIN,
        "transport": "session",
        "state": true,
    },
    "discord": {
        "key": env.OAUTH_KEY,
        "secret": env.OAUTH_SECRET,
        "callback": "/authorized",
        "scope": ["bot"]
    }
}))

/**
 * Returns true if the current session contains a logged user
 */
function logged(ses: any): boolean {
    return ses?.grant &&
        ses.grant?.response &&
        ses.grant?.response?.error === undefined;
}

app.get('/', (req, res) => {
    if (!logged(req.session)) {
        res.redirect("/connect/discord/")
    } else {
        res.redirect("/authorized")
    }
});


app.get('/authorized', (req, res) => {
    // @ts-ignore
    if (!logged(req.session)) {
        // @ts-ignore
        log.error("Access denied, session:", req.session?.grant)
        // @ts-ignore
        res.end(`Access denied: ${req.session?.grant?.response?.error_description}`)
        return;
    }

    res.end(`User: ${JSON.stringify(req.session)}`)
})