/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('contact', function(table) {
        table.increments('CID').primary(); // Contact ID
        table.string('name', 100).notNullable(); // Name of the sender
        table.string('email', 100).notNullable(); // Email of the sender
        table.string('subject', 255); // Subject of the message
        table.text('message').notNullable(); // Message body
        table.timestamp('created_at').defaultTo(knex.fn.now()); // Timestamp when the message was created
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('contact');
};
