import Knex from "knex"
import {env} from "../helpers/env"
import {log} from "../helpers/log";

const connections = {
    "sqlite3": {
        filename: env.DB_SQLITE_FILENAME
    },
    "mysql2": {
        host: env.DB_MYSQL_HOST,
        user: env.DB_MYSQL_USER,
        password: env.DB_MYSQL_PASSWORD,
        database: env.DB_MYSQL_DATABASE
    }
}

export const connSetting = {
    client: env.DB_CLIENT,
    // @ts-ignore
    connection: connections[env.DB_CLIENT],
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