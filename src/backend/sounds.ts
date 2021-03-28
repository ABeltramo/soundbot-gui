import {env} from "./helpers/env";
import * as fs from "fs";
import * as path from "path";
import {SoundData} from "../common/soundInterface";
import {emitter} from "./events";
import {log} from "./helpers/log";

emitter.on("sounds:get:sound-file", getSoundFile)
emitter.on("user:login", initAndImportSoundFiles)

const baseFolder = path.resolve(env.SOUNDS_FOLDER);

export function getSoundFile({groupId, filename}: SoundData): string {
    return path.join(baseFolder, groupId, filename);
}

/**
 *  Will setup the sound folder if not present and import all from the folder if not present in the db already
 */
export async function initAndImportSoundFiles(groupId: string) {
    const baseIdPath = path.join(baseFolder, groupId)
    if (!fs.existsSync(baseIdPath)) {
        fs.mkdirSync(baseIdPath, {recursive: true});
    }

    const [, registeredSounds] = await emitter.emitAsync("sounds:get:by-group", groupId)

    if (registeredSounds.length === 0) {
        log.debug(`${groupId} was not present in db, importing music files from disk`)

        fs.readdirSync(baseIdPath).forEach(filename => {
            emitter.emit("sounds:create", {
                filename,
                groupId,
                name: removeExtension(filename)
            })
        });
    }
}

function removeExtension(filename: string) {
    return path.parse(filename).name
}
