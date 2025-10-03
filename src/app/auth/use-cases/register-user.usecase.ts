import * as bcrypt from 'bcrypt';
import { IUsersRepository } from '../../../domain/auth/users.repository';
import { User } from '../../../domain/auth/user.entity';
import { DomainError } from '../../../common/errors/domain-error';
import { ErrorCodes } from '../../../common/errors/error-codes';

export class RegisterUserUseCase {
  constructor(private readonly users: IUsersRepository) {}

  async execute(input: { email: string; password: string }): Promise<User> {
    const exists = await this.users.findByEmail(input.email);
    if (exists) {
      throw new DomainError(ErrorCodes.EMAIL_ALREADY_REGISTERED, 'Email already registered', {
        email: input.email,
      });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.users.create({ email: input.email, passwordHash });
  }
}
