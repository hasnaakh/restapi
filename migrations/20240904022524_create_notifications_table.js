/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('notifications', function(table) {
        table.increments('NID').primary();
        table.integer('UID').unsigned().references('UID').inTable('users').onDelete('CASCADE');
        table.text('message').notNullable();
        table.date('date');
        table.time('time');
        table.boolean('is_read').defaultTo(false);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notifications');
};
