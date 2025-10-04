import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class RegisterUserDto {
  @ApiProperty({ example: 'user@bank.com' })
  @IsEmail()
  email!: string;
  @ApiProperty({ minLength: 6, example: 'secret' })
  @IsString()
  @MinLength(6)
  password!: string;
}
