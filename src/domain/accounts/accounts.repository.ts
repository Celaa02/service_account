import { Account } from './accounts.entity';

export interface IAccountsRepository {
  create(input: {
    holderName: string;
    accountNumber: string;
    balance: number;
    ownerId: string;
  }): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  list(): Promise<Account[]>;
}
