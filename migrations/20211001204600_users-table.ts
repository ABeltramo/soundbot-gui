import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.increments()
        table.string("userId").notNullable()
        table.string("name").notNullable()
        table.string("icon").notNullable()
        table.string("groupId").notNullable()

        table.integer('enterSound').unsigned()
        table.foreign('enterSound').references('id').inTable("Sounds")

        table.integer('leaveSound').unsigned()
        table.foreign('leaveSound').references('id').inTable("Sounds")

        table.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('users')
}

