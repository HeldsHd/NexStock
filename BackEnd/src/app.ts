
import "dotenv/config";
import cors from "cors";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import { db } from "./db.js";
import routes from "./routes.js";

declare module "express-session" {
  interface SessionData {
    usuarioId?: number;
    usuarioNome?: string;
  }
}

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "Configure SESSION_SECRET no .env com pelo menos 32 caracteres."
  );
}

const PgStore = connectPgSimple(session);

// Permitir comunicação com o frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Permitir receber JSON
app.use(express.json());

// Configurar sessões
app.use(
  session({
    name: "nexstock.sid",

    store: new PgStore({
      pool: db,
      tableName: "sessoes",
      createTableIfMissing: true,
    }),

    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// Registrar as rotas
app.use(routes);

export default app;
