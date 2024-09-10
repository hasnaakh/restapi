const express = require("express");
const bcrypt = require('bcrypt');
const pool = require('./db');
const cors = require('cors');
const knex = require('knex');
const knexfile = require('./knexfile');
const path = require("path");
const app = express();
const port = 3001;

const session = require('express-session'); 
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser'); 
require('dotenv').config(); // Load environment variables 

// Middleware setup
app.use(cors());
app.use(cookieParser()); 
app.use(bodyParser.json()); 
app.use(express.json()); 
// Serve images from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false, 
  saveUninitialized: false, 
  cookie: {  
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true 
  }
}));

// Routes setup
const authRoutes = require('./src/student/routes/auth'); 
app.use('/api/auth', authRoutes);

const studentRoutes = require('./src/student/routes');
app.use("/api/v1/p1", studentRoutes);

// Initialize Knex
const db = knex(knexfile.development);

// Function to create database if it does not exist
const createDatabase = async () => {

   // Connect to the 'postgres' default database, not the one you're trying to create
  const client = new (require('pg').Client)({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to 'postgres' to create your new DB
  });
  const dbName = process.env.DB_NAME;

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
    
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
};

// Function to run migrations
const runMigrations = async () => {
  try {
    await createDatabase(); // Ensure the database is created before running migrations
    await db.migrate.latest();
    console.log('Migrations run successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
};

const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@project.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminP@ssw0rd';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const username = adminEmail.split('@')[0];

    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;`;

    await pool.query(query, [username, adminEmail, hashedPassword, 'admin']);
    console.log('Admin user created or already exists.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};




// Start the server
const startServer = async () => {
  await runMigrations();
  await createAdminUser();

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  
  app.listen(port, () => console.log(`App listening on port ${port}`));
};

// Initialize the server
startServer();
