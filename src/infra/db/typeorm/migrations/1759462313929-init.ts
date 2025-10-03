import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1759462313929 implements MigrationInterface {
  name = 'Init1759462313929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "accountId"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "account_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD "account_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "account_id"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "account_id" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" ADD "accountId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
