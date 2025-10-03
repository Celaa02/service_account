import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerToAccounts1730600000000 implements MigrationInterface {
  name = 'AddOwnerToAccounts1730600000000';
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id uuid`);
    await q.query(
      `ALTER TABLE accounts ADD CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
    );
    // opcional: si quieres que todas las cuentas requieran dueño
    // await q.query(`ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE accounts DROP CONSTRAINT IF EXISTS fk_accounts_user`);
    await q.query(`ALTER TABLE accounts DROP COLUMN IF EXISTS user_id`);
  }
}
