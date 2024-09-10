/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('schedule', function(table) {
        table.increments('SID').primary(); // Schedule ID
        table.integer('CID').unsigned().references('CID').inTable('courses').onDelete('CASCADE'); // Course ID
        table.integer('DID').unsigned().references('DID').inTable('doctors').onDelete('CASCADE'); // Doctor ID
        table.string('day', 10).notNullable(); // Day of the week
        table.time('start_time').notNullable(); // Start time
        table.time('end_time').notNullable(); // End time
        table.string('location', 100).notNullable(); // Location of the schedule
        
        // Ensure that no doctor has overlapping schedules on the same day
        table.unique(['DID', 'day', 'start_time', 'end_time'], 'unique_doctor_schedule');

        // Ensure that no two events happen at the same location at the same time
        table.unique(['location', 'day', 'start_time', 'end_time'], 'unique_location_schedule');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('schedule');
};
