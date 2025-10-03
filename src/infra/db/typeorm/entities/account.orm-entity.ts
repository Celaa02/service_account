// src/infra/db/typeorm/entities/account.orm-entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('accounts')
export class AccountOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'holder_name', length: 120 })
  holderName!: string;

  @Column({ name: 'account_number', length: 24, unique: true })
  accountNumber!: string;

  @Column({
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) },
  })
  balance!: number;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  ownerId!: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  owner!: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // 👇 propiedad inversa que falta
  @OneToMany(() => TransactionOrmEntity, (t) => t.account)
  transactions!: TransactionOrmEntity[];
}
