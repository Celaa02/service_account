import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '../../../src/interface/accounts/accounts.controller';

import { CreateAccountUseCase } from '../../../src/app/accounts/use-cases/create-account.usecase';
import { GetAccountUseCase } from '../../../src/app/accounts/use-cases/get-account.usecase';
import { ListMyAccountsUseCase } from '../../../src/app/accounts/use-cases/list-my-accounts.usecase';
import { ListAccountTransactionsUseCase } from '../../../src/app/accounts/use-cases/list-account-transactions.usecase';

describe('AccountsController (unit)', () => {
  let controller: AccountsController;

  const createAccountMock = { execute: jest.fn() };
  const getAccountMock = { execute: jest.fn() };
  const listMineMock = { execute: jest.fn() };
  const listAccTxMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        { provide: CreateAccountUseCase, useValue: createAccountMock },
        { provide: GetAccountUseCase, useValue: getAccountMock },
        { provide: ListMyAccountsUseCase, useValue: listMineMock },
        { provide: ListAccountTransactionsUseCase, useValue: listAccTxMock },
      ],
    }).compile();

    controller = module.get(AccountsController);
  });

  describe('create (POST /accounts)', () => {
    it('debe delegar en CreateAccountUseCase y retornar el resultado', async () => {
      const dto = { holderName: 'Jane', accountNumber: 'AC-1', initialBalance: 200 };
      const created = { id: 'acc-1', ...dto, balance: 200, createdAt: new Date() };

      createAccountMock.execute.mockResolvedValueOnce(created);

      const out = await controller.create(dto as any);

      expect(createAccountMock.execute).toHaveBeenCalledWith(dto);
      expect(out).toEqual(created);
    });
  });

  describe('listMyAccounts (GET /accounts)', () => {
    it('debe tomar el user del req y llamar ListMyAccountsUseCase con userId', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const rows = [
        { id: 'acc-1', accountNumber: 'AC-1', balance: 100 },
        { id: 'acc-2', accountNumber: 'AC-2', balance: 200 },
      ];
      listMineMock.execute.mockResolvedValueOnce(rows);

      const out = await controller.listMyAccounts(req);

      expect(listMineMock.execute).toHaveBeenCalledWith({ userId: 'u-1' });
      expect(out).toEqual(rows);
    });
  });

  describe('getOne (GET /accounts/:id)', () => {
    it('debe llamar GetAccountUseCase con accountId y userId', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const accId = 'acc-1';
      const acc = { id: accId, accountNumber: 'AC-1', balance: 100 };

      getAccountMock.execute.mockResolvedValueOnce(acc);

      const out = await controller.getOne(req, accId);

      expect(getAccountMock.execute).toHaveBeenCalledWith({ accountId: accId, userId: 'u-1' });
      expect(out).toEqual(acc);
    });
  });

  describe('listAccountTxs (GET /accounts/:id/transactions)', () => {
    it('debe pasar userId, accountId, limit y offset al use case', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const accId = 'acc-1';
      const q = { limit: 5, offset: 10 };
      const txs = [
        { id: 'tx-10', accountId: accId, amount: 10, type: 'DEPOSIT', createdAt: new Date() },
        { id: 'tx-11', accountId: accId, amount: 11, type: 'WITHDRAWAL', createdAt: new Date() },
      ];

      listAccTxMock.execute.mockResolvedValueOnce(txs);

      const out = await controller.listAccountTxs(req, accId, q);

      expect(listAccTxMock.execute).toHaveBeenCalledWith({
        userId: 'u-1',
        accountId: accId,
        limit: 5,
        offset: 10,
      });
      expect(out).toEqual(txs);
    });

    it('si no se envían query params, debe pasar undefined (el use case aplicará defaults)', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const accId = 'acc-1';
      const txs: any = [];

      listAccTxMock.execute.mockResolvedValueOnce(txs);

      const out = await controller.listAccountTxs(req, accId, {} as any);

      expect(listAccTxMock.execute).toHaveBeenCalledWith({
        userId: 'u-1',
        accountId: accId,
        limit: undefined,
        offset: undefined,
      });
      expect(out).toEqual(txs);
    });
  });
});
