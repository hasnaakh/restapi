const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust path as needed

// Route to render the login page (optional)
router.get('/login', authController.getLoginPage);

// Route to handle user login
router.post('/login', authController.login);

// Route to handle user logout
router.post('/logout', authController.logout);

// Route to check if the user is authenticated
router.get('/check', authController.checkAuth);

module.exports = router;
