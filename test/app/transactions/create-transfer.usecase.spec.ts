import { CreateTransferUseCase } from '../../../src/app/transactions/use-cases/create-transfer.usecase';
import { IAccountsRepository } from '../../../src/domain/accounts/accounts.repository';
import { ITransactionsRepository } from '../../../src/domain/transactions/transactions.repository';
import { TransactionType, Transaction } from '../../../src/domain/transactions/transaction.entity';
import { DomainError } from '../../../src/common/errors/domain-error';
import { ErrorCodes } from '../../../src/common/errors/error-codes';

describe('CreateTransferUseCase (unit)', () => {
  const userId = 'user-1';
  const fromId = 'acc-from';
  const toId = 'acc-to';

  const accFrom = {
    id: fromId,
    ownerId: userId,
    balance: 100,
    holderName: '',
    accountNumber: '',
    createdAt: new Date(),
  };
  const accTo = {
    id: toId,
    ownerId: userId,
    balance: 20,
    holderName: '',
    accountNumber: '',
    createdAt: new Date(),
  };

  let accounts: jest.Mocked<IAccountsRepository>;
  let txRepo: jest.Mocked<ITransactionsRepository>;
  let usecase: CreateTransferUseCase;

  beforeEach(() => {
    accounts = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAccountNumber: jest.fn(),
      list: jest.fn(),
      updateBalance: jest.fn(),
    } as any;

    txRepo = {
      create: jest.fn(),
      transfer: jest.fn(),
      findById: jest.fn(),
      listByAccount: jest.fn(),
    } as any;

    usecase = new CreateTransferUseCase(accounts, txRepo);
  });

  it('falla si from == to', async () => {
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: fromId, amount: 10 }),
    ).rejects.toMatchObject({ code: ErrorCodes.TRANSFER_SAME_ACCOUNT } as DomainError);
  });

  it('falla si no existe origen', async () => {
    accounts.findById.mockResolvedValueOnce(null);
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: toId, amount: 10 }),
    ).rejects.toMatchObject({ code: ErrorCodes.ACCOUNT_NOT_FOUND } as DomainError);
  });

  it('falla si origen no es del usuario', async () => {
    accounts.findById.mockResolvedValueOnce({ ...accFrom, ownerId: 'otro' });
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: toId, amount: 10 }),
    ).rejects.toMatchObject({ code: ErrorCodes.ACCOUNT_NOT_OWNED } as DomainError);
  });

  it('falla si no existe destino', async () => {
    accounts.findById.mockResolvedValueOnce(accFrom).mockResolvedValueOnce(null);
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: toId, amount: 10 }),
    ).rejects.toMatchObject({ code: ErrorCodes.ACCOUNT_NOT_FOUND } as DomainError);
  });

  it('falla si amount <= 0', async () => {
    accounts.findById.mockResolvedValueOnce(accFrom).mockResolvedValueOnce(accTo);
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: toId, amount: 0 }),
    ).rejects.toMatchObject({ code: ErrorCodes.INVALID_AMOUNT } as DomainError);
  });

  it('falla si no hay fondos suficientes', async () => {
    accounts.findById
      .mockResolvedValueOnce({ ...accFrom, balance: 5 })
      .mockResolvedValueOnce(accTo);
    await expect(
      usecase.execute({ userId, fromAccountId: fromId, toAccountId: toId, amount: 10 }),
    ).rejects.toMatchObject({ code: ErrorCodes.INSUFFICIENT_FUNDS } as DomainError);
  });

  it('happy path: delega en repo.transfer y devuelve {debit, credit}', async () => {
    accounts.findById.mockResolvedValueOnce(accFrom).mockResolvedValueOnce(accTo);

    const debit = new Transaction('tx1', fromId, TransactionType.WITHDRAWAL, 30, new Date());
    const credit = new Transaction('tx2', toId, TransactionType.DEPOSIT, 30, new Date());
    txRepo.transfer.mockResolvedValueOnce({ debit, credit });

    const res = await usecase.execute({
      userId,
      fromAccountId: fromId,
      toAccountId: toId,
      amount: 30,
    });

    expect(txRepo.transfer).toHaveBeenCalledWith({
      fromAccountId: fromId,
      toAccountId: toId,
      amount: 30,
    });
    expect(res.debit).toBe(debit);
    expect(res.credit).toBe(credit);
  });
});
