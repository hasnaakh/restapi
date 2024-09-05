/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('UID').primary();
        table.string('username').notNullable();
        table.enu('role', ['admin', 'doctor', 'student']).notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('phone', 13);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
