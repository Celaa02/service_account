import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateAccountDto } from '../../app/accounts/dto/create-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAccountUseCase } from '../../app/accounts/use-cases/create-account.usecase';
import { GetAccountUseCase } from '../../app/accounts/use-cases/get-account.usecase';
import { ListMyAccountsUseCase } from '../../app/accounts/use-cases/list-my-accounts.usecase';
import { ListAccountTransactionsUseCase } from '../../app/accounts/use-cases/list-account-transactions.usecase';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getAccount: GetAccountUseCase,
    private readonly listMine: ListMyAccountsUseCase,
    private readonly listAccTx: ListAccountTransactionsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.createAccount.execute(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async listMyAccounts(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    const rows = await this.listMine.execute({ userId: user.id });
    return rows;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string; email: string };
    return this.getAccount.execute({ accountId: id, userId: user.id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/transactions')
  async listAccountTxs(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() q: { limit?: number; offset?: number },
  ) {
    const user = req.user as { id: string; email: string };
    return this.listAccTx.execute({
      userId: user.id,
      accountId: id,
      limit: q.limit,
      offset: q.offset,
    });
  }
}
