import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateTransferDto {
  @IsUUID() fromAccountId!: string;
  @IsUUID() toAccountId!: string;
  @IsNumber() @Min(0.01) amount!: number;
}
