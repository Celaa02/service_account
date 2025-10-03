import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { AccountOrmEntity } from './account.orm-entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId!: string;

  @ManyToOne(() => AccountOrmEntity, (a) => a.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: AccountOrmEntity;

  @Column({ type: 'varchar', length: 12 })
  type!: 'DEPOSIT' | 'WITHDRAWAL';

  @Column({
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) },
  })
  amount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
