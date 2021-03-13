import {Logger, TLogLevelName} from "tslog";
import {env} from "./env";

export const log: Logger = new Logger({
    minLevel: env.LOG_LEVEL as TLogLevelName,
    displayFunctionName: false,
    dateTimePattern: "month-day hour:minute:second",
    maskValuesOfKeys: ["OAUTH_KEY", "OAUTH_SECRET"]
});