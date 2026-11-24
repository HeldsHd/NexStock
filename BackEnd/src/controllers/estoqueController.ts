
import type { Request, Response } from "express";
import { db } from "../db.js";

type MovementType = "entrada" | "saida";

async function changeStock(req: Request, res: Response, type: MovementType) {
  try {
    const { produtoId, quantidade } = req.body ?? {};

    if (
      !Number.isSafeInteger(produtoId) ||
      produtoId <= 0 ||
      !Number.isSafeInteger(quantidade) ||
      quantidade <= 0
    ) {
      res.status(400).json({ erro: "Dados inválidos." });
      return;
    }

    const operator = type === "entrada" ? "+" : "-";
    const stockCondition = type === "saida" ? "AND quantidade >= $1" : "";
    const previousStockExpression = type === "entrada" ? "quantidade - $1" : "quantidade + $1";
    const result = await db.query(
      `WITH produto_atualizado AS (
         UPDATE produtos
         SET quantidade = quantidade ${operator} $1
         WHERE id = $2
           ${stockCondition}
         RETURNING *
       ),
       movimentacao AS (
         INSERT INTO movimentacoes
           (produto_id, produto_nome, produto_codigo, tipo, quantidade,
            estoque_anterior, estoque_novo, usuario_nome)
         SELECT
           id,
           nome,
           codigo,
           $3::varchar(10),
           $1,
           ${previousStockExpression},
           quantidade,
           $4
         FROM produto_atualizado
         RETURNING id
       )
       SELECT produto_atualizado.*
       FROM produto_atualizado
       JOIN movimentacao ON TRUE`,
      [quantidade, produtoId, type, req.session.usuarioNome?.trim() || "Usuário"]
    );

    if (result.rowCount === 0) {
      if (type === "saida") {
        res.status(409).json({ erro: "Produto inexistente ou estoque insuficiente." });
      } else {
        res.status(404).json({ erro: "Produto não encontrado." });
      }
      return;
    }

    res.json({
      mensagem: type === "entrada" ? "Entrada realizada com sucesso." : "Saída realizada com sucesso.",
      produto: result.rows[0],
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: type === "entrada" ? "Erro na entrada de estoque." : "Erro na saída de estoque.",
    });
  }
}

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

  async listMovements(_req: Request, res: Response) {
    try {
      const result = await db.query(`SELECT
           id,
           produto_id AS "productId",
           produto_nome AS "productName",
           produto_codigo AS "productSku",
           tipo AS type,
           quantidade AS quantity,
           estoque_anterior AS "previousStock",
           estoque_novo AS "currentStock",
           usuario_nome AS "userName",
           created_at AS "createdAt"
         FROM movimentacoes
         ORDER BY created_at DESC, id DESC`);
      res.json(result.rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao consultar movimentações." });
    }
  },

  entrada(req: Request, res: Response) {
    return changeStock(req, res, "entrada");
  },

  saida(req: Request, res: Response) {
    return changeStock(req, res, "saida");
  },
};

export default estoqueController;
