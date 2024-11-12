# User Authentication API

This application is a simple REST API for user authentication, featuring user registration, login, and JWT-based session management. Built with Node.js, Express, and MongoDB, it includes token-based authentication and error handling using custom error responses.

## Features

- **User Registration**: Allows new users to register with an email and password.
- **User Login**: Authenticates users, generating access and refresh tokens.
- **Get Users**: Fetches a list of all users, available for admin users only.
- **Get User By ID**: Fetches the user by the given id if it exists, available for admins only.
- **Delete User By Id**: Deletes the user by given id if it exists, available for admins only.
- **Secure Token Storage**: Stores token generation and storage in secure, HTTP-only cookies.
- **Custom Error Handling**: Uses a custom `ApiError` class to standardize error responses.
- **Custom Async Wrapper**: A higher order function wraps all async functions to provide extra layer of error handling and catching errors.

## Tasks

- **Written and Executed Jest Tests**: Configured Jest and Supertest, covered all important tests for basic CRUD.
- **Tested Using Postman**: Tested Manually using postman, which is an implementation based testing practice.


## Prerequisites

- **Node.js**
- **MongoDB** 
- **npm**

## Getting Started

### 1. Clone the Repository

git clone <repository-url>
cd <repository-name>

### 2. Install Dependencies

npm install

### 3. Configure Environment Variables

Create a .env file in the root directory with the following variables:

PORT=3000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>

### 4. Start MongoDB

If using local MongoDB, ensure it is running. For MongoDB Atlas, configure your cluster and use its URI in MONGO_URI.

### 5. Start the Server

Run the server in development mode:

npm run dev

The server will start on http://localhost:3500.

### 6. Running Tests

This application includes Jest tests for API routes. To run tests, execute:

npm test