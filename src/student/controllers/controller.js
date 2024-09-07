const pool = require('../../../db');
const queries = require('../queries');
const bcrypt = require('bcrypt'); //for hashing
const { userCreationSchema, userUpdateSchema } = require('../../../validators/userValidation');
const { doctorCreationSchema, doctorUpdateSchema  } = require('../../../validators/doctorValidation');



const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, results) => {
        if (error) throw error;
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
    const { username, email, password, phone, department, contact_info } = req.body;
    const photo = req.file ? req.file.path : null;

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

/*const removeUser = (req, res) => {
    const UID = parseInt(req.params.UID);

    //check user exist
    pool.query(queries.getUserById, [UID], (error, results) => {
        const noUserFound = !results.rows.length;
        if(noUserFound){
            res.send("User does not exist in the database");
        }

        //delete
        pool.query(queries.removeUser, [UID], (error, results) => {
            if (error) throw error;
            res.status(200).send("User removed succefully.");
        });
    });
};*/

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

/*const updateUser = (req, res) => {
    const UID = parseInt(req.params.UID);
    const { username } = req.body;

    pool.query(queries.getUserById, [UID], (error, results) => {
        const noUserFound = !results.rows.length;
        if(noUserFound){
            res.send("User does not exist in the database");
        }

        pool.query(queries.updateUser, [username, UID], (error, results) => {
            if (error) throw error;
            res.status(200).send("User updated successfully");
        });
    });
};*/

/*const updateUser = (req, res) => {
    const UID = parseInt(req.params.UID);
    const updates = req.body;

    // Check if the user exists
    pool.query(queries.getUserById, [UID], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send("An error occurred while fetching the user.");
            return;
        }

        const noUserFound = !results.rows.length;
        if (noUserFound) {
            res.status(404).send("User does not exist in the database");
            return;
        }

        try {
            const { query, values } = queries.generateUpdateQuery('users', updates);
            values.push(UID); 

            console.log('Update Query:', query);
            console.log('Values:', values);

            pool.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error updating user:', error);
                    res.status(500).send("An error occurred while updating the user.");
                    return;
                }
                res.status(200).send("User updated successfully.");
            });
        } catch (error) {
            console.error('Error generating update query:', error);
            res.status(400).send(error.message);
        }
    });
};*/

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
    const { username, email, phone, password, photo, department, contact_info } = req.body;


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

//Asmaa
//Courses
const getCourses = (req, res) => {
    pool.query(queries.getCourses, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const addCourse = (req, res) => {
    const { name, code, description } = req.body;        
        pool.query(queries.addCourse, [code, name, description], (error, results) => {
            if (error) throw error;
            res.status(201).send("Course Added Successfully!");
        });
};

const removeCourse = (req, res) => {
    const cid = parseInt(req.params.cid);

    //check course exist
    pool.query(queries.getCourseById, [cid], (error, results) => {
        const noCourseFound = !results.rows.length;
        if(noCourseFound){
            res.send("Course does not exist in the database");
        }

        //delete
        pool.query(queries.removeCourse, [cid], (error, results) => {
            if (error) throw error;
            res.status(200).send("Course removed succefully.");
        });
    });
};

const getCourseById = (req, res) => {
    const cid = parseInt(req.params.cid);
    pool.query(queries.getCourseById, [cid], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const updateCourse = (req, res) => {
    const cid = parseInt(req.params.cid);
    const updates = req.body;

    pool.query(queries.getCourseById, [cid], (error, results) => {
        if (error) {
            console.error('Error fetching course:', error);
            res.status(500).send("An error occurred while fetching the course.");
            return;
        }

        const noCourseFound = !results.rows.length;
        if (noCourseFound) {
            res.status(404).send("Course does not exist in the database");
            return;
        }

        try {
            const { query, values } = queries.generateUpdateCourseQuery('courses', updates);
            values.push(cid); // Add the course ID as the last value

            console.log('Update Query:', query);
            console.log('Values:', values);

            pool.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error updating Course:', error); // Show the error details
                    res.status(500).send("An error occurred while updating the Course."); // Temporary log error for debug
                    return;
                }
                res.status(200).send("Course updated successfully.");
            });
        } catch (error) {
            console.error('Error generating update query:', error);
            res.status(400).send(error.message);
        }
    });
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
    addCourse,
    updateCourse,
    removeCourse,
};