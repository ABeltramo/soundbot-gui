import {Knex} from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("sounds").del();

    // Inserts seed entries
    await knex("sounds").insert([
        {id: 1, groupId: "0123ABC", filename: "pewpew.mp3", name: "Pew Pew"},
        {id: 2, groupId: "0123ABC", filename: "reloading.mp3", name: "Reloading"},
        {id: 3, groupId: "GROUP2", filename: "AComplexSound.mp3", name: "A very complex sound"},
    ]);
}
