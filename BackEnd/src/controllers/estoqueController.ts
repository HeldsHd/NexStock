
import type { Request, Response } from "express";
import { db } from "../db.js";

const estoqueController = {
  async list(_req: Request, res: Response) {
    try {
      const resultado = await db.query(
        `SELECT id, nome, codigo, quantidade
         FROM produtos
         ORDER BY nome`
      );

      res.json(resultado.rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao consultar estoque." });
    }
  },

  async entrada(req: Request, res: Response) {
    try {
      const { produtoId, quantidade } = req.body;

      if (
        !Number.isSafeInteger(produtoId) ||
        produtoId <= 0 ||
        !Number.isSafeInteger(quantidade) ||
        quantidade <= 0
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      const resultado = await db.query(
        `UPDATE produtos
         SET quantidade = quantidade + $1
         WHERE id = $2
         RETURNING *`,
        [quantidade, produtoId]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json({
        mensagem: "Entrada realizada com sucesso.",
        produto: resultado.rows[0],
      });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro na entrada de estoque." });
    }
  },

  async saida(req: Request, res: Response) {
    try {
      const { produtoId, quantidade } = req.body;

      if (
        !Number.isSafeInteger(produtoId) ||
        produtoId <= 0 ||
        !Number.isSafeInteger(quantidade) ||
        quantidade <= 0
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      const resultado = await db.query(
        `UPDATE produtos
         SET quantidade = quantidade - $1
         WHERE id = $2
           AND quantidade >= $1
         RETURNING *`,
        [quantidade, produtoId]
      );

      if (resultado.rowCount === 0) {
        res.status(409).json({
          erro: "Produto inexistente ou estoque insuficiente.",
        });
        return;
      }

      res.json({
        mensagem: "Saída realizada com sucesso.",
        produto: resultado.rows[0],
      });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro na saída de estoque." });
    }
  },
};

export default estoqueController;
