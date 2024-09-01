const pool = require('../../db');
const queries = require('./queries');

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
  
    // Check if email exists
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
  
      // Log query and parameters before execution
      console.log('Query:', queries.addStudent);
      console.log('Parameters:', [username, email, password, phone]);
  
      // Add student to the database with the role set as 'student'
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
  
    // Check if email exists
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
  
      // Log query and parameters before execution
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

const removeUser = (req, res) => {
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
};

const updateUser = (req, res) => {
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
};

module.exports = {
    getUsers,
    getDoctors,
    getUserById,
    /*addUser,*/
    addStudent,
    addDoctor,
    removeUser,
    updateUser,
};