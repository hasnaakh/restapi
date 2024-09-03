const express = require("express");
const cors = require('cors');
const studentRoutes = require('./src/student/routes');

const app = express();
const port = 3001;
app.use(cors());

app.use(express.json());

const session = require('express-session'); 
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser'); 
require('dotenv').config(); // Load environment variables 
 
 
const authRoutes = require('./src/student/routes/auth'); 

// Middleware setup 
app.use(cookieParser()); 
app.use(bodyParser.json()); // Parses incoming JSON requests 
app.use(express.json()); // Alternative to bodyParser.json(), used for parsing JSON payloads 
 
// Session middleware 
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'defaultSecret', // Fallback if SESSION_SECRET is not defined 
  resave: false, 
  saveUninitialized: false, 
  cookie: {  
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production 
    httpOnly: true // Prevents client-side JavaScript from accessing the cookie 
  }, 
})); 
 
 
// Routes setup 
app.use('/api/auth', authRoutes); // Authentication routes

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1/p1", studentRoutes);

app.listen(port, () => console.log(`app listening on port ${port}`));