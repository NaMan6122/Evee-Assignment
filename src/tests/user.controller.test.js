import request from 'supertest';
import { app } from '../../app.js';
import { User } from '../models/user-model.js';
import mongoose from 'mongoose';

// jest setup:
beforeAll(async () => {
    try {
        const TEST_DB = "testDB";
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${TEST_DB}`, {
            serverSelectionTimeoutMS: 4500,
        });
        console.log(`Connected to MongoDB!! ${connectionInstance.connection.host}`);
    } catch(error) {
        console.log("Error connecting to MongoDB!!")
        console.log(error);
        process.exit(1);
    }
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('User Controller', () => {
    let cookies;
    
    const createUserAndLogin = async () => {
        await request(app).post('/api/v1/users/register').send({
            fullName: 'hellohello',
            email: 'hello123@gmail.com',
            password: 'Test@123',
            phone: '1234567890',
        });

        const loginResponse = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'hello123@gmail.com',
                password: 'Test@123',
            });
        
        // Extract cookies from response
        cookies = loginResponse.headers['set-cookie'];
        return loginResponse;
    };

    beforeAll(async () => {
        await createUserAndLogin();
    });

    //helper function to attach cookies to requests.
    const attachCookies = (req) => {
        return req.set('Cookie', cookies);
    };

    describe('POST /api/v1/users/register', () => {
        test('should create a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    fullName: 'newuser',
                    email: 'newuser@gmail.com',
                    password: 'Test@123',
                    phone: '0987654321',
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully!!');
        });

        test('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    fullName: '',
                    email: '',
                    password: '',
                    phone: '',
                });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Please fill all fields properly!');
        });
    });

    describe('POST /api/v1/users/login', () => {
        test('should login user with valid credentials and set cookies', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({ email: 'hello123@gmail.com', password: 'Test@123' });
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User logged in successfully');
            expect(response.headers['set-cookie']).toBeDefined();
        });

        test('should return 404 for non-existing user', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'nonexist@gmail.com',
                    password: 'Test@123',
                });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('GET /api/v1/users/get-all-users', () => {
        test('should fetch all users with valid cookie', async () => {
            const response = await attachCookies(
                request(app).get('/api/v1/users/get-all-users')
            );
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('All Users fetched successfully!!');
        });
    });

    describe('PUT /api/v1/users/update-user-data/:id', () => {
        test('should update a user with valid data', async () => {
            const loginResponse = await createUserAndLogin();
            const userId = loginResponse.body.data._id;
            
            const response = await attachCookies(
                request(app)
                    .put(`/api/v1/users/update-user-data/${userId}`)
                    .send({
                        fullName: 'helllobye',
                        email: 'hello321@gmail.com',
                        phone: '9876543210'
                    })
            );
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User updated successfully!!');
        });
    });

    describe('DELETE /api/v1/users/delete-user/:id', () => {
        test('should delete a user', async () => {
            const loginResponse = await createUserAndLogin();
            const userId = loginResponse.body.data._id;
            
            const response = await attachCookies(
                request(app).delete(`/api/v1/users/delete-user/${userId}`)
            );
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully!!');
        });
    });

    describe('POST /api/v1/users/refresh-session', () => {
        test('should refresh session with valid cookie', async () => {
            const response = await attachCookies(
                request(app).post('/api/v1/users/refresh-session')
            );
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Session refreshed successfully!!');
            expect(response.headers['set-cookie']).toBeDefined();
        });
    });

    describe('Authentication Middleware', () => {
        test('should deny access without cookie', async () => {
            const response = await request(app).get('/api/v1/users/get-all-users');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized Request!!');
        });

        test('should allow access with valid cookie', async () => {
            const response = await attachCookies(
                request(app).get('/api/v1/users/get-all-users')
            );
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('All Users fetched successfully!!');
        });
    });
});