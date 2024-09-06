//const { updateUser } = require("./controller");

const getUsers = "SELECT * FROM users WHERE role = 'student'";
const getDoctors = "SELECT * FROM users WHERE role = 'doctor'";
const getUserById = 'SELECT * FROM users WHERE "UID" = $1';
const checkEmailExists = "SELECT u FROM users u WHERE u.email = $1"; 
//const addUser = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)";
const addStudent = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, 'student', $4)";
const addDoctor = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, 'doctor', $4)";

const removeUser = 'DELETE FROM users WHERE "UID" = $1';

//const updateUser = "UPDATE users SET username = $1 WHERE UID = $2";
const generateUpdateQuery = (table, updates, idField = 'UID') => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    const query = `UPDATE ${table} SET ${setClause} WHERE "${idField}" = $${fields.length + 1}`;

    console.log('Generated Query:', query);
    console.log('Values:', values);

    return { query, values };
};


//courses
const getCourses = "SELECT * FROM courses ";
const addCourse = "INSERT INTO courses (code, name, description) VALUES ($1, $2, $3)";
const getCourseByName = "SELECT * FROM courses WHERE neme = $1";
const getCourseById = "SELECT * FROM courses WHERE cid = $1";
const getCourseBycode= "SELECT * FROM courses WHERE code = $1";
const removeCourse = "DELETE FROM courses WHERE cid = $1";

const generateUpdateCourseQuery = (table, updates, idField = 'cid') => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }

    // Dynamically construct the SET clause
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const query = `UPDATE ${table} SET ${setClause} WHERE ${idField} = $${fields.length + 1}`;

    // Return the query and the values array including the ID at the end
    return { query, values };
};


module.exports = {
    getUsers,
    getDoctors,
    getUserById,
    checkEmailExists,
    //addUser,
    addStudent,
    addDoctor,
    removeUser,
    //updateUser,
    generateUpdateQuery,
    //courses
    getCourseById,
    getCourses,
    getCourseBycode,
    getCourseByName,
    addCourse,
    removeCourse,
   generateUpdateCourseQuery,
};