const pool = require('../../../db');
const queries = require('../queries');
const bcrypt = require('bcrypt'); //for hashing
const { userCreationSchema, userUpdateSchema } = require('../../../validators/userValidation');
const { doctorCreationSchema, doctorUpdateSchema  } = require('../../../validators/doctorValidation');
const jwt = require('jsonwebtoken');



const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).send('An error occurred while fetching users.');
        }
        res.status(200).json(results.rows);
    });
};

const getDoctors = (req, res) => {
    pool.query(queries.getDoctors, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getDoctorDetails = async (req, res) => {
    try {
        console.log('Executing query:', queries.getDoctorDetails);
        const result = await pool.query(queries.getDoctorDetails);
        
        if (result.rows.length === 0) {
            console.log('No doctor details found.');
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching doctor details:', error.message);
        res.status(500).send(`An error occurred while fetching doctor details: ${error.message}`);
    }
};


const getDoctorDetailsById = async (req, res) => {
    const doctorId = parseInt(req.params.did);  // Get doctor ID from the request params
    console.log('Fetching doctor details for ID:', doctorId);

    try {
        // Execute the query and pass the doctorId
        const result = await pool.query(queries.getDoctorDetailsById, [doctorId]);

        if (result.rows.length === 0) {
            console.log('No doctor details found.');
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Return doctor details in response
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        return res.status(500).json({ error: 'An error occurred while fetching doctor details' });
    }
};



const getUserById = (req, res) => {
    const UID = parseInt(req.params.UID);
    console.log('Executing query:', queries.getUserById, 'with params:', [UID]);
    pool.query(queries.getUserById, [UID], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send("An error occurred while fetching the user.");
            return;
        }
        res.status(200).json(results.rows);
    });
};

/*
const addUser = (req, res) => {
    const { username, email, password, role, phone } = req.body;
    //check if email exists
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        if (results.rows.length) {
            res.send("Email already exists.");
        }
        
        //add user to db
        pool.query(queries.addUser, [username, email, password, role, phone], (error, results) => {
            if (error) throw error;
            res.status(201).send("User Created Successfully!");
        });
    });
};*/
const addStudent = async (req, res) => {
    const { username, email, password, phone } = req.body;

    // Validate user input
    const { error } = userCreationSchema.validate({ username, email, password, phone, role: 'student' });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try 
    {
        const { rows } = await pool.query(queries.checkEmailExists, [email]);
        if (rows.length) {
            return res.status(400).send("Email already exists.");
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.query(queries.addStudent, [username, email, hashedPassword, phone]);
        res.status(201).send("Student Created Successfully!");
    } 
    catch (error) 
    {
        console.error('Error adding student:', error.message);
        res.status(500).send(`An error occurred while adding the student: ${error.message}`);
    }
};
  
const path = require('path');
const addDoctor = async (req, res) => {

    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",req);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",req.file);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",req.file.path);


    const { username, email, password, phone, department, contact_info } = req.body;
    const photo = req.file ? req.file.path : null;
    console.log("///////////////////",photo)

    // Validate user input
    const { error: userError } = userCreationSchema.validate({ username, email, password, phone, role: 'doctor' });
    if (userError) {
        return res.status(400).send(userError.details[0].message);
    }

    const { error: doctorError } = doctorCreationSchema.validate({ photo, department, contact_info });
    if (doctorError) {
        return res.status(400).send(doctorError.details[0].message);
    }

    try {
        const { rows } = await pool.query(queries.checkEmailExists, [email]);
        if (rows.length) {
            return res.status(400).send("Email already exists.");
        }

        // Hash the password
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log('Executing query:', queries.addDoctor);
        console.log('Parameters:', [username, email, hashedPassword, phone]);

        const userResult = await pool.query(queries.addDoctor, [username, email, hashedPassword, phone]);
        if (userResult.rows.length === 0) {
            throw new Error('Failed to retrieve UID from addDoctor query.');
        }
        console.log('User result:', userResult.rows);

        const UID = userResult.rows[0].UID; // Extract the UID of the newly inserted user

        console.log('UID retrieved:', UID);

        // Check if UID is valid
        if (!UID) {
            throw new Error('Invalid UID.');
        }

        console.log('Executing query:', queries.addDoctorDetails);
        console.log('Parameters:', [UID, photo, department, contact_info]);

        await pool.query(queries.addDoctorDetails, [UID, photo, department, contact_info]);

        //await client.query('COMMIT');
        //await pool.query(queries.addDoctor, [username, email, hashedPassword, phone]);
        res.status(201).send("Doctor Created Successfully!");
    } catch (error) {
        //await client.query('ROLLBACK');
        console.error('Error adding doctor:', error.message);
        res.status(500).send(`An error occurred while adding the doctor: ${error.message}`);
    }
};


const removeStudent = (req, res) => {
    const UID = parseInt(req.params.UID);

    pool.query(queries.getUserById, [UID], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send("An error occurred while fetching the user.");
            return;
        }

        const user = results.rows[0];
        if (!user || user.role !== 'student') {
            res.status(404).send("Student does not exist in the database.");
            return;
        }

        pool.query(queries.removeUser, [UID], (error, results) => {
            if (error) {
                console.error('Error removing student:', error);
                res.status(500).send("An error occurred while removing the student.");
                return;
            }
            res.status(200).send("Student removed successfully.");
        });
    });
};

