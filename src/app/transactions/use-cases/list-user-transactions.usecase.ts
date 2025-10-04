import { Transaction } from '../../../domain/transactions/transaction.entity';
import { ITransactionsRepository } from '../../../domain/transactions/transactions.repository';

export class ListUserTransactionsUseCase {
  constructor(private readonly transactions: ITransactionsRepository) {}

  async execute(input: {
    userId: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    return this.transactions.listByUser(input.userId, { limit: input.limit, offset: input.offset });
  }
}
