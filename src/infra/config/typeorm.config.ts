import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

import { AccountOrmEntity } from '../db/typeorm/entities/account.orm-entity';
import { TransactionOrmEntity } from '../db/typeorm/entities/transaction.orm-entity';
import { UserOrmEntity } from '../db/typeorm/entities/user.orm-entity';

import * as dotenv from 'dotenv';
dotenv.config();

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [AccountOrmEntity, TransactionOrmEntity, UserOrmEntity],

  migrations: [join(__dirname, '..', 'db', 'typeorm', 'migrations', '*.{ts,js}')],

  synchronize: false,
  logging: true,
};
