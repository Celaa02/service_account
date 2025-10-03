import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountsController } from './accounts.controller';
import { AccountsTypeormRepository } from '../../infra/db/typeorm/repositories/accounts.typeorm-repository';
import { AccountOrmEntity } from '../../infra/db/typeorm/entities/account.orm-entity';

// UseCases
import { CreateAccountUseCase } from '../../app/accounts/use-cases/create-account.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AccountOrmEntity])],
  controllers: [AccountsController],
  providers: [
    AccountsTypeormRepository,
    {
      provide: CreateAccountUseCase,
      useFactory: (repo: AccountsTypeormRepository) => new CreateAccountUseCase(repo),
      inject: [AccountsTypeormRepository],
    },
  ],
  exports: [AccountsTypeormRepository],
})
export class AccountsModule {}
