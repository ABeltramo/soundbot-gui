import { Channel, Client, Guild, GuildMember, VoiceChannel, VoiceConnection } from "discord.js";
import { log } from "../helpers/log";
import { env } from "../helpers/env";
import { ChannelData } from "../../common/channelInterface";
import { SoundData } from "../../common/soundInterface";
import { emitter } from "../events";
import { GroupData } from "../../common/serverInterface";
import { UserData } from "src/common/userInterface";

export class DiscordBot {

    private cache: Map<string, VoiceConnection> = new Map()
    private client = new Client()

    constructor() {
        this.client
            .on('ready', () => {
                log.info("Discord bot online")
            })
            // Channels
            .on("channelCreate", async (channel) => {
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
            // Users
            .on('guildMemberAdd', async member => {
                log.debug(`${member.displayName} is joining the party @ ${member.guild.name}`)
                const groupId = member.guild.id
                const pmember = this.memberToUser(groupId, member)
                const [, usersDB]: Array<UserData[]> = await emitter.emitAsync("users:get:by-group", groupId)
                this.addOrUpdateUser(usersDB, pmember)
            }).on('guildMemberRemove', async member => {
                log.debug(`${member.displayName} is leaving the group ${member.guild.name}`)
                emitter.emitAsync("users:remove", member.guild.id, member.id)
            }).on('voiceStateUpdate', async (oldState, newState) => {
                const groupId = newState.guild.id
                if (newState.member !== null) {
                    const member = await this.memberToUser(groupId, newState.member)
                    const channel = {
                        groupId: groupId,
                        channelId: newState.channelID ? newState.channelID : oldState.channelID,
                        name: "" // TODO
                    }
                    const isEntering = oldState.channelID !== newState.channelID && newState.channelID !== null && oldState.channelID == null
                    const isLeaving = oldState.channelID !== newState.channelID && oldState.channelID !== null && newState.channelID == null
                    if (isEntering && member.enterSound !== undefined) {
                        emitter.emitAsync("sound:play", member.enterSound, channel)
                    } else if (isLeaving && member.leaveSound !== undefined) {
                        emitter.emitAsync("sound:play", member.enterSound, channel)
                    }
                    log.debug(`Voice state update:`, { entering: isEntering, leaving: isLeaving, member: member, channel: channel })
                }
            })
            // Logging
            .on("debug", (e) => log.silly(e))
            .on("warn", (e) => log.warn(e))
            .on("error", (e) => log.error(e))

        emitter.on("servers:joined", (groupData) => {
            this.onServerJoined(groupData)
            this.refreshUserList(groupData.groupId)
        })

        emitter.on("sound:play", async (sound, channel) => {
            return this.play(sound, channel)
        })

        emitter.on("servers:refresh:users", (groupData) => {
            return this.refreshUserList(groupData.groupId)
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
    public async onServerJoined({ groupId }: GroupData): Promise<ChannelData[] | false> {
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


    private getGuild(groupId: string): Promise<Guild> {
        return this.client.guilds.fetch(groupId)
    }

    public async refreshUserList(groupId: string): Promise<UserData[]> {
        const guild = await this.getGuild(groupId)
        const remoteMembers = await guild.members.fetch() // THIS NEEDS THE FLAG "Server Members Intent" in the developer setting page
        const members = remoteMembers.map(m => this.memberToUser(groupId, m))
        const [, usersDB]: Array<UserData[]> = await emitter.emitAsync("users:get:by-group", groupId)
        const updatedMembers = members.map(pmember => this.addOrUpdateUser(usersDB, pmember))
        // TODO: delete users that are not present anymore
        const fullMembers = await Promise.all(updatedMembers)
        log.debug(`Fetched members for ${groupId}:`, fullMembers)
        return fullMembers
    }

    public async addOrUpdateUser(usersDB: UserData[], pMember: Promise<UserData>) {
        const remoteMember = await pMember;
        const cachedUser = usersDB.find(user => user.userId == remoteMember.userId)
        if (cachedUser == undefined) {
            await emitter.emitAsync("users:create", remoteMember)
            return remoteMember
        } else {
            remoteMember.enterSound = cachedUser.enterSound
            remoteMember.leaveSound = cachedUser.leaveSound
            const [, updatedMember]: Array<UserData> = await emitter.emitAsync("users:update", cachedUser, remoteMember)
            return updatedMember
        }
    }

    /**
     * Turns a Discord GuildMember into a UserData
     */
    private async memberToUser(groupId: string, member: GuildMember): Promise<UserData> {
        const fullUser = await this.client.users.fetch(member.id)
        const avatar = fullUser.avatarURL()
        return {
            groupId: groupId,
            userId: member.id,
            name: member.displayName,
            icon: avatar ? avatar : member.user.defaultAvatarURL,
        }
    }

    /**
     * Delete local cache and fetch channel list from Discord
     */
    public async refreshChannelsList(groupId: string): Promise<ChannelData[]> {
        const guild = await this.getGuild(groupId)
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
                await emitter.emitAsync("channel:create", channelData)
                return channelData
            })
            const retrievedChannels = (await Promise.all(addedChannels))
            log.debug("Retrieved voice channels:", retrievedChannels)
            return retrievedChannels
        } else {
            log.warn(`Unable to retrieve voice channels for ${groupId}, is the bot authorised?`)
            return []
        }
    }
}