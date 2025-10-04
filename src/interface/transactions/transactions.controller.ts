import { Body, Controller, Post, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { CreateTransactionDto, TxKindDTO } from '../../app/transactions/dto/create-transaction.dto';
import { CreateTransactionUseCase } from '../../app/transactions/use-cases/create-transaction.usecase';
import { TransactionType } from '../../domain/transactions/transaction.entity';
import { CreateTransferDto } from '../../app/transactions/dto/create-transfer.dto';
import { CreateTransferUseCase } from '../../app/transactions/use-cases/create-transfer.usecase';
import { ListUserTransactionsUseCase } from '../../app/transactions/use-cases/list-user-transactions.usecase';
import { ListUserTransactionsQueryDto } from '../../app/transactions/dto/list-user-transactions.query';
import { TransactionResponseDto } from '../../app/transactions/dto/transaction-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTx: CreateTransactionUseCase,
    private readonly createTransfer: CreateTransferUseCase,
    private readonly listMine: ListUserTransactionsUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear depósito/retiro' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transacción creada' })
  @ApiResponse({ status: 400, description: 'INVALID_AMOUNT / INSUFFICIENT_FUNDS' })
  @ApiResponse({ status: 404, description: 'ACCOUNT_NOT_FOUND' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTransactionDto) {
    const user = req.user as { id: string; email: string };
    const type =
      dto.type === TxKindDTO.DEPOSIT ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL;
    return this.createTx.execute({
      userId: user.id,
      accountId: dto.accountId,
      type,
      amount: dto.amount,
    });
  }

  @ApiOperation({ summary: 'Transferir entre cuentas' })
  @ApiBody({ type: CreateTransferDto })
  @ApiResponse({ status: 201, description: 'Transferencia creada' })
  @ApiResponse({ status: 400, description: 'INVALID_AMOUNT / TRANSFER_SAME_ACCOUNT' })
  @ApiResponse({ status: 404, description: 'ACCOUNT_NOT_FOUND' })
  @UseGuards(AuthGuard('jwt'))
  @Post('transfer')
  async transfer(@Req() req: Request, @Body() dto: CreateTransferDto) {
    const user = req.user as { id: string; email: string };

    return this.createTransfer.execute({
      userId: user.id,
      fromAccountId: dto.fromAccountId,
      toAccountId: dto.toAccountId,
      amount: dto.amount,
    });
  }

  @ApiOperation({ summary: 'Listar mis transacciones (usuario actual)' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1, maximum: 100 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiResponse({ status: 200, description: 'OK', type: TransactionResponseDto, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async listForCurrentUser(@Req() req: Request, @Query() q: ListUserTransactionsQueryDto) {
    const user = req.user as { id: string; email: string };
    const rows = await this.listMine.execute({ userId: user.id, limit: q.limit, offset: q.offset });
    return rows.map(TransactionResponseDto.fromDomain);
  }
}
