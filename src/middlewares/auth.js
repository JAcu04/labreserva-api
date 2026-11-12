import { verifyToken } from '../lib/jwt.js';
import { HttpError } from '../utils/http-error.js';

export function requireAuth(req, _res, next) {
  const token = req.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new HttpError(401, 'Token requerido');

  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub), email: payload.email, role: payload.role };
  } catch {
    throw new HttpError(401, 'Token inválido');
  }
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') throw new HttpError(403, 'Solo para administradores');
  next();
}

// H03: helper generico de autorizacion por rol, para no repetir la
// comprobacion a mano en cada ruta que necesite restringirse a ciertos roles.
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      throw new HttpError(403, 'No tiene permisos para este recurso');
    }
    next();
  };
}
