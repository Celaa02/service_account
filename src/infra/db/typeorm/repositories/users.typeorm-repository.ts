import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUsersRepository } from '../../../../domain/auth/users.repository';

@Injectable()
export class UsersTypeormRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async create(input: { email: string; passwordHash: string }) {
    const entity = this.repo.create({ email: input.email, passwordHash: input.passwordHash });
    return this.repo.save(entity);
  }
}
