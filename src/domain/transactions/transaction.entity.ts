// src/domain/transactions/transaction.entity.ts
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}
export class Transaction {
  constructor(
    public id: string,
    public accountId: string,
    public type: TransactionType,
    public amount: number,
    public createdAt: Date,
  ) {}
}
