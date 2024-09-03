const pool = require('../../../db');
const queries = require('../queries');

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
    pool.query(queries.getUserById, [UID], (error, results) => {
        if (error) throw error;
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
const addStudent = (req, res) => {
    const { username, email, password, phone } = req.body;
  
    pool.query(queries.checkEmailExists, [email], (error, results) => {
      if (error) {
        console.error('Error checking email:', error);
        res.status(500).send("An error occurred while checking the email.");
        return;
      }
  
      if (results.rows.length) {
        res.status(400).send("Email already exists.");
        return;
      }
  
      console.log('Query:', queries.addStudent);
      console.log('Parameters:', [username, email, password, phone]);
  
      pool.query(queries.addStudent, [username, email, password, phone], (error, results) => {
        if (error) {
          console.error('Error adding student:', error.message);
          res.status(500).send(`An error occurred while adding the user: ${error.message}`);
          return;
        }
  
        res.status(201).send("Student Created Successfully!");
      });
    });
  };
  
  const addDoctor = (req, res) => {
    const { username, email, password, phone } = req.body;
  
    pool.query(queries.checkEmailExists, [email], (error, results) => {
      if (error) {
        console.error('Error checking email:', error);
        res.status(500).send("An error occurred while checking the email.");
        return;
      }
  
      if (results.rows.length) {
        res.status(400).send("Email already exists.");
        return;
      }
  
      console.log('Query:', queries.addDoctor);
      console.log('Parameters:', [username, email, password, phone]);
  
      pool.query(queries.addDoctor, [username, email, password, phone], (error, results) => {
        if (error) {
          console.error('Error adding doctor:', error.message);
          res.status(500).send(`An error occurred while adding the user: ${error.message}`);
          return;
        }
  
        res.status(201).send("Doctor Created Successfully!");
      });
    });
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

const updateUser = (req, res) => {
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
    updateUser,
};