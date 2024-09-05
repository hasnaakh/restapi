/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('courses', function(table) {
        table.increments('CID').primary();
        table.string('code', 10).notNullable().unique();
        table.string('name').notNullable();
        table.text('description');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('courses');
};
