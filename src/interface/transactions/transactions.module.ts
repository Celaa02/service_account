import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionOrmEntity } from '../../infra/db/typeorm/entities/transaction.orm-entity';
import { AccountOrmEntity } from '../../infra/db/typeorm/entities/account.orm-entity';
import { TransactionsTypeormRepository } from '../../infra/db/typeorm/repositories/transactions.typeorm-repository';
import { CreateTransactionUseCase } from '../../app/transactions/use-cases/create-transaction.usecase';
import { AccountsTypeormRepository } from '../../infra/db/typeorm/repositories/accounts.typeorm-repository';
import { AuthModule } from '../auth/auth.module'; // 👈 más simple: importa AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity, AccountOrmEntity]),
    AuthModule, // 👈 con esto ya llega PassportModule y la estrategia
    // o, alternativamente: PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsTypeormRepository,
    AccountsTypeormRepository,
    {
      provide: CreateTransactionUseCase,
      useFactory: (a: AccountsTypeormRepository, t: TransactionsTypeormRepository) =>
        new CreateTransactionUseCase(a, t),
      inject: [AccountsTypeormRepository, TransactionsTypeormRepository],
    },
  ],
})
export class TransactionsModule {}
