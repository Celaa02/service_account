import { ITransactionsRepository } from '../../../domain/transactions/transactions.repository';
import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';
import { Transaction, TransactionType } from '../../../domain/transactions/transaction.entity';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class CreateTransactionUseCase {
  constructor(
    private readonly accounts: IAccountsRepository,
    private readonly transactions: ITransactionsRepository,
  ) {}

  async execute(input: {
    userId: string;
    accountId: string;
    type: TransactionType;
    amount: number;
  }): Promise<Transaction> {
    const account = await this.accounts.findById(input.accountId);
    if (!account) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND);

    if (account.ownerId !== input.userId) {
      throw new DomainError('ACCOUNT_NOT_OWNED' as any, 'Account does not belong to user', {
        accountId: input.accountId,
        userId: input.userId,
      });
    }

    if (input.type === TransactionType.WITHDRAWAL && account.balance < input.amount) {
      throw new DomainError(ErrorCodes.INSUFFICIENT_FUNDS, 'Insufficient funds', {
        balance: account.balance,
        amount: input.amount,
      });
    }

    return this.transactions.create({
      accountId: input.accountId,
      type: input.type,
      amount: input.amount,
    });
  }
}
