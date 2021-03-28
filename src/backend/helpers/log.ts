import {Logger, TLogLevelName} from "tslog";
import {env} from "./env";
import {emitter} from "../events"

emitter.onAny((event, ...values) => {
    log.silly("Fired event:", event, values)
})

export const log: Logger = new Logger({
    minLevel: env.LOG_LEVEL as TLogLevelName,
    displayFunctionName: false,
    dateTimePattern: "month-day hour:minute:second",
    maskValuesOfKeys: ["OAUTH_KEY", "OAUTH_SECRET", "BOT_TOKEN", "SESSION_SECRET", "DB_MYSQL_PASSWORD", "DB_MYSQL_USER"]
});