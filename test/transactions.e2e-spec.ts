import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { registerAndLogin } from './utils/test-helpers';

describe('Transactions endpoints (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let accountId: string;
  let account2Id: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const auth = await registerAndLogin(app);
    token = auth.token;

    // Crear dos cuentas para transferencias
    const acc1 = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ holderName: 'Main', accountNumber: `AC${Date.now()}`, balance: 200 })
      .expect(201);

    accountId = acc1.body.id;

    const acc2 = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ holderName: 'Secondary', accountNumber: `AC${Date.now()}X`, balance: 50 })
      .expect(201);

    account2Id = acc2.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/transactions → depósito', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ accountId, type: 'DEPOSIT', amount: 100 })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(100);
  });

  it('/transactions → retiro con saldo suficiente', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ accountId, type: 'WITHDRAWAL', amount: 50 })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(50);
  });

  it('/transactions/transfer → transfiere entre cuentas', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ fromAccountId: accountId, toAccountId: account2Id, amount: 30 })
      .expect(201);

    expect(res.body).toHaveProperty('fromTransaction');
    expect(res.body).toHaveProperty('toTransaction');
  });
});
