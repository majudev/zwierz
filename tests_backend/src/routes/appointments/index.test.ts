//test for ../src/routes/appointments

import request from 'supertest';
import express, { Express } from 'express';
import router from './index';
import { generateToken } from './authUtils';

describe('Appointments API', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/appointments', router);


    token = generateToken('user123'); // User data
  });

  it('should create a new appointment', async () => {
    const response = await request(app)
      .post('/appointments/new')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2023-03-19',
        description: 'New Appointment',
        slots_HO: 2,
        slots_HR: 3,
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should list appointments', async () => {
    const response = await request(app)
      .get('/appointments/all')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeInstanceOf(Array);

  });

  it('should update an appointment', async () => {

    const existingAppointmentId = 'appointment123'; // Meeting ID
    
    const response = await request(app)
      .patch(`/appointments/${existingAppointmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated Appointment',
        slots_HO: 3,
        slots_HR: 2,
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');

  });

  it('should delete an appointment', async () => {

    const existingAppointmentId = 'appointment123'; // Meeting ID

    const response = await request(app)
      .delete(`/appointments/${existingAppointmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    expect(response.body).toEqual({});
  });
});
