const Pool = require("pg").Pool;

const pool = new Pool({
    user: "yomna",
    host: "localhost",
    database: "stestt",
    password: "123",
    port: 5432,
});

module.exports = pool;