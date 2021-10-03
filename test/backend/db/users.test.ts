import * as users from "src/backend/db/users"
import * as sounds from "src/backend/db/sounds"
import { knex } from "src/backend/db/db"

beforeAll(async () => {
    await knex.migrate.rollback({}, true)
    await knex.migrate.latest()
    return await knex.seed.run()
})

afterAll(async () => {
    await knex.destroy() // see https://github.com/facebook/jest/issues/3686#issuecomment-305454934
})

test('get users from DB joined with sounds', async () => {
    const groupUsers = await users.getUsers("821126732878708817")
    expect(groupUsers).toHaveLength(2)

    // Test a user with both sounds
    const user = await users.getUserData("821126732878708817", "0000")
    expect(user?.enterSound).toEqual({
        groupId: "821126732878708817",
        filename: "bgm.ogg",
        name: "Booooom!"
    })

    expect(user?.leaveSound).toEqual({
        groupId: "821126732878708817",
        filename: "launch.ogg",
        name: "A sound"
    })

    // Test a user with no sounds
    const user2 = await users.getUserData("0123ABC", "123456")
    expect(user2?.leaveSound).toBeUndefined()
    expect(user2?.enterSound).toBeUndefined()

    // Test a user with only one sound
    const user3 = await users.getUserData("821126732878708817", "123456")
    expect(user3?.leaveSound).toBeUndefined()
    expect(user3?.enterSound).toEqual({
        groupId: "GROUP2",
        filename: "AComplexSound.mp3",
        name: "A very complex sound"
    })
})


test('set/update users in DB', async () => {
    const user = {
        userId: "01234",
        groupId: "01234",
        name: "ABeltramo",
        icon: "123.jpg",
        leaveSound: await sounds.getSoundById(5)
    }

    expect(await users.getSoundDB(user)).toEqual({
        userId: "01234",
        groupId: "01234",
        name: "ABeltramo",
        icon: "123.jpg",
        leaveSound: 5
    })

    const insertedUser = await users.setUserData(user)
    expect(insertedUser).toEqual(user)
    expect(await users.getUserData(user.groupId, user.userId))
        .toEqual(user)

    const updatedUser = {
        userId: "01234",
        groupId: "01234",
        name: "ABeltramo",
        icon: "123.jpg",
        leaveSound: await sounds.getSoundById(5),
        enterSound: await sounds.getSoundById(6)
    }
    await users.updateUserData(user, updatedUser)
    expect(await users.getUserData(user.groupId, user.userId))
        .toEqual(updatedUser)

    await users.removeUserData(updatedUser.groupId, updatedUser.userId)
    expect(await users.getUserData(user.groupId, user.userId))
        .toBeUndefined()
})