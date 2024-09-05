const bcrypt = require('bcrypt'); // For password hashing and comparison
const pool = require('../../../db');

// Render login page (optional, if using server-side rendering)
exports.getLoginPage = (req, res) => {
    res.send("Login Page"); // Replace this with rendering a view if needed
};

// Handle user login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query to find the user by email
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // Compare provided password with hashed password in the database
       /* const match = await bcrypt.compare(password, user.password);
        if (!match) {*/
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        /*if (password !== user.password) {

            return res.status(401).json({ message: 'Invalid  password' });
        }*/

        // Successful login, create session
        req.session.userId = user.id; // Save user ID in session
        res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Handle user logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.status(200).json({ message: 'Logout successful' });
    });
};

// Check if user is authenticated (used for client-side auth or session validation)
exports.checkAuth = (req, res) => {
    if (req.session.userId) {
        return res.status(200).json({ userId: req.session.userId });
    }
    res.status(401).json({ message: 'Not authenticated' });
};
