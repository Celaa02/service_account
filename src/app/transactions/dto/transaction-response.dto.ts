import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionType } from '../../../domain/transactions/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty({ enum: TransactionType }) type!: TransactionType;
  @ApiProperty() amount!: number;
  @ApiProperty() createdAt!: Date;

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
