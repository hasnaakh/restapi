/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('doctors', function(table) {
        table.increments('DID').primary();
        table.integer('UID').unsigned().references('UID').inTable('users').onDelete('CASCADE');
        table.string('photo');
        table.string('department', 100);
        table.string('contact_info');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('doctors');
};
