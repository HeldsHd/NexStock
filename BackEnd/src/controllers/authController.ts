
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, senha, lembrar } = req.body ?? {};

      if (
        typeof email !== "string" ||
        typeof senha !== "string" ||
        !email.trim() ||
        !senha
      ) {
        res.status(400).json({
          erro: "Informe seu e-mail e senha.",
        });
        return;
      }

      const resultado = await db.query(
        `SELECT id, nome, senha_hash
         FROM usuarios
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email.trim()]
      );

      const usuario = resultado.rows[0];

      const senhaCorreta = usuario
        ? await bcrypt.compare(senha, usuario.senha_hash)
        : false;

      if (!senhaCorreta) {
        res.status(401).json({
          erro: "E-mail ou senha incorretos.",
        });
        return;
      }

      req.session.regenerate((erro) => {
        if (erro) {
          res.status(500).json({
            erro: "Erro ao iniciar sessão.",
          });
          return;
        }

        req.session.usuarioId = usuario.id;
        req.session.usuarioNome = usuario.nome;

        req.session.cookie.maxAge =
          lembrar === true
            ? 7 * 24 * 60 * 60 * 1000
            : 8 * 60 * 60 * 1000;

        req.session.save((erro) => {
          if (erro) {
            res.status(500).json({
              erro: "Erro ao salvar sessão.",
            });
            return;
          }

          res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
              id: usuario.id,
              nome: usuario.nome,
            },
          });
        });
      });
    } catch (erro) {
      console.error("Erro no login:", erro);

      res.status(500).json({
        erro: "Erro interno do servidor.",
      });
    }
  },

  me(req: Request, res: Response) {
    res.json({
      usuario: {
        id: req.session.usuarioId,
        nome: req.session.usuarioNome,
      },
    });
  },

  logout(req: Request, res: Response) {
    req.session.destroy((erro) => {
      if (erro) {
        res.status(500).json({
          erro: "Erro ao encerrar sessão.",
        });
        return;
      }

      res.clearCookie("nexstock.sid", {
        path: "/",
        sameSite: "lax",
        secure: false,
      });

      res.json({
        mensagem: "Sessão encerrada.",
      });
    });
  },
};

export default authController;
