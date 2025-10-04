import { ListAccountTransactionsUseCase } from '../../../src/app/accounts/use-cases/list-account-transactions.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';
import { ITransactionsRepository } from '../../../src/domain/transactions/transactions.repository';
import { DomainError } from '../../../src/common/errors/domain-error';
import { ErrorCodes } from '../../../src/common/errors/error-codes';
import { TransactionType } from '../../../src/domain/transactions/transaction.entity';

describe('ListAccountTransactionsUseCase', () => {
  let accountsRepo: jest.Mocked<IAccountsRepository>;
  let txRepo: jest.Mocked<ITransactionsRepository>;
  let usecase: ListAccountTransactionsUseCase;

  const mkTx = (i: number) => ({
    id: `tx-${i}`,
    accountId: 'acc-1',
    type: i % 2 === 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
    amount: i + 1,
    createdAt: new Date(Date.now() - i * 1000),
  });

  beforeEach(() => {
    accountsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAccountNumber: jest.fn(),
      list: jest.fn(),
      updateBalance: jest.fn(),
    } as unknown as jest.Mocked<IAccountsRepository>;

    txRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByAccount: jest.fn(),
    } as unknown as jest.Mocked<ITransactionsRepository>;

    usecase = new ListAccountTransactionsUseCase(accountsRepo, txRepo);
  });

  it('lanza ACCOUNT_NOT_FOUND si la cuenta no existe', async () => {
    accountsRepo.findById.mockResolvedValueOnce(null);

    await expect(usecase.execute({ userId: 'u-1', accountId: 'acc-x' })).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCodes.ACCOUNT_NOT_FOUND,
    });

    expect(accountsRepo.findById).toHaveBeenCalledWith('acc-x');
    expect(txRepo.listByAccount).not.toHaveBeenCalled();
  });

  it('lanza ACCOUNT_NOT_OWNED si la cuenta existe pero pertenece a otro usuario', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 1000,
      ownerId: 'u-OTHER',
      createdAt: new Date(),
    } as any);

    await expect(usecase.execute({ userId: 'u-1', accountId: 'acc-1' })).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCodes.ACCOUNT_NOT_OWNED,
    });

    expect(txRepo.listByAccount).not.toHaveBeenCalled();
  });

  it('devuelve transacciones con paginación (offset/limit) válida', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 1000,
      ownerId: 'u-1',
      createdAt: new Date(),
    } as any);

    const rows = Array.from({ length: 30 }, (_, i) => mkTx(i));
    txRepo.listByAccount.mockResolvedValueOnce(rows as any);

    const result = await usecase.execute({
      userId: 'u-1',
      accountId: 'acc-1',
      limit: 5,
      offset: 10,
    });

    expect(txRepo.listByAccount).toHaveBeenCalledWith('acc-1');
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe('tx-10');
    expect(result[4].id).toBe('tx-14');
  });

  it('usa defaults y clamps: limit por defecto 20; offset negativo → 0; limit > 100 → 100', async () => {
    accountsRepo.findById.mockResolvedValue({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 1000,
      ownerId: 'u-1',
      createdAt: new Date(),
    } as any);

    const rows = Array.from({ length: 150 }, (_, i) => mkTx(i));
    txRepo.listByAccount.mockResolvedValue(rows as any);

    const r1 = await usecase.execute({ userId: 'u-1', accountId: 'acc-1' });
    expect(r1).toHaveLength(20);
    expect(r1[0].id).toBe('tx-0');
    expect(r1[19].id).toBe('tx-19');

    const r2 = await usecase.execute({ userId: 'u-1', accountId: 'acc-1', offset: -50, limit: 3 });
    expect(r2).toHaveLength(3);
    expect(r2[0].id).toBe('tx-0');

    const r3 = await usecase.execute({ userId: 'u-1', accountId: 'acc-1', limit: 1000, offset: 0 });
    expect(r3).toHaveLength(100);
  });

  it('si la cuenta no expone ownerId, no valida ownership (solo existencia)', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 1000,
      createdAt: new Date(),
    } as any);

    txRepo.listByAccount.mockResolvedValueOnce([mkTx(0), mkTx(1)] as any);

    const result = await usecase.execute({ userId: 'u-OTHER', accountId: 'acc-1' });
    expect(result).toHaveLength(2);
  });
});
