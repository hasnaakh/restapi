//const { updateUser } = require("./controller");

const getUsers = "SELECT * FROM users WHERE role = 'student'";
const getDoctors = "SELECT * FROM users WHERE role = 'doctor'";
const getUserById = "SELECT * FROM users WHERE UID = $1";
const checkEmailExists = "SELECT u FROM users u WHERE u.email = $1"; 
//const addUser = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)";
const addStudent = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, 'student', $4)";
const addDoctor = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, 'doctor', $4)";
const removeUser = "DELETE FROM users WHERE UID = $1";
const updateUser = "UPDATE users SET username = $1 WHERE UID = $2";

module.exports = {
    getUsers,
    getDoctors,
    getUserById,
    checkEmailExists,
    //addUser,
    addStudent,
    addDoctor,
    removeUser,
    updateUser,
};