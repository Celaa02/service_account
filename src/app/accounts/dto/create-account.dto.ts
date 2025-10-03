import { IsNotEmpty, IsString, Length, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  holderName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  accountNumber!: string;

  @IsNumber()
  @Min(0)
  balance!: number;

  @IsUUID()
  ownerId!: string;
}
