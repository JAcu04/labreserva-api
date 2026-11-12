import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const ALGORITHM = 'HS256';

// H10: tokens con expiración (antes eran válidos para siempre) y algoritmo
// fijo tanto al firmar como al verificar (evita que alguien fuerce un
// algoritmo distinto, p. ej. "none", al validar el token).
export function signToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, config.jwtSecret, {
    algorithm: ALGORITHM,
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: [ALGORITHM] });
}
