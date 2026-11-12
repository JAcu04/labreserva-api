import { db } from '../../db.js';

const COLUMNS = `r.id, r.lab_id, l.name AS lab, r.user_id, u.name AS user, u.email,
  r.date, r.start_hour, r.end_hour, r.purpose, r.created_at`;
const FROM = 'FROM reservations r JOIN labs l ON l.id = r.lab_id JOIN users u ON u.id = r.user_id';

export const reservationsRepository = {
  findAll() {
    return db.prepare(`SELECT ${COLUMNS} ${FROM} ORDER BY r.date, r.start_hour`).all();
  },

  findByUser(userId) {
    return db.prepare(`SELECT ${COLUMNS} ${FROM} WHERE r.user_id = ? ORDER BY r.date, r.start_hour`).all(userId);
  },

  // Sin filtro de dueño: solo para uso interno (admin, o justo tras un create/insert).
  findById(id) {
    return db.prepare(`SELECT ${COLUMNS} ${FROM} WHERE r.id = ?`).get(id);
  },

  // H04: el ownerId sale del token verificado (req.user.id), nunca de la URL
  // ni del body. Si la reserva no es de ese usuario, se comporta como si no
  // existiera (misma respuesta que un id inexistente).
  findByIdForOwner(id, ownerId) {
    return db.prepare(`SELECT ${COLUMNS} ${FROM} WHERE r.id = ? AND r.user_id = ?`).get(id, ownerId);
  },

  findOverlapping(labId, date, startHour, endHour) {
    return db
      .prepare(
        'SELECT id FROM reservations WHERE lab_id = ? AND date = ? AND start_hour < ? AND end_hour > ?',
      )
      .get(labId, date, endHour, startHour);
  },

  create({ labId, userId, date, startHour, endHour, purpose }) {
    const { lastInsertRowid } = db
      .prepare(
        'INSERT INTO reservations (lab_id, user_id, date, start_hour, end_hour, purpose) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(labId, userId, date, startHour, endHour, purpose);
    return this.findById(lastInsertRowid);
  },

  // Sin filtro de dueño: solo para uso interno (admin).
  remove(id) {
    return db.prepare('DELETE FROM reservations WHERE id = ?').run(id).changes > 0;
  },

  // H05: mismo principio que findByIdForOwner, aplicado a la cancelación.
  removeForOwner(id, ownerId) {
    return db.prepare('DELETE FROM reservations WHERE id = ? AND user_id = ?').run(id, ownerId).changes > 0;
  },
};
