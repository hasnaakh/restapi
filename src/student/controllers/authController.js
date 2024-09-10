const bcrypt = require('bcrypt'); // For password hashing and comparison
const pool = require('../../../db');
const jwt = require('jsonwebtoken');

// Render login page (optional, if using server-side rendering)
/*exports.getLoginPage = (req, res) => {
    res.send("Login Page"); 
};*/

const getLoginPage = (req, res) => {
    res.send("Login Page");
};

// Handle user login
/*exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query to find the user by email
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // Compare provided password with hashed password in the database
       
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        /*if (password !== user.password) {

            return res.status(401).json({ message: 'Invalid  password' });
        }

        // Successful login, create session
        req.session.userId = user.id; // Save user ID in session
        res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};*/

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        req.session.userId = user.id;
        const token = jwt.sign({ uid: user.id }, 'your-secret-key', { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role, message: 'Login successful' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Handle user logout
const logout = (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
        blacklistedTokens.add(token);  // Assuming blacklistedTokens is a Set
        res.status(200).send({ message: 'Logout successful' });
    } else {
        res.status(400).send({ message: 'Token not provided' });
    }
};

// Check if user is authenticated
const checkAuth = (req, res) => {
    if (req.session.userId) {
        return res.status(200).json({ userId: req.session.userId });
    }
    res.status(401).json({ message: 'Not authenticated' });
};

// Blacklist token set
const blacklistedTokens = new Set();

// Export the necessary functions
module.exports = { login, logout, checkAuth, getLoginPage, blacklistedTokens };
