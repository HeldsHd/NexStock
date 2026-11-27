
import type { Request, Response } from "express";
import { db } from "../db.js";
import { productJson } from "../utils/productJson.js";

type ParsedProductImage = {
  data: Buffer;
  mimeType: string;
};

const maximumImageSize = 3 * 1024 * 1024;

function parseProductImage(value: unknown): ParsedProductImage | null | false {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return false;

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;

  const data = Buffer.from(match[2], "base64");
  if (data.length === 0 || data.length > maximumImageSize || data.toString("base64") !== match[2]) {
    return false;
  }

  const hasValidSignature =
    (match[1] === "image/png" && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (match[1] === "image/jpeg" && data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255) ||
    (match[1] === "image/webp" && data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP");

  return hasValidSignature ? { data, mimeType: match[1] } : false;
}

function parseProductImageUrl(value: unknown): string | null | false {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return false;

  try {
    const url = new URL(value);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
      return false;
    }
    return url.toString();
  } catch {
    return false;
  }
}

const produtoController = {
  async list(_req: Request, res: Response) {
    try {
      const resultado = await db.query(
        `SELECT ${productJson("produto", `(SELECT movimentacao.created_at
                                           FROM movimentacoes movimentacao
                                           WHERE movimentacao.produto_id = produto.id
                                           ORDER BY movimentacao.created_at DESC, movimentacao.id DESC
                                           LIMIT 1)`)} AS produto
         FROM produtos produto
         ORDER BY produto.id DESC`
      );

      res.json(resultado.rows.map((row) => row.produto));
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao listar produtos." });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const resultado = await db.query(
        `SELECT ${productJson("produto", `(SELECT movimentacao.created_at
                                           FROM movimentacoes movimentacao
                                           WHERE movimentacao.produto_id = produto.id
                                           ORDER BY movimentacao.created_at DESC, movimentacao.id DESC
                                           LIMIT 1)`)} AS produto
         FROM produtos produto
         WHERE produto.id = $1`,
        [req.params.id]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json(resultado.rows[0].produto);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao buscar produto." });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nome, codigo, preco_centavos, quantidade, quantidade_minima, categoria, fornecedor, imagem, imagem_url } = req.body;
      const productImage = parseProductImage(imagem);
      const productImageUrl = parseProductImageUrl(imagem_url);

      if (productImage === false || productImageUrl === false || (productImage && productImageUrl)) {
        res.status(400).json({ erro: "Informe uma imagem válida por arquivo ou por URL." });
        return;
      }

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
        (typeof categoria === "string" && categoria.trim().length > 80) ||
        (fornecedor !== undefined && typeof fornecedor !== "string") ||
        (typeof fornecedor === "string" && fornecedor.trim().length > 160)
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
            (nome, codigo, preco_centavos, quantidade, quantidade_minima, categoria, fornecedor)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *
         ),
        produto_imagem AS (
          INSERT INTO produto_imagens (produto_id, imagem_url, imagem, imagem_mime)
          SELECT id, $8::text, $9::bytea, $10::varchar(40)
          FROM produto_criado
          WHERE $8::text IS NOT NULL OR $9::bytea IS NOT NULL
          RETURNING produto_id, imagem_url, (imagem IS NOT NULL) AS has_binary, updated_at
        ),
         movimentacao AS (
           INSERT INTO movimentacoes
             (produto_id, produto_nome, produto_codigo, tipo, quantidade,
              estoque_anterior, estoque_novo, usuario_nome)
          SELECT id, nome, codigo, 'entrada', quantidade, 0, quantidade, $11
           FROM produto_criado
           WHERE quantidade > 0
           RETURNING id, created_at
         )
         SELECT ${productJson("produto_criado", `COALESCE(
                    (SELECT movimentacao.created_at
                     FROM movimentacoes movimentacao
                     WHERE movimentacao.produto_id = produto_criado.id
                     ORDER BY movimentacao.created_at DESC, movimentacao.id DESC
                     LIMIT 1),
                    (SELECT movimentacao.created_at FROM movimentacao LIMIT 1)
                  )`, `CASE
                    WHEN produto_imagem.has_binary
                      THEN '/produtos/' || produto_imagem.produto_id::text || '/imagem?v=' || EXTRACT(EPOCH FROM produto_imagem.updated_at)::text
                    ELSE produto_imagem.imagem_url
                  END`)} AS produto
         FROM produto_criado
         LEFT JOIN movimentacao ON TRUE
         LEFT JOIN produto_imagem ON produto_imagem.produto_id = produto_criado.id`,
        [
          nome.trim(),
          codigo.trim(),
          preco_centavos,
          quantidade,
          quantidade_minima,
          categoriaNome,
          fornecedor?.trim() || null,
          productImageUrl,
          productImage?.data ?? null,
          productImage?.mimeType ?? null,
          req.session.usuarioNome?.trim() || "Usuário",
        ]
      );

      res.status(201).json(resultado.rows[0].produto);
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
      const { nome, codigo, preco_centavos, categoria, quantidade_minima, fornecedor, imagem, imagem_url } = req.body;
      const productImage = parseProductImage(imagem);
      const productImageUrl = parseProductImageUrl(imagem_url);

      if (productImage === false || productImageUrl === false || (productImage && productImageUrl)) {
        res.status(400).json({ erro: "Informe uma imagem válida por arquivo ou por URL." });
        return;
      }

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
        (typeof categoria === "string" && categoria.trim().length > 80) ||
        (fornecedor !== undefined && typeof fornecedor !== "string") ||
        (typeof fornecedor === "string" && fornecedor.trim().length > 160)
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
        `WITH produto_atualizado AS (
           UPDATE produtos
           SET nome = $1,
               codigo = $2,
               preco_centavos = $3,
               quantidade_minima = $4,
               categoria = CASE WHEN $5::boolean THEN $6::text ELSE categoria END,
               fornecedor = CASE WHEN $7::boolean THEN $8::varchar ELSE fornecedor END
           WHERE id = $9
           RETURNING *
         ),
         produto_imagem AS (
           INSERT INTO produto_imagens (produto_id, imagem_url, imagem, imagem_mime)
           SELECT id, $10::text, $11::bytea, $12::varchar(40)
           FROM produto_atualizado
           WHERE $13::boolean AND ($10::text IS NOT NULL OR $11::bytea IS NOT NULL)
           ON CONFLICT (produto_id) DO UPDATE
           SET imagem_url = EXCLUDED.imagem_url,
               imagem = EXCLUDED.imagem,
               imagem_mime = EXCLUDED.imagem_mime,
               updated_at = NOW()
           RETURNING produto_id, imagem_url, (imagem IS NOT NULL) AS has_binary, updated_at
         )
         SELECT ${productJson("produto_atualizado", `(SELECT movimentacao.created_at
                                                     FROM movimentacoes movimentacao
                                                     WHERE movimentacao.produto_id = produto_atualizado.id
                                                     ORDER BY movimentacao.created_at DESC, movimentacao.id DESC
                                                     LIMIT 1)`, `CASE
                    WHEN produto_imagem.has_binary
                      THEN '/produtos/' || produto_imagem.produto_id::text || '/imagem?v=' || EXTRACT(EPOCH FROM produto_imagem.updated_at)::text
                    ELSE produto_imagem.imagem_url
                  END`)} AS produto
         FROM produto_atualizado
         LEFT JOIN produto_imagem ON produto_imagem.produto_id = produto_atualizado.id`,
        [
          nome.trim(),
          codigo.trim(),
          preco_centavos,
          quantidade_minima,
          categoria !== undefined,
          categoriaNome ?? null,
          fornecedor !== undefined,
          fornecedor?.trim() || null,
          req.params.id,
          productImageUrl,
          productImage?.data ?? null,
          productImage?.mimeType ?? null,
          Boolean(productImage || productImageUrl),
        ]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ erro: "Produto não encontrado." });
        return;
      }

      res.json(resultado.rows[0].produto);
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

  async getImage(req: Request, res: Response) {
    try {
      const resultado = await db.query(
        "SELECT imagem, imagem_mime FROM produto_imagens WHERE produto_id = $1",
        [req.params.id]
      );

      if (resultado.rowCount === 0 || !Buffer.isBuffer(resultado.rows[0].imagem)) {
        res.status(404).json({ erro: "Imagem do produto não encontrada." });
        return;
      }

      res
        .set("Content-Type", resultado.rows[0].imagem_mime)
        .set("Cache-Control", "private, max-age=3600")
        .set("X-Content-Type-Options", "nosniff")
        .send(resultado.rows[0].imagem);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao buscar imagem do produto." });
    }
  },
};

export default produtoController;
