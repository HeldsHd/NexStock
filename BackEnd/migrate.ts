import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "./src/db.js";

async function migrate() {
  try {
    const categoriesMigration = await readFile(
      resolve(process.cwd(), "migrations", "001_categories.sql"),
      "utf8"
    );
    await db.query(categoriesMigration);

    const minimumStockMigration = await readFile(
      resolve(process.cwd(), "migrations", "002_minimum_stock.sql"),
      "utf8"
    );
    await db.query(minimumStockMigration);

    const movementsMigration = await readFile(
      resolve(process.cwd(), "migrations", "003_movimentacoes.sql"),
      "utf8"
    );
    await db.query(movementsMigration);

    console.log("Migrações aplicadas com sucesso.");
  } catch (error) {
    console.error("Erro ao aplicar as migrações:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

void migrate();
