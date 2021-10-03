import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('sounds', (table) => {
        table.increments()
        table.string("groupId").notNullable()
        table.string("filename").notNullable()
        table.string("name").notNullable()
        table.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('sounds')
}

