const db = require('../db');

/**
 * Inquiry Model
 * Handles database operations for inquiries table
 */

class Inquiry {
  /**
   * Create a new inquiry
   */
  static create(inquiryData, callback) {
    const {
      name,
      email,
      contact,
      inquiry_type,
      message,
      status = 'new'
    } = inquiryData;

    const sql = `
      INSERT INTO inquiries (name, email, contact, inquiry_type, message, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, email, contact, inquiry_type, message, status], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: this.lastID, ...inquiryData });
    });
  }

  /**
   * Get all inquiries
   */
  static findAll(callback) {
    const sql = 'SELECT * FROM inquiries ORDER BY created_at DESC';
    db.all(sql, [], callback);
  }

  /**
   * Get inquiry by ID
   */
  static findById(id, callback) {
    const sql = 'SELECT * FROM inquiries WHERE id = ?';
    db.get(sql, [id], callback);
  }

  /**
   * Update inquiry
   */
  static update(id, inquiryData, callback) {
    const fields = [];
    const values = [];

    Object.keys(inquiryData).forEach(key => {
      if (inquiryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(inquiryData[key]);
      }
    });

    if (fields.length === 0) {
      return callback(new Error('No fields to update'), null);
    }

    values.push(id);
    const sql = `UPDATE inquiries SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Delete inquiry
   */
  static delete(id, callback) {
    const sql = 'DELETE FROM inquiries WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  /**
   * Get inquiries by status
   */
  static findByStatus(status, callback) {
    const sql = 'SELECT * FROM inquiries WHERE status = ? ORDER BY created_at DESC';
    db.all(sql, [status], callback);
  }
}

module.exports = Inquiry;
