import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function registerAndLogin(app: INestApplication, email?: string) {
  const userEmail = email ?? `user${Date.now()}@test.com`;
  const password = 'StrongP@ssw0rd';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email: userEmail, password })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: userEmail, password })
    .expect(201);

  return { token: res.body.access_token, email: userEmail };
}
