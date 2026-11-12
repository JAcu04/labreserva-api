import path from 'node:path';

// H10: sin JWT_SECRET no hay forma segura de firmar/verificar tokens, así
// que ya no se usa 'supersecreto' (ni ningún otro valor) como respaldo:
// si falta, el servidor no arranca.
if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el entorno (.env). El servidor no puede arrancar sin un secreto real.');
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  manualsDir: path.resolve('files/manuales'),
  // H15: lista explícita de orígenes permitidos para CORS, en vez de
  // reflejar cualquier Origin. Sin esta variable, solo el propio
  // frontend servido por esta API.
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
};
