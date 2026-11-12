import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { usersRepository } from './users.repository.js';
import { HttpError } from '../../utils/http-error.js';

const withoutHash = ({ password_hash, ...user }) => user;

// H01: campos que el propio usuario puede editar de su perfil.
// "role" (y cualquier otro campo del modelo) queda fuera a propósito:
// nunca debe poder venir del cliente.
const SELF_SERVICE_FIELDS = ['name', 'phone', 'carnet'];

function buildProfileUpdate(body) {
  const rejected = Object.keys(body).filter((key) => !SELF_SERVICE_FIELDS.includes(key));
  if (rejected.length > 0) {
    throw new HttpError(400, `Campo no editable: ${rejected.join(', ')}`);
  }
  const changes = {};
  for (const field of SELF_SERVICE_FIELDS) {
    if (body[field] !== undefined) changes[field] = body[field];
  }
  return changes;
}

export const usersRouter = Router();

usersRouter.use(requireAuth);

// Directorio: los profesores (y admins) lo usan para buscar a los estudiantes
// de su grupo. H03: antes cualquier usuario autenticado lo veia, hashes
// incluidos; ahora exige rol y nunca devuelve password_hash.
usersRouter.get('/', requireRole('profesor', 'admin'), (_req, res) => {
  res.json(usersRepository.findAll().map(withoutHash));
});

usersRouter.get('/me', (req, res) => {
  res.json(withoutHash(usersRepository.findById(req.user.id)));
});

// Actualizar el perfil propio (nombre, teléfono, carnet...).
// H01: solo se aceptan los campos de SELF_SERVICE_FIELDS; cualquier otro
// campo en el body (como "role") hace que la petición se rechace con 400.
usersRouter.patch('/me', (req, res) => {
  const user = usersRepository.findById(req.user.id);
  const changes = buildProfileUpdate(req.body);
  const updated = usersRepository.update({ ...user, ...changes });
  res.json(withoutHash(updated));
});
