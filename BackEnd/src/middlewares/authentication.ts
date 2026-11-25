
import type {
  Request,
  Response,
  NextFunction,
} from "express";

export function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.usuarioId) {
    res.status(401).json({
      erro: "Você precisa fazer login.",
    });
    return;
  }

  next();
}
