import {knex} from "./db"

export type SoundData = {
    groupId: string,
    filename: string,
    name: string
}

export async function getSounds(groupId: string): Promise<SoundData[]> {
    return knex<SoundData>('sounds')
        .select("groupId", "filename", "name")
        .where("groupId", groupId)
}

export async function getSoundData(groupId: string, filename: string): Promise<SoundData | undefined> {
    return knex<SoundData>('sounds')
        .select("groupId", "filename", "name")
        .where("groupId", groupId)
        .andWhere("filename", filename)
        .first()
}

export async function setSoundData(sound: SoundData): Promise<SoundData> {
    await knex<SoundData>('sounds')
        .insert(sound)
    return sound
}

export async function removeSoundData(sound: SoundData) {
    return knex<SoundData>('sounds')
        .where("groupId", sound.groupId)
        .andWhere("filename", sound.filename)
        .delete()
}