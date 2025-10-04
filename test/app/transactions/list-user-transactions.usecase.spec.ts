import { ListUserTransactionsUseCase } from '../../../src/app/transactions/use-cases/list-user-transactions.usecase';
import { ITransactionsRepository } from '../../../src/domain/transactions/transactions.repository';
import { TransactionType } from '../../../src/domain/transactions/transaction.entity';

describe('ListUserTransactionsUseCase', () => {
  let txRepo: jest.Mocked<ITransactionsRepository>;
  let usecase: ListUserTransactionsUseCase;

  const mkTx = (i: number, userId = 'u-1') => ({
    id: `tx-${i}`,
    accountId: `acc-${i % 2}`,
    type: i % 2 === 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
    amount: i + 1,
    createdAt: new Date(Date.now() - i * 1000),
    userId,
  });

  beforeEach(() => {
    txRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByAccount: jest.fn(),
      listByUser: jest.fn(),
    } as unknown as jest.Mocked<ITransactionsRepository>;

    usecase = new ListUserTransactionsUseCase(txRepo);
  });

  it('debe delegar en listByUser con userId, limit y offset', async () => {
    const rows = [mkTx(0), mkTx(1)];
    txRepo.listByUser.mockResolvedValueOnce(rows as any);

    const out = await usecase.execute({ userId: 'u-1', limit: 10, offset: 5 });

    expect(txRepo.listByUser).toHaveBeenCalledWith('u-1', { limit: 10, offset: 5 });
    expect(out).toBe(rows);
  });

  it('si no se pasan limit/offset, los envía como undefined (repo aplica defaults)', async () => {
    const rows = [mkTx(2), mkTx(3)];
    txRepo.listByUser.mockResolvedValueOnce(rows as any);

    const out = await usecase.execute({ userId: 'u-2' });

    expect(txRepo.listByUser).toHaveBeenCalledWith('u-2', { limit: undefined, offset: undefined });
    expect(out).toBe(rows);
  });
});