const removeDoctor = (req, res) => {
    console.log("Received UID for deletion:", req.params.UID);
    const UID = parseInt(req.params.UID);

    pool.query(queries.getUserById, [UID], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send("An error occurred while fetching the user.");
            return;
        }

        const user = results.rows[0];
        if (!user || user.role !== 'doctor') {
            res.status(404).send("Doctor does not exist in the database.");
            return;
        }

        pool.query(queries.removeUser, [UID], (error, results) => {
            if (error) {
                console.error('Error removing doctor:', error);
                res.status(500).send("An error occurred while removing the doctor.");
                return;
            }
            res.status(200).send("Doctor removed successfully.");
        });
    });
};



const updateStudent = async (req, res) => {
    const UID = parseInt(req.params.UID);
    const { username, email, phone, password } = req.body;

    const { error } = userUpdateSchema.validate({ username, email, phone, password });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const { rows } = await pool.query(queries.getUserById, [UID]);
        const user = rows[0];
        
        if (!user || user.role !== 'student') {
            return res.status(404).send("Student does not exist in the database.");
        }

        //let updateFields = { username, email, phone };
        // Object to hold fields that need to be updated
        let updateFields = {};

        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;

        if (password && password.new) {
        if (password.current) {
            const match = await bcrypt.compare(password.current, user.password);
            if (!match) {
            return res.status(400).send('Current password does not match.');
            }
        }
        const saltRounds = 10;
        updateFields.password = await bcrypt.hash(password.new, saltRounds);
        }

        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).send("No valid fields provided for update.");
        }

        const { query, values } = queries.generateUpdateQuery('users', updateFields);
        values.push(UID);

        await pool.query(query, values);
        res.status(200).send("Student updated successfully.");
    } catch (error) {
        console.error('Error updating student:', error.message);
        res.status(500).send(`An error occurred while updating the student: ${error.message}`);
    }
};


const updateDoctor = async (req, res) => {
    const UID = parseInt(req.params.UID);
    console.log("##########################",req);
    console.log("##########################",req.params.UID);
    console.log("##########################",JSON.stringify(req.body) );

    const { username, email, phone, password, department, contact_info } = req.body;

    const photo = req.file ? req.file.path : null;

    const { error: userError } = userUpdateSchema.validate({ username, email, phone, password });
    if (userError) {
        return res.status(400).send(userError.details[0].message);
    }

    const { error: doctorError } = doctorUpdateSchema.validate({ photo, department, contact_info });
    if (doctorError) {
        return res.status(400).send(doctorError.details[0].message);
    }

    try {
        const { rows } = await pool.query(queries.getUserById, [UID]);
        const user = rows[0];
        
        if (!user || user.role !== 'doctor') {
            return res.status(404).send("Doctor does not exist in the database.");
        }

        let userUpdateFields = {};

        if (username) userUpdateFields.username = username;
        if (email) userUpdateFields.email = email;
        if (phone) userUpdateFields.phone = phone;

        if (password && password.new) {
            if (password.current) {
                const match = await bcrypt.compare(password.current, user.password);
                if (!match) {
                return res.status(400).send('Current password does not match.');
                }
            }
            const saltRounds = 10;
            userUpdateFields.password = await bcrypt.hash(password.new, saltRounds);
        }
        if (Object.keys(userUpdateFields).length > 0) {
            const { query: userQuery, values: userValues } = queries.generateUpdateQuery('users', userUpdateFields);
            userValues.push(UID);
            await pool.query(userQuery, userValues);
        }

        let doctorUpdateFields = {};
        if (photo) doctorUpdateFields.photo = photo;
        if (department) doctorUpdateFields.department = department;
        if (contact_info) doctorUpdateFields.contact_info = contact_info;

        if (Object.keys(doctorUpdateFields).length > 0) {
            const { query: doctorQuery, values: doctorValues } = queries.generateUpdateQuery('doctors', doctorUpdateFields, 'DID');
            doctorValues.push(UID);
            await pool.query(doctorQuery, doctorValues);
        }
        res.status(200).send('Doctor updated successfully.');
    }
      catch (error) {
          console.error('Error updating doctor:', error.message);
          res.status(500).send(`An error occurred while updating the doctor: ${error.message}`);
        }
};


