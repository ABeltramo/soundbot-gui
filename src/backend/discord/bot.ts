import {Channel, Client, VoiceChannel} from "discord.js";
import {log} from "../helpers/log";
import {env} from "../helpers/env";
import * as db from "../db/channels"
import {SoundData} from "../db/sounds";

export class DiscordBot {

    private client = new Client().on('ready', () => {
        log.info("Discord bot online")
    }).on("channelCreate", async (channel) => {
        if (channel.type === "voice") {
            log.debug(`channelCreate event: ${channel.id}`)
            return db.setChannelData(DiscordBot.channelToData(channel))
        }
    }).on("channelDelete", async (channel) => {
        if (channel.type === "voice") {
            log.debug(`channelDelete event: ${channel.id}`)
            return db.removeChannelData(DiscordBot.channelToData(channel))
        }
    }).on("channelUpdate", async (prevChannel, newChannel) => {
        if (prevChannel.type === "voice") {
            log.debug(`channelUpdate event: ${prevChannel.id} -> ${newChannel.id}`)
            await db.removeChannelData(DiscordBot.channelToData(prevChannel))
            return db.setChannelData(DiscordBot.channelToData(newChannel))
        }
    })

    public async listen(): Promise<string> {
        return this.client.login(env.BOT_TOKEN)
    }

    private static channelToData(channel: Channel): db.ChannelData {
        const ch = channel as VoiceChannel
        return {
            channelId: ch.id,
            groupId: ch.guild.id,
            name: ch.name
        }
    }

    /**
     * On server join we fetch and locally save a list of all the voice channel available
     * only if this is not cached already
     */
    public async joinedServer(groupId: string): Promise<db.ChannelData[] | false> {
        const channels = await this.getVoiceChannels(groupId)
        if (channels.length === 0) {
            return this.refreshChannelsList(groupId)
        } else {
            return channels
        }
    }

    public async getVoiceChannels(groupId: string): Promise<db.ChannelData[]> {
        return db.getChannels(groupId)
    }

    /**
     * Start playing given sound in the selected channel
     */
    public async play(sound: SoundData, channel: db.ChannelData) {
        const discordChannel = await this.client.channels.fetch(channel.channelId) as VoiceChannel
        const connection = await discordChannel.join()
        return connection.play(sound.filename)
    }

    /**
     * Delete local cache and fetch channel list from Discord
     */
    public async refreshChannelsList(groupId: string): Promise<db.ChannelData[] | false> {
        let guild;

        try {
            guild = await this.client.guilds.fetch(groupId)
        } catch (e) {
            log.error("Exception thrown during guild fetch:", e)
            return false;
        }

        const channels = guild.channels.cache
        const voiceChannels = channels.filter((channel) => channel.type === "voice" && !channel.deleted)
        if (voiceChannels.size > 0) { // Only delete and refresh if we are able to fetch something
            await db.removeAllChannels(groupId)
            const addedChannels = voiceChannels.map(async (channel) => {
                const channelData: db.ChannelData = {
                    channelId: channel.id,
                    groupId: channel.guild.id,
                    name: channel.name
                }
                if (!await db.getChannelData(groupId, channelData.channelId)) {
                    await db.setChannelData(channelData)
                }
                return channelData
            })
            const retrievedChannels = (await Promise.all(addedChannels))
            log.debug("Retrieved voice channels:", retrievedChannels)
            return retrievedChannels
        } else {
            log.warn(`Unable to retrieve voice channels for ${groupId}, is the bot authorised?`)
            return false
        }
    }
}