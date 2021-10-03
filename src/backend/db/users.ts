import { knex } from "./db"
import { UserData } from "../../common/userInterface";
import { emitter } from "../events";
import { getSoundById, getSoundsId } from "./sounds"

emitter.on("users:create", setUserData)
emitter.on("users:get:by-group", getUsers)
emitter.on("users:remove", removeUserData)
emitter.on("users:update", updateUserData)

interface UserDataDB {
    groupId: string,
    userId: string,
    name: string,
    icon: string,
    enterSound?: number,
    leaveSound?: number
}

/*
 * I'm doing the JOIN manually because I can't find a way to: 
 *  - do two joins to the same sound table
 *  - AND get back proper typescript UserData instead of just fields
 */

export async function joinSounds(user: UserDataDB): Promise<UserData> {
    const enterSound = user?.enterSound !== undefined ? await getSoundById(user?.enterSound) : undefined
    const leaveSound = user?.leaveSound !== undefined ? await getSoundById(user?.leaveSound) : undefined
    return {
        groupId: user.groupId,
        userId: user.userId,
        name: user.name,
        icon: user.icon,
        enterSound: enterSound,
        leaveSound: leaveSound
    }
}

export async function getSoundDB(user: UserData): Promise<UserDataDB> {
    const enterSound = user.enterSound !== undefined ? await getSoundsId(user.enterSound) : undefined
    const leaveSound = user.leaveSound !== undefined ? await getSoundsId(user.leaveSound) : undefined
    return {
        groupId: user.groupId,
        userId: user.userId,
        name: user.name,
        icon: user.icon,
        enterSound: enterSound,
        leaveSound: leaveSound
    }
}

export async function getUsers(groupId: string): Promise<UserData[]> {
    return knex<UserDataDB>('Users')
        .select("*")
        .where("groupId", groupId)
        .then((users) => Promise.all(users.map(joinSounds)))
}

export async function getUserData(groupId: string, userId: string): Promise<UserData | undefined> {
    return knex<UserDataDB>('Users')
        .select("*")
        .where("groupId", groupId)
        .andWhere("userId", userId)
        .first()
        .then(user => user !== undefined ? joinSounds(user) : undefined)
}

export async function setUserData(User: UserData): Promise<UserData> {
    await knex<UserDataDB>('Users')
        .insert(await getSoundDB(User))
    return User
}

export async function removeUserData(groupId: string, userId: string) {
    return knex<UserDataDB>('Users')
        .where("groupId", groupId)
        .andWhere("userId", userId)
        .delete()
}

export async function updateUserData(User: UserData, updated: UserData) {
    await knex<UserDataDB>('Users')
        .where('groupId', User.groupId)
        .andWhere("userId", User.userId)
        .update(await getSoundDB(updated))
    return updated
}