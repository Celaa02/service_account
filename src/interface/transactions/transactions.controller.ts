import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { Request } from 'express';
import { CreateTransactionDto, TxKindDTO } from '../../app/transactions/dto/create-transaction.dto';
import { CreateTransactionUseCase } from '../../app/transactions/use-cases/create-transaction.usecase';
import { TransactionType } from '../../domain/transactions/transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly createTx: CreateTransactionUseCase) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTransactionDto) {
    const user = req.user as { id: string; email: string }; // cargado por JwtStrategy
    const type =
      dto.type === TxKindDTO.DEPOSIT ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL;
    return this.createTx.execute({
      userId: user.id,
      accountId: dto.accountId,
      type,
      amount: dto.amount,
    });
  }
}
