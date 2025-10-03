import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { typeormConfig } from './infra/config/typeorm.config';
import { AccountsModule } from './interface/accounts/accounts.module';
import { TransactionsModule } from './interface/transactions/transactions.module';
import { AuthModule } from './interface/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: () => typeormConfig }),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'changeme' }),
    AuthModule,
    AccountsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
