import * as sounds from "src/backend/db/sounds"
import {knex} from "src/backend/db/db"

beforeAll(async () => {
    await knex.migrate.down()
    await knex.migrate.up()
    return await knex.seed.run()
})

afterAll(async () => {
    await knex.destroy() // see https://github.com/facebook/jest/issues/3686#issuecomment-305454934
})

test('getSounds should return all sounds for a given groupId', async () => {
    let groupSounds = await sounds.getSounds("0123ABC")
    expect(groupSounds).toHaveLength(2)
    expect(groupSounds).toContainEqual({groupId: "0123ABC", filename: "pewpew.mp3", name: "Pew Pew"})
    expect(groupSounds).toContainEqual({groupId: "0123ABC", filename: "reloading.mp3", name: "Reloading"})

    groupSounds = await sounds.getSounds("GROUP2")
    expect(groupSounds).toHaveLength(1)
    expect(groupSounds).toContainEqual({groupId: "GROUP2", filename: "AComplexSound.mp3", name: "A very complex sound"})

    groupSounds = await sounds.getSounds("A non existent group")
    expect(groupSounds).toHaveLength(0)
})

test('getSoundData should return a single sound for a given groupId + filename combo', async () => {
    let sound = await sounds.getSoundData("0123ABC", "pewpew.mp3")
    expect(sound).toEqual({groupId: "0123ABC", filename: "pewpew.mp3", name: "Pew Pew"})

    sound = await sounds.getSoundData("0123ABC", "a non existing file")
    expect(sound).toBeUndefined()

    sound = await sounds.getSoundData("GROUP2", "pewpew.mp3")
    expect(sound).toBeUndefined()
})

test("set and remove sound data", async () => {
    const sound = {groupId: "GROUP2", filename: "atestfile.mp3", name: "A test file"}
    await sounds.setSoundData(sound)

    expect(await sounds.getSounds("GROUP2")).toHaveLength(2)
    expect(await sounds.getSounds("GROUP2")).toContainEqual(sound)

    await sounds.removeSoundData(sound)
    expect(await sounds.getSounds("GROUP2")).toHaveLength(1)
    expect(await sounds.getSounds("GROUP2")).toContainEqual({groupId: "GROUP2", filename: "AComplexSound.mp3", name: "A very complex sound"})

})