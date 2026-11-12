import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config.js';
import { HttpError } from '../../utils/http-error.js';

export const filesRouter = Router();

// Manuales de uso de los laboratorios.
// GET /api/files          → lista de manuales
// GET /api/files?name=... → descarga un manual
// H07: "name" solo puede ser un nombre de archivo simple (sin "/" ni "..")
// y, además, la ruta resuelta debe seguir dentro de manualsDir. Las dos
// comprobaciones son necesarias: la lista blanca de caracteres evita la
// mayoría de los intentos, y la verificación de la ruta resuelta cubre
// cualquier forma de codificarlo que se nos haya escapado.
filesRouter.get('/', (req, res) => {
  const { name } = req.query;
  if (!name) return res.json(fs.readdirSync(config.manualsDir));

  if (typeof name !== 'string' || !/^[\w.-]+$/.test(name) || name.includes('..')) {
    throw new HttpError(400, 'Nombre de archivo inválido');
  }

  const manualsDir = path.resolve(config.manualsDir);
  const file = path.resolve(manualsDir, name);
  if (file !== manualsDir && !file.startsWith(manualsDir + path.sep)) {
    throw new HttpError(400, 'Nombre de archivo inválido');
  }

  if (!fs.existsSync(file)) throw new HttpError(404, 'Manual no encontrado');
  res.type('text/plain').send(fs.readFileSync(file, 'utf8'));
});
