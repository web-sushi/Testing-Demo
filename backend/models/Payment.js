const db = require('../db');

/**
 * Payment Model
 * Handles database operations for payments table
 */

class Payment {
  /**
   * Create a new payment
   */
  static create(paymentData, callback) {
    const {
      booking_id,
      stripe_session_id,
      amount,
      currency = 'USD',
      status = 'pending'
    } = paymentData;

    const sql = `
      INSERT INTO payments (booking_id, stripe_session_id, amount, currency, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [booking_id, stripe_session_id, amount, currency, status], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: this.lastID, ...paymentData });
    });
  }

  /**
   * Get all payments
   */
  static findAll(callback) {
    const sql = 'SELECT * FROM payments ORDER BY created_at DESC';
    db.all(sql, [], callback);
  }

  /**
   * Get payment by ID
   */
  static findById(id, callback) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    db.get(sql, [id], callback);
  }

  /**
   * Get payment by booking_id
   */
  static findByBookingId(booking_id, callback) {
    const sql = 'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC';
    db.all(sql, [booking_id], callback);
  }

  /**
   * Get payment by Stripe session ID
   */
  static findByStripeSessionId(stripe_session_id, callback) {
    const sql = 'SELECT * FROM payments WHERE stripe_session_id = ?';
    db.get(sql, [stripe_session_id], callback);
  }

  /**
   * Update payment
   */
  static update(id, paymentData, callback) {
    const fields = [];
    const values = [];

    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(paymentData[key]);
      }
    });

    if (fields.length === 0) {
      return callback(new Error('No fields to update'), null);
    }

    values.push(id);
    const sql = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Delete payment
   */
  static delete(id, callback) {
    const sql = 'DELETE FROM payments WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Get payments by status
   */
  static findByStatus(status, callback) {
    const sql = 'SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC';
    db.all(sql, [status], callback);
  }
}

module.exports = Payment;