import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("users").del();

    // Inserts seed entries
    await knex("users").insert([
        { id: 1, userId: "123456", groupId: "0123ABC", name: "ABeltramo", icon: "123.jpg" },
        { id: 2, userId: "123456", groupId: "821126732878708817", name: "ABeltramo", icon: "123.jpg", enterSound: 3 },

        {
            id: 3,
            userId: "0000",
            groupId: "821126732878708817",
            name: "Claudio Bisio",
            icon: "https://upload.wikimedia.org/wikipedia/commons/1/18/Claudio_Bisio_2009.jpg",
            enterSound: 4,
            leaveSound: 5
        }
    ]);
}
