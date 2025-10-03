// import { MigrationInterface, QueryRunner } from "typeorm";

// export class Init1759471819714 implements MigrationInterface {
//     name = 'Init1759471819714'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "accounts" ADD "user_id" uuid`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "user_id"`);
//     }

// }

// src/infra/db/typeorm/migrations/1759471819714-init.ts
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class Init1759471819714 implements MigrationInterface {
  name = 'Init1759471819714';

  public async up(q: QueryRunner): Promise<void> {
    // columna
    const hasUserId = await q.hasColumn('accounts', 'user_id');
    if (!hasUserId) {
      await q.addColumn(
        'accounts',
        new TableColumn({ name: 'user_id', type: 'uuid', isNullable: true }),
      );
    }

    // FK (solo si no existe aún)
    const table = await q.getTable('accounts');
    const hasFk = table?.foreignKeys.some((fk) => fk.columnNames.includes('user_id'));
    if (!hasFk) {
      await q.createForeignKey(
        'accounts',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          name: 'fk_accounts_user',
        }),
      );
    }

    // (opcional) cuando ya tengas poblado user_id en todas las filas:
    // await q.changeColumn('accounts', 'user_id', new TableColumn({ name: 'user_id', type: 'uuid', isNullable: false }));
  }

  public async down(q: QueryRunner): Promise<void> {
    const table = await q.getTable('accounts');
    const fk = table?.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
    if (fk) await q.dropForeignKey('accounts', fk);
    const hasUserId = await q.hasColumn('accounts', 'user_id');
    if (hasUserId) await q.dropColumn('accounts', 'user_id');
  }
}
