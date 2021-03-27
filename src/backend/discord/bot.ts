import {Channel, Client, VoiceChannel} from "discord.js";
import {log} from "../helpers/log";
import {env} from "../helpers/env";
import {ChannelData} from "../../common/channelInterface";
import {SoundData} from "../../common/soundInterface";
import {emitter} from "../events";
import {getSoundFile} from "../sounds";

export class DiscordBot {

    private client = new Client().on('ready', () => {
        log.info("Discord bot online")
    }).on("channelCreate", async (channel) => {
        if (channel.type === "voice") {
            emitter.emit("channel:create", DiscordBot.channelToData(channel))
        }
    }).on("channelDelete", async (channel) => {
        if (channel.type === "voice") {
            emitter.emit("channel:delete", DiscordBot.channelToData(channel))
        }
    }).on("channelUpdate", async (prevChannel, newChannel) => {
        if (prevChannel.type === "voice") {
            emitter.emit("channel:update", DiscordBot.channelToData(prevChannel), DiscordBot.channelToData(newChannel))
        }
    })

    constructor() {
        emitter.on("user:login", (groupId) => {
            return this.userLogin(groupId)
        })

        emitter.on("sound:play", async (sound, channel) => {
            return this.play(sound, channel)
        })
    }


    public async listen(): Promise<string> {
        return this.client.login(env.BOT_TOKEN)
    }

    private static channelToData(channel: Channel): ChannelData {
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
    public async userLogin(groupId: string): Promise<ChannelData[] | false> {
        const [, channels] = await emitter.emitAsync("channel:get:by-group", groupId)
        if (channels.length === 0) {
            return this.refreshChannelsList(groupId)
        } else {
            return channels
        }
    }

    /**
     * Start playing given sound in the selected channel
     */
    public async play(sound: SoundData, channel: ChannelData) {
        const discordChannel = await this.client.channels.fetch(channel.channelId) as VoiceChannel
        const connection = await discordChannel.join()
        const stream = connection.play(getSoundFile(sound))
        stream.on("error", log.error)
        stream.on("finish", () => {
            connection.disconnect()
        })
    }

    /**
     * Delete local cache and fetch channel list from Discord
     */
    public async refreshChannelsList(groupId: string): Promise<ChannelData[] | false> {
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
            await emitter.emitAsync("channel:delete:all", groupId)
            const addedChannels = voiceChannels.map(async (channel) => {
                const channelData: ChannelData = {
                    channelId: channel.id,
                    groupId: channel.guild.id,
                    name: channel.name
                }
                const [, channelExist] = await emitter.emitAsync("channel:get:by-channel", groupId, channelData.channelId)
                if (!channelExist) {
                    await emitter.emitAsync("channel:create", channelData)
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