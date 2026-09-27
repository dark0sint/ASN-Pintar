import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";

export function requireRole(...roles: Array<"peserta" | "admin">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Anda tidak memiliki akses untuk tindakan ini." });
    }
    next();
  };
}
