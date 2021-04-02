import {emitter} from "./events";
import {SoundData} from "../common/soundInterface";
import {ChannelData} from "../common/channelInterface";
import {env} from "./helpers/env";

interface QueueManager {
    currentlyPlaying?: boolean
}

const queue = new Map<string, QueueManager>()

emitter.on("sound:play", async (sound: SoundData, channel: ChannelData) => {
    queue.set(channel.groupId, {
        currentlyPlaying: true
    })
})

emitter.on("sound:finished", async (sound: SoundData, channel: ChannelData) => {
    queue.set(channel.groupId, {
        currentlyPlaying: false
    })

    setTimeout(async () => {
        const manager = queue.get(channel.groupId)
        if (manager && !manager.currentlyPlaying) {
            emitter.emit("bot:leave", channel)
            queue.delete(channel.groupId)
        }
    }, env.BOT_CHANNEL_LEAVE_TIMEOUT)
})