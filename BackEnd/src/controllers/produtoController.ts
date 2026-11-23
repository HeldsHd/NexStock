
import type { Request, Response } from "express";
import { db } from "../db.js";

const produtoController = {
  async list(_req: Request, res: Response) {
    try {
      const resultado = await db.query(
        "SELECT * FROM produtos ORDER BY id DESC"
      );

      res.json(resultado.rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao listar produtos." });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const resultado = await db.query(
        "SELECT * FROM produtos WHERE id = $1",
        [req.params.id]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json(resultado.rows[0]);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao buscar produto." });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nome, codigo, preco_centavos, quantidade } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof codigo !== "string" ||
        !codigo.trim() ||
        !Number.isSafeInteger(preco_centavos) ||
        preco_centavos < 0 ||
        !Number.isSafeInteger(quantidade) ||
        quantidade < 0
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      const resultado = await db.query(
        `INSERT INTO produtos
         (nome, codigo, preco_centavos, quantidade)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nome.trim(), codigo.trim(), preco_centavos, quantidade]
      );

      res.status(201).json(resultado.rows[0]);
    } catch (erro: any) {
      if (erro.code === "23505") {
        res.status(409).json({ erro: "Código já cadastrado." });
        return;
      }

      console.error(erro);
      res.status(500).json({ erro: "Erro ao cadastrar produto." });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { nome, codigo, preco_centavos } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof codigo !== "string" ||
        !codigo.trim() ||
        !Number.isSafeInteger(preco_centavos) ||
        preco_centavos < 0
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      const resultado = await db.query(
        `UPDATE produtos
         SET nome = $1,
             codigo = $2,
             preco_centavos = $3
         WHERE id = $4
         RETURNING *`,
        [nome.trim(), codigo.trim(), preco_centavos, req.params.id]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json(resultado.rows[0]);
    } catch (erro: any) {
      if (erro.code === "23505") {
        res.status(409).json({ erro: "Código já cadastrado." });
        return;
      }

      console.error(erro);
      res.status(500).json({ erro: "Erro ao atualizar produto." });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const resultado = await db.query(
        "DELETE FROM produtos WHERE id = $1 RETURNING id",
        [req.params.id]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json({ mensagem: "Produto excluído com sucesso." });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao excluir produto." });
    }
  },
};

export default produtoController;
