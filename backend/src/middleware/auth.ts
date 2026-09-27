import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthedRequest extends Request {
  user?: { id: string; role: "peserta" | "admin"; email: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token otentikasi tidak ditemukan." });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthedRequest["user"];
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa." });
  }
}
