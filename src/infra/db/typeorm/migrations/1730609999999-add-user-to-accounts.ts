import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserToAccounts1730609999999 implements MigrationInterface {
  name = 'AddUserToAccounts1730609999999';

  public async up(q: QueryRunner): Promise<void> {
    // 1) Agregar columna (nullable primero para no fallar si hay filas existentes)
    await q.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id uuid`);

    // 2) Crear FK a users(id)
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'fk_accounts_user'
            AND table_name = 'accounts'
        ) THEN
          ALTER TABLE accounts
          ADD CONSTRAINT fk_accounts_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END$$;
    `);

    // 3) (Opcional) Poner NOT NULL si ya puedes garantizar el dueño en todas las filas
    // await q.query(`ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE accounts DROP CONSTRAINT IF EXISTS fk_accounts_user`);
    await q.query(`ALTER TABLE accounts DROP COLUMN IF EXISTS user_id`);
  }
}