//Courses
const getCourses = (req, res) => {
    pool.query(queries.getCourses, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getCourseById = (req, res) => {
    const cid = parseInt(req.params.cid);
    pool.query(queries.getCourseById, [cid], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getDoctorOfficeHours = (req, res) => {
    const did = req.params.did;

    pool.query(
        'SELECT * FROM office_hours WHERE "DID" = $1',
        [did],
        (error, results) => {
            if (error) {
                console.error('Error fetching office hours:', error);
                return res.status(500).send('An error occurred while fetching office hours.');
            }
            if (!results.rows.length) {
                return res.status(404).send('No office hours found.');
            }
            res.status(200).json(results.rows);
        }
    );
};

// In your router

const getCoursesById = (req, res) => {
    const cid = parseInt(req.params.cid);

    if (isNaN(cid)) {
        return res.status(400).send('Invalid course ID.');
    }

    pool.query(queries.getCourseDocById, [cid], (error, results) => {
        if (error) {
            console.error('Error fetching course by ID:', error);
            return res.status(500).send('An error occurred while fetching the course.');
        }

        if (!results.rows.length) {
            return res.status(404).send('Course not found.');
        }

        res.status(200).json(results.rows);
    });
};
const getDoctorCourById = (req, res) => {
    const did = req.params.did;

    if (isNaN(did)) {
        return res.status(400).json({ message: 'Invalid doctor ID.' });
    }

    console.log('Fetching doctor courses for ID:', did);
    
    pool.query(queries.getDoctorCourById, [did], (error, results) => {
        if (error) {
            console.error('Error fetching doctor by ID:', error);
            return res.status(500).json({ message: 'An error occurred while fetching the doctor.' });
        }

        if (!results.rows.length) {
            
            return res.status(404).json({ message: `Doctor not found.${did}` });
        }

        res.status(200).json(results.rows[0]); // Send the first row since there's one doctor
    });
};


const addCourse = (req, res) => {
    const { name, code, description } = req.body;

    // Validation: Check if any field is missing or just spaces
    if (!name || !code || !description || name.trim() === '' || code.trim() === '' || description.trim() === '') {
        return res.status(400).send('All fields (name, code, description) are required and cannot be empty.');
    }

    // Check if the course code already exists
    pool.query(queries.getCourseByCode, [code], (error, results) => {
        if (error) {
            console.error('Error checking course code:', error);
            return res.status(500).send('An error occurred while checking the course code.');
        }

        if (results.rows.length > 0) {
            return res.status(409).send('A course with this code already exists.');
        }

        
        pool.query(queries.addCourse, [code, name, description], (error, results) => {
            if (error) {
                console.error('Error adding course:', error);
                return res.status(500).send('An error occurred while adding the course.');
            }
            res.status(201).send('Course added successfully!');
        });
    });
};

const updateCourse = (req, res) => {
    const cid = parseInt(req.params.cid);
    const { name, code, description } = req.body;

    if (!name || !code || !description || name.trim() === '' || code.trim() === '' || description.trim() === '') {
        return res.status(400).send('All fields (name, code, description) are required and cannot be empty or just spaces.');
    }

    pool.query(queries.getCourseById, [cid], (error, results) => {
        if (error) {
            console.error('Error fetching course:', error);
            return res.status(500).send("An error occurred while fetching the course.");
        }

        const noCourseFound = !results.rows.length;
        if (noCourseFound) {
            return res.status(404).send("Course does not exist in the database.");
        }

        // Check if another course (with a different CID) has the same code
        pool.query(queries.getCourseByCode, [code], (error, codeResults) => {
            if (error) {
                console.error('Error checking course code:', error);
                return res.status(500).send("An error occurred while checking the course code.");
            }

            // Only prevent update if a different course has the same code
            if (codeResults.rows.length > 0 && codeResults.rows[0].CID !== cid) {
                return res.status(409).send('A course with this code already exists.');
            }

            // Proceed with updating the course
            const { query, values } = queries.generateUpdateCourseQuery('courses', { name, code, description });
            values.push(cid); 

            pool.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error updating course:', error);
                    return res.status(500).send("An error occurred while updating the course.");
                }
                res.status(200).send("Course updated successfully.");
            });
        });
    });
};


const removeCourse = (req, res) => {
    const cid = parseInt(req.params.cid);

    
    pool.query(queries.getCourseById, [cid], (error, results) => {
        if (error) {
            console.error('Error checking course existence:', error);
            return res.status(500).send('An error occurred while checking if the course exists.');
        }
        
        console.log('Results from getCourseById query:', results.rows); 
        const noCourseFound = !results.rows.length;
        if (noCourseFound) {
            return res.status(404).send('Course does not exist in the database.');
        }
    
        
        pool.query(queries.removeCourse, [cid], (error, results) => {
            if (error) {
                console.error('Error deleting course:', error);
                return res.status(500).send('An error occurred while removing the course.');
            }
    
            res.status(200).send('Course removed successfully.');
        });
    });
    
};


const checkScheduleConflict = async (DID, day, startTime, endTime, location) => {
    const result = await pool.query(queries.checkScheduleConflict, [DID, day, startTime, endTime, location]);
    return result.rowCount > 0;  
};

const addSchedule = async (req, res) => {
    const { DID, CID, day, startTime, endTime, location } = req.body;

    try {
        // Validate time format
        if (!/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(startTime) || !/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(endTime)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM:SS or HH:MM.' });
        }

        // Check for schedule conflict
        const conflict = await checkScheduleConflict(DID, day, startTime, endTime, location);

        if (conflict) {
            return res.status(400).json({ message: 'Schedule conflict detected!' });
        }

        
        const insertQuery = `
        INSERT INTO schedule ("CID", "DID", day, start_time, end_time, location) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

        
        console.log('Inserting schedule with values:', {
            CID,
            DID,
            day,
            startTime,
            endTime,
            location
        });

        const { rows } = await pool.query(insertQuery, [CID, DID, day, startTime, endTime, location]);

        res.status(201).json({ schedule: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSchedules = (req, res) => {
    pool.query(queries.getSchedules, (error, results) => {
        if (error) {
            console.error('Error fetching schedules:', error);
            return res.status(500).send('An error occurred while fetching schedules.');
        }
        res.status(200).json(results.rows);
    });
};


const removeSchedule = (req, res) => {
    const sid = parseInt(req.params.sid);

    pool.query(queries.getScheduleById, [sid], (error, results) => {
        if (error) {
            console.error('Error fetching schedule:', error.message);
            return res.status(500).send('An error occurred while fetching the schedule.');
        }

        if (!results || !results.rows || !results.rows.length) {
            return res.status(404).send("Schedule does not exist in the database");
        }

        pool.query(queries.removeSchedule, [sid], (error) => {
            if (error) {
                console.error('Error removing schedule:', error.message);
                return res.status(500).send('An error occurred while removing the schedule.');
            }

            res.status(200).send("Schedule removed successfully.");
        });
    });
};

const getdid = async (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authorizationHeader.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decodedToken); 

        const userId = decodedToken.userId; // Assuming userId is part of the token
        console.log('Received userId:', userId);

        const query = `
            SELECT d."DID"
            FROM doctors d
            JOIN users u ON u."UID" = d."UID"
            WHERE u."UID" = $1
        `;

        const { rows } = await pool.query(query, [userId]);
        console.log('Query result:', rows); 

        if (rows.length > 0) {
            res.status(200).json({ did: rows[0].DID });
        } else {
            res.status(404).json({ error: 'Doctor not found' });
        }
    } catch (error) {
        console.error('Error fetching DID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getUsers,
    getDoctors,
    getDoctorDetails,
    getUserById,
    /*addUser,*/
    addStudent,
    addDoctor,
    //removeUser,
    removeStudent,
    removeDoctor,
    //updateUser,
    updateStudent,
    updateDoctor,
    getCourses,
    getCourseById,
    getCoursesById,
    getDoctorCourById,
    addCourse,
    updateCourse,
    removeCourse,
    addSchedule,
    getSchedules,
    removeSchedule,
    getdid,
    getDoctorDetailsById,
    getDoctorOfficeHours
};