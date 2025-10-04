import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min, IsUUID } from 'class-validator';

export enum TxKindDTO {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  accountId!: string;

  @ApiProperty({ enum: TxKindDTO })
  @IsEnum(TxKindDTO)
  type!: TxKindDTO;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
