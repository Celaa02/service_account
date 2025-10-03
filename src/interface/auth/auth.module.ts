import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { UserOrmEntity } from '../../infra/db/typeorm/entities/user.orm-entity';
import { UsersTypeormRepository } from '../../infra/db/typeorm/repositories/users.typeorm-repository';
import { RegisterUserUseCase } from '../../app/auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../../app/auth/use-cases/login-user.usecase';
import { JwtStrategy } from '../../infra/auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 registra passport
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'changeme' }),
  ],
  controllers: [AuthController],
  providers: [
    UsersTypeormRepository,
    JwtStrategy, // 👈 provee la estrategia
    {
      provide: RegisterUserUseCase,
      useFactory: (r: UsersTypeormRepository) => new RegisterUserUseCase(r),
      inject: [UsersTypeormRepository],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (r: UsersTypeormRepository) => new LoginUserUseCase(r),
      inject: [UsersTypeormRepository],
    },
  ],
  exports: [
    PassportModule, // 👈 exporta para otros módulos
  ],
})
export class AuthModule {}
