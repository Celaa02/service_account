import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateAccountDto } from '../../app/accounts/dto/create-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAccountUseCase } from '../../app/accounts/use-cases/create-account.usecase';
import { GetAccountUseCase } from '../../app/accounts/use-cases/get-account.usecase';
import { ListMyAccountsUseCase } from '../../app/accounts/use-cases/list-my-accounts.usecase';
import { ListAccountTransactionsUseCase } from '../../app/accounts/use-cases/list-account-transactions.usecase';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getAccount: GetAccountUseCase,
    private readonly listMine: ListMyAccountsUseCase,
    private readonly listAccTx: ListAccountTransactionsUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear cuenta' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: 'Cuenta creada' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.createAccount.execute(dto);
  }

  @ApiOperation({ summary: 'Listar mis cuentas' })
  @ApiResponse({ status: 200, description: 'OK' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async listMyAccounts(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    const rows = await this.listMine.execute({ userId: user.id });
    return rows;
  }

  @ApiOperation({ summary: 'Obtener una cuenta por id' })
  @ApiParam({ name: 'id', description: 'Account UUID', required: true })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'ACCOUNT_NOT_FOUND' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string; email: string };
    return this.getAccount.execute({ accountId: id, userId: user.id });
  }

  @ApiOperation({ summary: 'Listar transacciones de la cuenta' })
  @ApiParam({ name: 'id', description: 'Account UUID', required: true })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1, maximum: 100 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiResponse({ status: 200, description: 'OK' })
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
