import {Knex} from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('channels', (table) => {
        table.increments()
        table.string("name").notNullable()
        table.string("channelId").notNullable()
        table.string("groupId").notNullable()
        table.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('channels')
}

