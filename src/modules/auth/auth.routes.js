import { Router } from 'express';
import { HttpError } from '../../utils/http-error.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { signToken } from '../../lib/jwt.js';
import { usersRepository } from '../users/users.repository.js';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const { name, email, password, carnet } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Nombre, email y contraseña son obligatorios');
  if (usersRepository.findByEmail(email)) throw new HttpError(409, 'El email ya está registrado');

  const user = usersRepository.create({
    name,
    email,
    carnet,
    passwordHash: hashPassword(password),
    role: 'estudiante',
  });
  res.status(201).json(user);
});

// H12: ya no se registra el body (contenía la contraseña en texto plano),
// y email inexistente / contraseña incorrecta responden igual, para no
// permitir enumerar qué correos están registrados.
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = usersRepository.findByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, role: user.role },
  });
});
