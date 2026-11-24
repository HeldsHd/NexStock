import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "./src/db.js";

async function migrate() {
  try {
    const migration = await readFile(
      resolve(process.cwd(), "migrations", "001_categories.sql"),
      "utf8"
    );
    await db.query(migration);
    console.log("Migração de categorias aplicada com sucesso.");
  } catch (error) {
    console.error("Erro ao aplicar a migração de categorias:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

void migrate();
