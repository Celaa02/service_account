import { Transaction, TransactionType } from './transaction.entity';

export interface ITransactionsRepository {
  create(input: { accountId: string; type: TransactionType; amount: number }): Promise<Transaction>;

  // 👇 añade este método
  transfer(input: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }): Promise<{ debit: Transaction; credit: Transaction }>;

  findById(id: string): Promise<Transaction | null>;
  listByAccount(accountId: string): Promise<Transaction[]>;
}
