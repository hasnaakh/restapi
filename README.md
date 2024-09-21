# Student portal Project

## Description
This project is a RESTful API built with Node.js, Express, and PostgreSQL, providing endpoints for managing users, doctors, courses, and schedules. It uses **Knex.js** as a query builder for interacting with the database and includes features for user authentication, data validation, file uploads, and schedule management. The API supports functionalities such as user creation, course management, and schedule conflict detection.

## Features
- **User Management**: Create, update, and delete users (students, doctors, and admins).
- **Authentication**: Uses JWT for securing endpoints.
- **Course Management**: API endpoints for managing course data.
- **Schedule Management**: APIs for managing and validating course schedules.
- **Validation**: Input validation using **Joi**.
- **File Uploads**: Supports image uploads (e.g., doctor's photos) using **Multer**.
- **Password Security**: Hashing of passwords using **bcrypt**.

## Technologies Used
- **Node.js**: JavaScript runtime.
- **Express**: Web framework.
- **Knex.js**: SQL query builder.
- **PostgreSQL**: Database.
- **Joi**: Validation library.
- **JWT**: Authentication using JSON Web Tokens.
- **Multer**: Middleware for file uploads.
- **Bcrypt**: Password hashing.
- **dotenv**: For environment variable management.

## Prerequisites
Ensure that you have the following installed on your machine:
- **Node.js** (v18 or later)
- **PostgreSQL** (v12 or later)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd restapi


## To Run the Project

1. **Install dependencies**:
   ```bash
   npm install

2. **Set up the environment variables**:
   In .env file in the root directory add your PostgreSQL configuration:
   - DB_HOST=your-db-host
   - DB_USER=your-db-user
   - DB_PASSWORD=your-db-password
   - DB_NAME=your-db-name
   - DB_PORT=your-db-port
   - JWT_SECRET=your-jwt-secret

3. **Start the server**:
   ```bash
   node server.js


## To Log In As Admin
- **Email**: admin@project.com
- **Password**: AdminP@ssw0rd
