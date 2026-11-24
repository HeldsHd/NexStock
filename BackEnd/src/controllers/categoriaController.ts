import type { Request, Response } from "express";
import { db } from "../db.js";

const categoriaController = {
  async list(_req: Request, res: Response) {
    try {
      const resultado = await db.query(
        "SELECT id, nome FROM categorias ORDER BY nome ASC"
      );

      res.json(resultado.rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao listar categorias." });
    }
  },

  async create(req: Request, res: Response) {
    const nome =
      typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

    if (!nome || nome.length > 80) {
      res.status(400).json({ erro: "Informe uma categoria com até 80 caracteres." });
      return;
    }

    try {
      const resultado = await db.query(
        `INSERT INTO categorias (nome)
         VALUES ($1)
         RETURNING id, nome`,
        [nome]
      );

      res.status(201).json(resultado.rows[0]);
    } catch (erro) {
      if (
        typeof erro === "object" &&
        erro !== null &&
        "code" in erro &&
        erro.code === "23505"
      ) {
        res.status(409).json({ erro: "Essa categoria já existe." });
        return;
      }

      console.error(erro);
      res.status(500).json({ erro: "Erro ao criar categoria." });
    }
  },
};

export default categoriaController;
