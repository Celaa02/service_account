import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';
import { ITransactionsRepository } from '../../../domain/transactions/transactions.repository';
import { Transaction } from '../../../domain/transactions/transaction.entity';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class CreateTransferUseCase {
  constructor(
    private readonly accounts: IAccountsRepository,
    private readonly transactions: ITransactionsRepository,
  ) {}

  async execute(input: {
    userId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }): Promise<{ debit: Transaction; credit: Transaction }> {
    if (input.fromAccountId === input.toAccountId) {
      throw new DomainError(
        ErrorCodes.TRANSFER_SAME_ACCOUNT,
        'Source and destination are the same',
      );
    }
    if (!(input.amount > 0)) {
      throw new DomainError(ErrorCodes.INVALID_AMOUNT, 'Amount must be > 0');
    }

    const from = await this.accounts.findById(input.fromAccountId);
    if (!from) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND, 'Source account not found');
    if (from.ownerId !== input.userId) {
      throw new DomainError('ACCOUNT_NOT_OWNED' as any, 'Account does not belong to user', {
        accountId: input.fromAccountId,
        userId: input.userId,
      });
    }

    const to = await this.accounts.findById(input.toAccountId);
    if (!to) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND, 'Destination account not found');

    if (from.balance < input.amount) {
      throw new DomainError(ErrorCodes.INSUFFICIENT_FUNDS, 'Insufficient funds', {
        balance: from.balance,
        amount: input.amount,
      });
    }

    // Ejecuta la operación atómica (lock + 2 movimientos + 2 updates de saldo)
    return this.transactions.transfer({
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amount: input.amount,
    });
  }
}
