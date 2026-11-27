
import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
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

// Imagens de produto são enviadas como data URL, com limite para evitar payloads grandes.
app.use(express.json({ limit: "5mb" }));

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

const jsonErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large") {
    res.status(413).json({ erro: "O arquivo enviado excede o limite de 3 MB." });
    return;
  }
  next(error);
};

app.use(jsonErrorHandler);

export default app;
