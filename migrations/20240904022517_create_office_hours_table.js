/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('office_hours', function(table) {
        table.increments('OID').primary();
        table.integer('DID').unsigned().references('DID').inTable('doctors').onDelete('CASCADE');
        table.string('day', 10);
        table.time('start_time');
        table.time('end_time');
        table.string('location', 100);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('office_hours');
};
