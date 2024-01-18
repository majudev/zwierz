//test for ../src/routes/auth/index.ts

import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { JWT_SECRET, JWT_EXPIRATION_MINS } from './jwt_secret'; // Import the JWT_SECRET and JWT_EXPIRATION_MINS functions

const app = express();
const prisma = new PrismaClient();

describe('Authentication API', () => {
  let server: any;

  beforeAll(() => {
    app.use(express.json());
    app.use('/auth', require('./index').default); // Import the auth routes

    server = app.listen(4000); // Choose a port for your tests
  });

  afterAll(async () => {

  if (server) {
    server.close();
  }
  await prisma.$disconnect();
});

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'TestPassword123!',
        captchaId: 'captchaId',
        captchaAnswer: 'captchaAnswer',
      })
      .expect(204);


    expect(response.status).toBe(204);
  });

  it('should activate a user', async () => {




    const response = await request(app).get('/auth/activate/activationkey');


    expect(response.status).toBe(200);
  });



  // Example test for JWT_SECRET and JWT_EXPIRATION_MINS
  describe('JWT_SECRET and JWT_EXPIRATION_MINS', () => {
    it('should obtain JWT secret and expiration from the database', async () => {
      const jwtSecret = await JWT_SECRET();
      const jwtExpiration = await JWT_EXPIRATION_MINS();


      expect(typeof jwtSecret).toBe('string');
      expect(typeof jwtExpiration).toBe('string');
    });
  });
});
