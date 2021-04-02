import {Knex} from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("sounds").del();

    // Inserts seed entries
    await knex("sounds").insert([
        {id: 1, groupId: "0123ABC", filename: "pewpew.mp3", name: "Pew Pew"},
        {id: 2, groupId: "0123ABC", filename: "reloading.mp3", name: "Reloading"},
        {id: 3, groupId: "GROUP2", filename: "AComplexSound.mp3", name: "A very complex sound"},

        {id: 4, groupId: "821126732878708817", filename: "bgm.ogg", name: "Booooom!"},
        {id: 5, groupId: "821126732878708817", filename: "launch.ogg", name: "A sound"},
        {id: 6, groupId: "821126732878708817", filename: "bgm1.ogg", name: "Quack!"},
        {id: 7, groupId: "821126732878708817", filename: "launch1.ogg", name: "ooops"},
        {id: 8, groupId: "821126732878708817", filename: "bgm2.ogg", name: "thump"},
        {id: 9, groupId: "821126732878708817", filename: "launch2.ogg", name: "Do it!"},
        {id: 10, groupId: "821126732878708817", filename: "bgm3.ogg", name: "What are you waiting for?"},
        {id: 11, groupId: "821126732878708817", filename: "launch3.ogg", name: "just"},
        {id: 12, groupId: "821126732878708817", filename: "bgm4.ogg", name: "do"},
        {id: 13, groupId: "821126732878708817", filename: "launch4.ogg", name: "IT!"},
    ]);
}
