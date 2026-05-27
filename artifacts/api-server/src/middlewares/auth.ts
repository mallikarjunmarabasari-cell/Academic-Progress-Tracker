import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload || typeof payload.userId !== "number") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  req.userId = payload.userId as number;
  req.userRole = payload.role as string;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
