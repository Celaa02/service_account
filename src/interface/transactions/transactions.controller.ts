/* eslint-disable @typescript-eslint/no-redeclare */
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { CreateTransactionDto, TxKindDTO } from '../../app/transactions/dto/create-transaction.dto';
import { CreateTransactionUseCase } from '../../app/transactions/use-cases/create-transaction.usecase';
import { TransactionType } from '../../domain/transactions/transaction.entity';
import { CreateTransferDto } from '../../app/transactions/dto/create-transfer.dto';
import { CreateTransferUseCase } from '../../app/transactions/use-cases/create-transfer.usecase';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTx: CreateTransactionUseCase,
    private readonly createTransfer: CreateTransferUseCase,
  ) {}

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
}
