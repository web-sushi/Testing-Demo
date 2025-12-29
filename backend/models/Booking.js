const db = require('../db');

/**
 * Booking Model
 * Handles database operations for bookings table
 */

class Booking {
  /**
   * Create a new booking
   */
  static create(bookingData, callback) {
    const {
      name,
      email,
      contact,
      people,
      booking_type,
      selected_date,
      estimated_price,
      status = 'pending'
    } = bookingData;

    const sql = `
      INSERT INTO bookings (name, email, contact, people, booking_type, selected_date, estimated_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, email, contact, people, booking_type, selected_date, estimated_price, status], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: this.lastID, ...bookingData });
    });
  }

  /**
   * Get all bookings
   */
  static findAll(callback) {
    const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
    db.all(sql, [], callback);
  }

  /**
   * Get booking by ID
   */
  static findById(id, callback) {
    const sql = 'SELECT * FROM bookings WHERE id = ?';
    db.get(sql, [id], callback);
  }

  /**
   * Update booking
   */
  static update(id, bookingData, callback) {
    const fields = [];
    const values = [];

    Object.keys(bookingData).forEach(key => {
      if (bookingData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(bookingData[key]);
      }
    });

    if (fields.length === 0) {
      return callback(new Error('No fields to update'), null);
    }

    values.push(id);
    const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Delete booking
   */
  static delete(id, callback) {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Get bookings by status
   */
  static findByStatus(status, callback) {
    const sql = 'SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC';
    db.all(sql, [status], callback);
  }

  /**
   * Get bookings by booking_type
   */
  static findByType(booking_type, callback) {
    const sql = 'SELECT * FROM bookings WHERE booking_type = ? ORDER BY created_at DESC';
    db.all(sql, [booking_type], callback);
  }

  /**
   * Count confirmed bookings for a specific date
   * Only counts bookings with status 'confirmed' (pending and cancelled are excluded)
   */
  static countByDate(date, callback) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE selected_date = ? 
      AND status IN ('confirmed')
    `;
    db.get(sql, [date], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row ? row.count : 0);
    });
  }
}

module.exports = Booking;