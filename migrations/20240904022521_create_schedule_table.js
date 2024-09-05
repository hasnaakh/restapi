/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('schedule', function(table) {
        table.increments('SID').primary();
        table.integer('CID').unsigned().references('CID').inTable('courses').onDelete('CASCADE');
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
    return knex.schema.dropTableIfExists('schedule');
};
