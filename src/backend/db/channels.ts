import {knex} from "./db"

export type ChannelData = {
    groupId: string,
    channelId: string,
    name: string,
}

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

export async function removeAllChannels(groupId: string){
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