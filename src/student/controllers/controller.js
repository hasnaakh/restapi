const pool = require('../../../db');
const queries = require('../queries');
const bcrypt = require('bcrypt'); //for hashing
const { userCreationSchema, userUpdateSchema } = require('../../../validators/userValidation');

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
  
const addDoctor = async (req, res) => {
    const { username, email, password, phone } = req.body;

    // Validate user input
    const { error } = userCreationSchema.validate({ username, email, password, phone, role: 'doctor' });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const { rows } = await pool.query(queries.checkEmailExists, [email]);
        if (rows.length) {
            return res.status(400).send("Email already exists.");
        }

        // Hash the password
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.query(queries.addDoctor, [username, email, hashedPassword, phone]);
        res.status(201).send("Doctor Created Successfully!");
    } catch (error) {
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
    const { username, email, phone, password } = req.body;


    const { error } = userUpdateSchema.validate({ username, email, phone, password });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const { rows } = await pool.query(queries.getUserById, [UID]);
        const user = rows[0];
        
        if (!user || user.role !== 'doctor') {
            return res.status(404).send("Doctor does not exist in the database.");
        }

        let updateFields = {};

        // Add fields to update if they exist in the request
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

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).send('No valid fields provided for update.');
          }
      
          const { query, values } = queries.generateUpdateQuery('users', updateFields);
          values.push(UID);
      
          await pool.query(query, values);
          res.status(200).send('Doctor updated successfully.');
        } catch (error) {
          console.error('Error updating doctor:', error.message);
          res.status(500).send(`An error occurred while updating the doctor: ${error.message}`);
        }
};



module.exports = {
    getUsers,
    getDoctors,
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
};