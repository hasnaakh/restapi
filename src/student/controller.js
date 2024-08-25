const pool = require('../../db');
const queries = require('./queries');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, results) => {
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
    getUserById,
    addUser,
    removeUser,
    updateUser,
};