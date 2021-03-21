import {knex} from "./db"
import {emitter} from "../events";

export type ChannelData = {
    groupId: string,
    channelId: string,
    name: string,
}

emitter.on("channel:create", setChannelData)
emitter.on("channel:delete", removeChannelData)
emitter.on("channel:delete:all", removeAllChannels)
emitter.on("channel:get:by-group", getChannels)
emitter.on("channel:get:by-channel", getChannelData)
emitter.on("channel:update", async (prevChannel, newChannel) => {
    await removeChannelData(prevChannel)
    return setChannelData(newChannel)
})

export async function getChannels(groupId: string): Promise<ChannelData[]> {
    return knex<ChannelData>('channels')
        .select("groupId", "channelId", "name")
        .where("groupId", groupId)
}

export async function getChannelData(groupId: string, channelId: string): Promise<ChannelData | undefined> {
    return knex<ChannelData>('channels')
        .select("groupId", "channelId", "name")
        .where("groupId", groupId)
        .andWhere("channelId", channelId)
        .first()
}

export async function setChannelData(channel: ChannelData): Promise<ChannelData> {
    await knex<ChannelData>('channels').insert(channel)
    return channel
}

export async function removeAllChannels(groupId: string) {
    return knex<ChannelData>('channels')
        .select("groupId", "channelId", "name")
        .where("groupId", groupId)
        .delete()
}

export async function removeChannelData(channel: ChannelData): Promise<ChannelData> {
    return knex<ChannelData>('channels')
        .where("groupId", channel.groupId)
        .andWhere("channelId", channel.channelId)
        .delete()
}