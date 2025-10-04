import { CreateTransactionUseCase } from '../../../src/app/transactions/use-cases/create-transaction.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';
import { ITransactionsRepository } from '../../../src/domain/transactions/transactions.repository';
import { DomainError } from '../../../src/common/errors/domain-error';
import { ErrorCodes } from '../../../src/common/errors/error-codes';
import { TransactionType } from '../../../src/domain/transactions/transaction.entity';

describe('CreateTransactionUseCase', () => {
  let accountsRepo: jest.Mocked<IAccountsRepository>;
  let txRepo: jest.Mocked<ITransactionsRepository>;
  let usecase: CreateTransactionUseCase;

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

    usecase = new CreateTransactionUseCase(accountsRepo, txRepo);
  });

  it('lanza ACCOUNT_NOT_FOUND si la cuenta no existe', async () => {
    accountsRepo.findById.mockResolvedValueOnce(null);

    await expect(
      usecase.execute({
        userId: 'u-1',
        accountId: 'acc-x',
        type: TransactionType.DEPOSIT,
        amount: 100,
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCodes.ACCOUNT_NOT_FOUND,
    });

    expect(accountsRepo.findById).toHaveBeenCalledWith('acc-x');
    expect(txRepo.create).not.toHaveBeenCalled();
  });

  it('lanza ACCOUNT_NOT_OWNED si la cuenta pertenece a otro usuario', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 500,
      ownerId: 'u-OTHER',
      createdAt: new Date(),
    } as any);

    await expect(
      usecase.execute({
        userId: 'u-1',
        accountId: 'acc-1',
        type: TransactionType.DEPOSIT,
        amount: 100,
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: 'ACCOUNT_NOT_OWNED' as any,
    });

    expect(txRepo.create).not.toHaveBeenCalled();
  });

  it('lanza INSUFFICIENT_FUNDS cuando es retiro y el balance es menor al monto', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 50,
      ownerId: 'u-1',
      createdAt: new Date(),
    } as any);

    await expect(
      usecase.execute({
        userId: 'u-1',
        accountId: 'acc-1',
        type: TransactionType.WITHDRAWAL,
        amount: 100,
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCodes.INSUFFICIENT_FUNDS,
    });

    expect(txRepo.create).not.toHaveBeenCalled();
  });

  it('crea un DEPÓSITO exitosamente', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 500,
      ownerId: 'u-1',
      createdAt: new Date(),
    } as any);

    const tx = {
      id: 'tx-1',
      accountId: 'acc-1',
      type: TransactionType.DEPOSIT,
      amount: 200,
      createdAt: new Date(),
    };
    txRepo.create.mockResolvedValueOnce(tx as any);

    const result = await usecase.execute({
      userId: 'u-1',
      accountId: 'acc-1',
      type: TransactionType.DEPOSIT,
      amount: 200,
    });

    expect(txRepo.create).toHaveBeenCalledWith({
      accountId: 'acc-1',
      type: TransactionType.DEPOSIT,
      amount: 200,
    });
    expect(result).toEqual(tx);
  });

  it('crea un RETIRO exitosamente cuando hay fondos suficientes', async () => {
    accountsRepo.findById.mockResolvedValueOnce({
      id: 'acc-1',
      holderName: 'Jane',
      accountNumber: 'AC-001',
      balance: 1000,
      ownerId: 'u-1',
      createdAt: new Date(),
    } as any);

    const tx = {
      id: 'tx-2',
      accountId: 'acc-1',
      type: TransactionType.WITHDRAWAL,
      amount: 300,
      createdAt: new Date(),
    };
    txRepo.create.mockResolvedValueOnce(tx as any);

    const result = await usecase.execute({
      userId: 'u-1',
      accountId: 'acc-1',
      type: TransactionType.WITHDRAWAL,
      amount: 300,
    });

    expect(txRepo.create).toHaveBeenCalledWith({
      accountId: 'acc-1',
      type: TransactionType.WITHDRAWAL,
      amount: 300,
    });
    expect(result).toEqual(tx);
  });
});
