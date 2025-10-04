import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export class LoginUserDto {
  @ApiProperty({ example: 'user@bank.com' })
  @IsEmail()
  email!: string;
  @ApiProperty({ minLength: 6, example: 'secret' })
  @IsString()
  password!: string;
}
