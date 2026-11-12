import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

// H09: MD5 es un hash rápido, sin sal ni factor de costo — pensado para
// integridad de archivos, no para contraseñas. Se reemplaza por scrypt
// (viene incluido en node:crypto, no agrega dependencias) con sal
// aleatoria por contraseña. Formato almacenado: "<saltHex>:<hashHex>".
export function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, KEY_LENGTH);

  // Comparación en tiempo constante: evita filtrar por cuánto tarda la
  // comparación cuántos bytes del hash coinciden.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
