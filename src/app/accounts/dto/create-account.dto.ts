import { IsNotEmpty, IsString, Length, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'darly0794@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  holderName!: string;

  @ApiProperty({ example: 'ACC-0001' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  accountNumber!: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  balance!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  ownerId!: string;
}
