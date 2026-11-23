
import { Router } from "express";

import authController from "./controllers/authController.js";
import produtoController from "./controllers/produtoController.js";
import estoqueController from "./controllers/estoqueController.js";

import { authentication } from "./middlewares/authentication.js";

const routes = Router();

// Autenticação
routes.post("/login", authController.login);
routes.get("/me", authentication, authController.me);
routes.post("/logout", authentication, authController.logout);

// Produtos
routes.get("/produtos", authentication, produtoController.list);
routes.get("/produtos/:id", authentication, produtoController.getById);
routes.post("/produtos", authentication, produtoController.create);
routes.put("/produtos/:id", authentication, produtoController.update);
routes.delete("/produtos/:id", authentication, produtoController.delete);

// Estoque
routes.get("/estoque", authentication, estoqueController.list);
routes.post("/estoque/entrada", authentication, estoqueController.entrada);
routes.post("/estoque/saida", authentication, estoqueController.saida);

export default routes;
