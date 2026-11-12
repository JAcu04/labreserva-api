// H14: en producción un error 5xx no debe revelar detalles internos
// (stack trace, rutas del servidor, mensajes de la base de datos). El
// detalle completo se registra solo en el log del servidor.
export function errorHandler(err, req, res, _next) {
  console.error(err);

  const status = err.status ?? 500;
  const isServerError = status >= 500;

  res.status(status).json({
    error: isServerError ? 'Error interno' : err.message,
    path: req.originalUrl,
  });
}
