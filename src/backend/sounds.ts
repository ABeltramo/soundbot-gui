import {env} from "./helpers/env";
import * as fs from "fs";
import * as path from "path";
import * as db from "./db/sounds"
import {SoundData} from "../common/soundInterface";

const baseFolder = path.resolve(env.SOUNDS_FOLDER);

export function getSoundFile({groupId, filename}: SoundData): string {
    return path.join(baseFolder, groupId, filename);
}

/**
 * Will copy tempFile into id/filename and populate local DB
 */
export async function addSoundFile(tempFile: string, {groupId, filename}: SoundData): Promise<SoundData> {
    const baseIdPath = path.join(baseFolder, groupId)
    if (!fs.existsSync(baseIdPath)) {
        fs.mkdirSync(baseIdPath, {recursive: true});
    }

    const fullPath = path.join(baseIdPath, filename)
    fs.copyFileSync(tempFile, fullPath);

    return db.setSoundData({
        filename,
        groupId,
        name: filename
    })
}
