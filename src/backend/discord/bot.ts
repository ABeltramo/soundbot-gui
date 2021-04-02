import {Channel, Client, VoiceChannel, VoiceConnection} from "discord.js";
import {log} from "../helpers/log";
import {env} from "../helpers/env";
import {ChannelData} from "../../common/channelInterface";
import {SoundData} from "../../common/soundInterface";
import {emitter} from "../events";
import {GroupData} from "../../common/serverInterface";

export class DiscordBot {

    private cache: Map<string, VoiceConnection> = new Map()
    private client = new Client()

    constructor() {
        this.client.on('ready', () => {
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
        }).on("debug", (e) => log.silly(e))
            .on("warn", (e) => log.warn(e))
            .on("error", (e) => log.error(e))

        emitter.on("servers:joined", (groupData) => {
            return this.onServerJoined(groupData)
        })

        emitter.on("sound:play", async (sound, channel) => {
            return this.play(sound, channel)
        })

        emitter.on("bot:leave", (channelData: ChannelData) => {
            const channel = this.cache.get(channelData.groupId)
            if (channel) {
                channel.disconnect()
            }
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
     * On group selection we fetch and locally save a list of all the voice channel available
     * only if this is not cached already
     */
    public async onServerJoined({groupId}: GroupData): Promise<ChannelData[] | false> {
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
        const connection = await this.getConnection(channel).catch((error) => {
            log.warn(`Unable to get connection for channel, message: ${error.message}`, channel)
        })
        if (connection) {
            const [, soundFile] = await emitter.emitAsync("sounds:get:sound-file", sound)

            const stream = connection.play(soundFile)

            stream.on("error", log.error)
            stream.on("finish", () => {
                emitter.emit("sound:finished", sound, channel)
            })
        }
    }

    private async getConnection(channel: ChannelData): Promise<VoiceConnection> {
        const connection = this.cache.get(channel.groupId)
        if (!connection) {
            return this.channelConnect(channel)
        } else {
            if (connection.channel.id === channel.channelId) {
                return connection
            } else {
                this.cache.delete(channel.groupId)
                return this.channelConnect(channel)
            }
        }
    }

    private async channelConnect(channel: ChannelData): Promise<VoiceConnection> {
        log.debug("Connecting to channel: ", channel.channelId)

        const discordChannel = await this.client.channels.fetch(channel.channelId) as VoiceChannel
        const newConnection = await discordChannel.join()

        newConnection.on("closing", () => {
            this.cache.delete(channel.groupId)
            log.debug("Disconnecting from channel: ", channel.channelId)
        })

        this.cache.set(channel.groupId, newConnection)
        return newConnection
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