import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserUseCase } from '../../app/auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../../app/auth/use-cases/login-user.usecase';
import { RegisterUserDto } from '../../app/auth/dto/register-user.dto';
import { LoginUserDto } from '../../app/auth/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly registerUser: RegisterUserUseCase, // 👈 token = clase
    private readonly loginUser: LoginUserUseCase, // 👈 token = clase
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.registerUser.execute({ email: dto.email, password: dto.password });
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    console.log('🚀 ~ AuthController ~ register ~ token:', token);
    return { user, token };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.loginUser.execute({ email: dto.email, password: dto.password });
    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { user, token };
  }
}
