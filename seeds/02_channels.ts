import {Knex} from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("channels").del();

    // Inserts seed entries
    await knex("channels").insert([
        {id: 1, name: "Voice channel 1", channelId: "012345", groupId: "0123ABC"},
        {id: 2, name: "Voice channel 2", channelId: "000000", groupId: "0123ABC"},
        {id: 3, name: "Vox populi", channelId: "999", groupId: "GROUP2"},
    ]);
}
