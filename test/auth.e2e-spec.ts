import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register → crea usuario', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `test${Date.now()}@mail.com`, password: 'Test1234' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
  });

  it('/auth/login → genera token', async () => {
    const email = `login${Date.now()}@mail.com`;
    const password = 'Pass1234';

    await request(app.getHttpServer()).post('/auth/register').send({ email, password }).expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
  });
});
