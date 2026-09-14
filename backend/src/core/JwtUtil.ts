/**
 * JwtUtil - Emisión y verificación de tokens JWT
 *
 * EXPLICACIÓN POO Y SOLID:
 * - SRP: Unica responsabilidad de crear y validar tokens firmados
 * - Encapsula el secreto y el algoritmo de firma
 */
import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string;
  role: string;
  username: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'memorize_dev_insecure_secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && (decoded as AuthTokenPayload).userId) {
      return {
        userId: (decoded as AuthTokenPayload).userId,
        role: (decoded as AuthTokenPayload).role || 'player',
        username: (decoded as AuthTokenPayload).username ?? null,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}