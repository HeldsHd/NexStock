
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
      const { nome, codigo, preco_centavos, quantidade, quantidade_minima, categoria } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof codigo !== "string" ||
        !codigo.trim() ||
        !Number.isSafeInteger(preco_centavos) ||
        preco_centavos < 0 ||
        !Number.isSafeInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isSafeInteger(quantidade_minima) ||
        quantidade_minima < 0 ||
        (categoria !== undefined && typeof categoria !== "string") ||
        (typeof categoria === "string" && categoria.trim().length > 80)
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      let categoriaNome = categoria?.trim() || null;
      if (categoriaNome) {
        const categoriaExistente = await db.query(
          "SELECT nome FROM categorias WHERE LOWER(nome) = LOWER($1)",
          [categoriaNome]
        );
        if (categoriaExistente.rowCount === 0) {
          res.status(400).json({ erro: "A categoria selecionada não existe." });
          return;
        }
        categoriaNome = categoriaExistente.rows[0].nome;
      }

      const resultado = await db.query(
        `WITH produto_criado AS (
           INSERT INTO produtos
             (nome, codigo, preco_centavos, quantidade, quantidade_minima, categoria)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *
         ),
         movimentacao AS (
           INSERT INTO movimentacoes
             (produto_id, produto_nome, produto_codigo, tipo, quantidade,
              estoque_anterior, estoque_novo, usuario_nome)
           SELECT id, nome, codigo, 'entrada', quantidade, 0, quantidade, $7
           FROM produto_criado
           WHERE quantidade > 0
           RETURNING id
         )
         SELECT produto_criado.*
         FROM produto_criado
         LEFT JOIN movimentacao ON TRUE`,
        [
          nome.trim(),
          codigo.trim(),
          preco_centavos,
          quantidade,
          quantidade_minima,
          categoriaNome,
          req.session.usuarioNome?.trim() || "Usuário",
        ]
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
      const { nome, codigo, preco_centavos, categoria, quantidade_minima } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof codigo !== "string" ||
        !codigo.trim() ||
        !Number.isSafeInteger(preco_centavos) ||
        preco_centavos < 0 ||
        !Number.isSafeInteger(quantidade_minima) ||
        quantidade_minima < 0 ||
        (categoria !== undefined && typeof categoria !== "string") ||
        (typeof categoria === "string" && categoria.trim().length > 80)
      ) {
        res.status(400).json({ erro: "Dados inválidos." });
        return;
      }

      let categoriaNome: string | null | undefined;
      if (typeof categoria === "string") {
        categoriaNome = categoria.trim() || null;
        if (categoriaNome) {
          const categoriaExistente = await db.query(
            "SELECT nome FROM categorias WHERE LOWER(nome) = LOWER($1)",
            [categoriaNome]
          );
          if (categoriaExistente.rowCount === 0) {
            res.status(400).json({ erro: "A categoria selecionada não existe." });
            return;
          }
          categoriaNome = categoriaExistente.rows[0].nome;
        }
      }

      const resultado = await db.query(
        `UPDATE produtos
         SET nome = $1,
             codigo = $2,
             preco_centavos = $3,
             quantidade_minima = $4,
             categoria = CASE WHEN $5::boolean THEN $6::text ELSE categoria END
         WHERE id = $7
         RETURNING *`,
        [
          nome.trim(),
          codigo.trim(),
          preco_centavos,
          quantidade_minima,
          categoria !== undefined,
          categoriaNome ?? null,
          req.params.id,
        ]
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
