import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBankSchema20251003221500 implements MigrationInterface {
  name = 'InitBankSchema20251003221500';

  public async up(q: QueryRunner): Promise<void> {
    // Extensión para uuid
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Tabla users
    await q.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Tabla accounts
    await q.query(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "holder_name" varchar(255) NOT NULL,
        "account_number" varchar(32) NOT NULL,
        "balance" numeric(14,2) NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "UQ_accounts_account_number" UNIQUE ("account_number"),
        CONSTRAINT "FK_accounts_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_accounts_user_id" ON "accounts" ("user_id")`);

    // Tabla transactions
    await q.query(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" varchar(20) NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "account_id" uuid NOT NULL,
        CONSTRAINT "FK_transactions_account" FOREIGN KEY ("account_id")
          REFERENCES "accounts"("id") ON DELETE CASCADE
      )
    `);

    await q.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transactions_account_id" ON "transactions" ("account_id")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "IDX_transactions_account_id"`);
    await q.query(`DROP TABLE IF EXISTS "transactions"`);

    await q.query(`DROP INDEX IF EXISTS "IDX_accounts_user_id"`);
    await q.query(`ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "FK_accounts_user"`);
    await q.query(`DROP TABLE IF EXISTS "accounts"`);

    await q.query(`DROP TABLE IF EXISTS "users"`);
    // (No borramos la extensión uuid-ossp para no afectar otras cosas)
  }
}
