import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../../../src/interface/transactions/transactions.controller';

import { CreateTransactionUseCase } from '../../../src/app/transactions/use-cases/create-transaction.usecase';
import { CreateTransferUseCase } from '../../../src/app/transactions/use-cases/create-transfer.usecase';
import { ListUserTransactionsUseCase } from '../../../src/app/transactions/use-cases/list-user-transactions.usecase';
import { TxKindDTO } from '../../../src/app/transactions/dto/create-transaction.dto';
import { TransactionType } from '../../../src/domain/transactions/transaction.entity';

describe('TransactionsController (unit)', () => {
  let controller: TransactionsController;

  const createTxMock = { execute: jest.fn() };
  const createTransferMock = { execute: jest.fn() };
  const listMineMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: createTxMock },
        { provide: CreateTransferUseCase, useValue: createTransferMock },
        { provide: ListUserTransactionsUseCase, useValue: listMineMock },
      ],
    }).compile();

    controller = module.get(TransactionsController);
  });

  describe('POST /transactions', () => {
    it('debe crear un depósito', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const dto = { accountId: 'acc-1', type: TxKindDTO.DEPOSIT, amount: 100 };
      const expected = {
        id: 'tx-1',
        accountId: 'acc-1',
        type: TransactionType.DEPOSIT,
        amount: 100,
      };

      createTxMock.execute.mockResolvedValueOnce(expected);

      const result = await controller.create(req, dto);

      expect(createTxMock.execute).toHaveBeenCalledWith({
        userId: 'u-1',
        accountId: 'acc-1',
        type: TransactionType.DEPOSIT,
        amount: 100,
      });
      expect(result).toEqual(expected);
    });

    it('debe crear un retiro', async () => {
      const req = { user: { id: 'u-2', email: 'b@b.com' } } as any;
      const dto = { accountId: 'acc-2', type: TxKindDTO.WITHDRAWAL, amount: 50 };
      const expected = {
        id: 'tx-2',
        accountId: 'acc-2',
        type: TransactionType.WITHDRAWAL,
        amount: 50,
      };

      createTxMock.execute.mockResolvedValueOnce(expected);

      const result = await controller.create(req, dto);

      expect(createTxMock.execute).toHaveBeenCalledWith({
        userId: 'u-2',
        accountId: 'acc-2',
        type: TransactionType.WITHDRAWAL,
        amount: 50,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('POST /transactions/transfer', () => {
    it('debe ejecutar transferencia', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const dto = { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 300 };
      const expected = { id: 'tx-3', fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 300 };

      createTransferMock.execute.mockResolvedValueOnce(expected);

      const result = await controller.transfer(req, dto);

      expect(createTransferMock.execute).toHaveBeenCalledWith({
        userId: 'u-1',
        fromAccountId: 'acc-1',
        toAccountId: 'acc-2',
        amount: 300,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('GET /transactions/me', () => {
    it('debe listar transacciones del usuario autenticado', async () => {
      const req = { user: { id: 'u-1', email: 'a@a.com' } } as any;
      const q = { limit: 2, offset: 0 };
      const rows = [
        {
          id: 'tx-10',
          accountId: 'acc-1',
          type: TransactionType.DEPOSIT,
          amount: 500,
          createdAt: new Date(),
        },
        {
          id: 'tx-11',
          accountId: 'acc-1',
          type: TransactionType.WITHDRAWAL,
          amount: 200,
          createdAt: new Date(),
        },
      ];

      listMineMock.execute.mockResolvedValueOnce(rows);

      const result = await controller.listForCurrentUser(req, q);

      expect(listMineMock.execute).toHaveBeenCalledWith({
        userId: 'u-1',
        limit: 2,
        offset: 0,
      });

      // el controller aplica TransactionResponseDto.fromDomain
      expect(result).toEqual(
        rows.map((r) => expect.objectContaining({ id: r.id, accountId: r.accountId })),
      );
    });
  });
});
