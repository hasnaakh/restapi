//const { updateUser } = require("./controller");

const getUsers = "SELECT * FROM users WHERE role = 'student'";
const getDoctors = "SELECT * FROM users WHERE role = 'doctor'";
const getUserById = 'SELECT * FROM users WHERE "UID" = $1';
const checkEmailExists = "SELECT u FROM users u WHERE u.email = $1"; 
const getnots ="SELECT * FROM notifications"; 
 //const addUser = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)";
const addStudent = "INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, 'student', $4)";
const addDoctor = 'INSERT INTO users (username, email, password, role, phone) VALUES ($1, $2, $3, \'doctor\', $4) RETURNING "UID"';
const addDoctorDetails = 'INSERT INTO doctors ("UID", photo, department, contact_info) VALUES ($1, $2, $3, $4)';
const getDoctorDetails = `
    SELECT d."DID", u.*, d."photo", d."department", d."contact_info"
    FROM users u
    JOIN doctors d ON u."UID" = d."UID"
    WHERE u."role" = 'doctor';`

const removeUser = 'DELETE FROM users WHERE "UID" = $1';
//const removeDoctorDetails = 'DELETE FROM doctors WHERE "UID" = $1';


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
const getCourseById = 'SELECT * FROM courses WHERE "CID" = $1';
const getCourseByCode= "SELECT * FROM courses WHERE code = $1";
const removeCourse = 'DELETE FROM courses WHERE "CID" = $1';
const getCourseDocById = `
SELECT
    c."CID",
    c.name AS course_name,
    c.code AS course_code,
    c.description AS description,
    STRING_AGG(DISTINCT u.username, ', ') AS doctor_names
FROM schedule s
JOIN courses c ON s."CID" = c."CID"
JOIN doctors d ON s."DID" = d."DID"
JOIN users u ON d."UID" = u."UID"
WHERE c."CID" = $1 
GROUP BY c."CID", c.name, c.code, c.description;

`; 
 
const getDoctorCourById = `SELECT
    d."DID", 
    d.photo AS photo, 
    d.department AS department, 
    d.contact_info AS contact_info, 
    u.username AS doctor_name,
    STRING_AGG(DISTINCT c.name, ', ') AS courses_names
FROM schedule s 
JOIN courses c ON s."CID" = c."CID"
JOIN doctors d ON s."DID" = d."DID"
JOIN users u ON d."UID" = u."UID"
WHERE d."DID" = $1 
GROUP BY d."DID", d.photo, d.department, d.contact_info, u.username`;


const generateUpdateCourseQuery = (table, updates, idField = "CID") => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }

    // Dynamically construct the SET clause with double quotes around field names
    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    const query = `UPDATE ${table} SET ${setClause} WHERE "${idField}" = $${fields.length + 1}`;

    console.log('Generated Query:', query);
    console.log('Values:', values);

    return { query, values };
};


const getSchedules = `
    SELECT
    s."SID" As sid,
    c.name AS course_name,
    s.start_time AS start_date,
    s.end_time AS end_date,
    s.day As day,
    s.location As location,
    u.username AS doctor_name
    FROM
        schedule s
    JOIN
        courses c ON s."CID" = c."CID"
    JOIN
        doctors d ON s."DID" = d."DID"
    JOIN
        users u ON d."UID" = u."UID";

`;

const checkScheduleConflict = `
    SELECT 1 FROM schedule
    WHERE ("DID" = $1 AND "day" = $2 AND 
           ($3::time, $4::time) OVERLAPS ("start_time", "end_time"))
    OR ("location" = $5 AND "day" = $2 AND 
        ($3::time, $4::time) OVERLAPS ("start_time", "end_time"));
`;


const insertSchedule = `
    INSERT INTO schedule ("CID", "DID", "day", "start_time", "end_time", "location") 
    VALUES ($1, $2, $3, $4::time, $5::time, $6) RETURNING *;
`;

const removeSchedule = 'DELETE FROM schedule WHERE "SID" = $1';
const getScheduleById = 'SELECT * FROM schedule WHERE "SID" = $1';
 const getDoctorDetailsById= 'SELECT * FROM doctors WHERE "UID" = $1';  // Ensure this is not null or undefined

module.exports = {
    getUsers,
    getDoctors,
    getUserById,
    checkEmailExists,
    //addUser,
    addStudent,
    addDoctor,
    addDoctorDetails,
    getDoctorDetails,
    removeUser,
    //removeDoctorDetails,
    //updateUser,
    generateUpdateQuery,
    //courses
    getCourseById,
    getCourseDocById,
    // getDoctorCourById,
    getCourses,
    getCourseByCode,
    getCourseByName,
    addCourse,
    removeCourse,
   generateUpdateCourseQuery,
   getSchedules,
   checkScheduleConflict,
    insertSchedule,
    removeSchedule,
    getScheduleById,
    getnots,
    getDoctorDetailsById,
    getDoctorCourById    


     
};