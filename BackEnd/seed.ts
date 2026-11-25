
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./src/db.js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({
  input: stdin,
  output: stdout,
});

async function seed() {
  try {
    const nome = (await rl.question("Nome: ")).trim();
    const email = (await rl.question("E-mail: ")).trim().toLowerCase();
    const senha = await rl.question("Senha (mínimo 12 caracteres): ");

    if (!nome || !email || senha.length < 12) {
      throw new Error("Dados inválidos ou senha muito curta.");
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const resultado = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, nome, email`,
      [nome, email, senhaHash]
    );

    if (resultado.rowCount === 0) {
      console.log("Usuário já cadastrado.");
    } else {
      console.log("Usuário criado com sucesso!");
      console.log(resultado.rows[0]);
    }
  } catch (erro) {
    console.error("Erro no seed:", erro);
  } finally {
    rl.close();
    await db.end();
  }
}

seed();
