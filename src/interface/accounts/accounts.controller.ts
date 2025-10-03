import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateAccountDto } from '../../app/accounts/dto/create-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAccountUseCase } from '../../app/accounts/use-cases/create-account.usecase';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly createAccount: CreateAccountUseCase) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.createAccount.execute(dto);
  }
}
