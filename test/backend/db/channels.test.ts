import * as channels from "src/backend/db/channels"
import {knex} from "src/backend/db/db"
import {emitter} from "src/backend/events";

beforeAll(async () => {
    await knex.migrate.rollback({}, true)
    await knex.migrate.latest()
    return await knex.seed.run()
})

afterAll(async () => {
    await knex.destroy() // see https://github.com/facebook/jest/issues/3686#issuecomment-305454934
})

describe("Testing db methods", () => {
    test("Get all channels for a given groupId", async () => {
        let groupChannels = await channels.getChannels("0123ABC")
        expect(groupChannels).toHaveLength(2)
        expect(groupChannels).toContainEqual({groupId: "0123ABC", name: "Voice channel 1", channelId: "012345"})
        expect(groupChannels).toContainEqual({groupId: "0123ABC", name: "Voice channel 2", channelId: "000000"})

        groupChannels = await channels.getChannels("GROUP2")
        expect(groupChannels).toHaveLength(1)
        expect(groupChannels).toContainEqual({groupId: "GROUP2", name: "Vox populi", channelId: "999"})

        expect(await channels.getChannels("A non existent group")).toHaveLength(0)
    })

    test("Get channel data for a single groupId + channelId combination", async () => {
        let channelData = await channels.getChannelData("0123ABC", "012345")
        expect(channelData).toEqual({groupId: "0123ABC", name: "Voice channel 1", channelId: "012345"})

        channelData = await channels.getChannelData("0123ABC", "A non existent channel ID")
        expect(channelData).toBeUndefined()

        channelData = await channels.getChannelData("A non existent group ID", "012345")
        expect(channelData).toBeUndefined()
    })

    test("Set and remove channel data", async () => {
        const channelData = {groupId: "0123ABC", name: "A name", channelId: "ChannelID"}

        await channels.setChannelData(channelData)
        expect(await channels.getChannelData(channelData.groupId, channelData.channelId)).toEqual(channelData)

        await channels.removeChannelData(channelData)
        expect(await channels.getChannelData(channelData.groupId, channelData.channelId)).toBeUndefined()

        await channels.removeAllChannels("0123ABC")
        expect(await channels.getChannels("0123ABC")).toHaveLength(0)
    })
})

describe("Testing events", () => {
    const exampleCh = {
        groupId: "0123ABC",
        name: "A name",
        channelId: "ChannelID"
    }

    test("channel:create", async () => {
        const [, result] = await emitter.emitAsync("channel:create", exampleCh)
        expect(result).toEqual(exampleCh)
    })

    test("channel:delete", async () => {
        const [, result] = await emitter.emitAsync("channel:delete", exampleCh)
        expect(result).toEqual(1)
    })

    test("channel:delete:all", async () => {
        await emitter.emitAsync("channel:create", exampleCh)
        await emitter.emitAsync("channel:create", exampleCh)
        const [, result] = await emitter.emitAsync("channel:delete:all", exampleCh.groupId)
        expect(result).toEqual(2)
    })

    test("channel:get:by-group", async () => {
        await emitter.emitAsync("channel:create", exampleCh)
        const [, result] = await emitter.emitAsync("channel:get:by-group", exampleCh.groupId)

        expect(result).toHaveLength(1)
        expect(result).toContainEqual(exampleCh)
    })

    test("channel:get:by-channel", async () => {
        await emitter.emitAsync("channel:create", exampleCh)
        const [, result] = await emitter.emitAsync("channel:get:by-channel", exampleCh.groupId, exampleCh.channelId)

        expect(result).toEqual(exampleCh)
    })

    test("channel:update", async () => {
        const updatedCh = {
            groupId: "UPDATED",
            name: "UPDATED",
            channelId: "UPDATED"
        }
        await emitter.emitAsync("channel:create", exampleCh)
        const [, result] = await emitter.emitAsync("channel:update", exampleCh, updatedCh)

        expect(result).toEqual(updatedCh)
    })
})
