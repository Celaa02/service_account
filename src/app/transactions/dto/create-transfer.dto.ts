import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fromAccountId!: string;
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  toAccountId!: string;
  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
