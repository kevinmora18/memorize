/**
 * AuthMiddleware - Middleware Express de autenticación y autorización
 *
 * EXPLICACIÓN POO Y SOLID:
 * - SRP: Responsable únicamente de validar credenciales y roles en el transporte HTTP
 * - DIP: No depende de implementaciones concretas, solo del estándar Bearer Token
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthTokenPayload } from './JwtUtil';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

/**
 * Requiere un token JWT válido. Adjunta { userId, role, username } a req.user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Autenticación requerida' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Requiere token JWT válido + rol de administrador
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
      return;
    }
    next();
  });
}

/**
 * Verifica que el usuario autenticado sea el dueño del recurso :userId
 */
export function requireOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const targetUserId = req.params.userId || req.body.userId;
  if (!req.user || req.user.userId !== targetUserId) {
    res.status(403).json({ error: 'Acceso denegado: no puedes operar sobre la cuenta de otro usuario' });
    return;
  }
  next();
}