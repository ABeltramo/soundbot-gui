import Knex from "knex"
import {env} from "../helpers/env"
import {log} from "../helpers/log";

export const connSetting = {
    client: env.DB_CLIENT,
    connection: {
        filename: env.DB_SQLITE_FILENAME // TODO: support other DB clients
    },
    log: {
        debug(message: string) {
            log.debug(message)
        },
        deprecate(message: string) {
            log.warn(message)
        },
        warn(message: string) {
            log.warn(message)
        },
        error(message: string) {
            log.error(message)
        }
    },
    useNullAsDefault: true
}

export const knex = Knex(connSetting)