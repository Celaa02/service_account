import { IAccountsRepository } from '../../../domain/accounts/accounts.repository';
import { ITransactionsRepository } from '../../../domain/transactions/transactions.repository';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class ListAccountTransactionsUseCase {
  constructor(
    private readonly accounts: IAccountsRepository,
    private readonly transactions: ITransactionsRepository,
  ) {}

  async execute(input: { userId: string; accountId: string; limit?: number; offset?: number }) {
    const acc = await this.accounts.findById(input.accountId);
    if (!acc) throw new DomainError(ErrorCodes.ACCOUNT_NOT_FOUND);
    if ('ownerId' in acc && acc.ownerId && acc.ownerId !== input.userId) {
      throw new DomainError(ErrorCodes.ACCOUNT_NOT_OWNED);
    }
    const rows = await this.transactions.listByAccount(input.accountId);
    const offset = Math.max(input.offset ?? 0, 0);
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
    return rows.slice(offset, offset + limit);
  }
}
