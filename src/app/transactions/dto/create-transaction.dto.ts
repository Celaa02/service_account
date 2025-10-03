import { IsEnum, IsNumber, Min, IsUUID } from 'class-validator';

export enum TxKindDTO {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateTransactionDto {
  @IsUUID()
  accountId!: string;

  @IsEnum(TxKindDTO)
  type!: TxKindDTO; // 👈 Aquí entra TxKindDTO

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
