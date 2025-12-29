const db = require('../db');

/**
 * BookingDetail Model
 * Handles database operations for booking_details table
 * Stores full booking form payload as JSON
 */

class BookingDetail {
  /**
   * Create booking details (full JSON payload)
   */
  static create(booking_id, details_json, callback) {
    const sql = `
      INSERT INTO booking_details (booking_id, details_json)
      VALUES (?, ?)
    `;

    // Ensure details_json is a string (JSON)
    const jsonString = typeof details_json === 'string' 
      ? details_json 
      : JSON.stringify(details_json);

    db.run(sql, [booking_id, jsonString], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { 
        id: this.lastID, 
        booking_id, 
        details_json: JSON.parse(jsonString) 
      });
    });
  }

  /**
   * Get booking details by booking_id
   */
  static findByBookingId(booking_id, callback) {
    const sql = 'SELECT * FROM booking_details WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1';
    db.get(sql, [booking_id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      if (row) {
        // Parse JSON string back to object
        try {
          row.details_json = JSON.parse(row.details_json);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      callback(null, row);
    });
  }

  /**
   * Get booking details by ID
   */
  static findById(id, callback) {
    const sql = 'SELECT * FROM booking_details WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      if (row) {
        // Parse JSON string back to object
        try {
          row.details_json = JSON.parse(row.details_json);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      callback(null, row);
    });
  }

  /**
   * Update booking details
   */
  static update(id, details_json, callback) {
    const jsonString = typeof details_json === 'string' 
      ? details_json 
      : JSON.stringify(details_json);

    const sql = 'UPDATE booking_details SET details_json = ? WHERE id = ?';

    db.run(sql, [jsonString, id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Delete booking details
   */
  static delete(id, callback) {
    const sql = 'DELETE FROM booking_details WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }
}

module.exports = BookingDetail;
