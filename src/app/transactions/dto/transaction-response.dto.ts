import { Transaction } from '../../../domain/transactions/transaction.entity';

export class TransactionResponseDto {
  id!: string;
  accountId!: string;
  type!: 'DEPOSIT' | 'WITHDRAWAL';
  amount!: number;
  createdAt!: Date;

  static fromDomain(t: Transaction): TransactionResponseDto {
    return {
      id: t.id,
      accountId: t.accountId,
      type: t.type,
      amount: t.amount,
      createdAt: t.createdAt,
    };
  }
}
