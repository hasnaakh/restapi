//const { updateUser } = require("./controller");

const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE UID = $1";
const checkEmailExists = "SELECT u FROM users u WHERE u.email = $1"; 
const addUser = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)";
const removeUser = "DELETE FROM users WHERE UID = $1";
const updateUser = "UPDATE users SET username = $1 WHERE UID = $2";

module.exports = {
    getUsers,
    getUserById,
    checkEmailExists,
    addUser,
    removeUser,
    updateUser,
};