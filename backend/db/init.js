const fs = require('fs');
const path = require('path');

/**
 * Initialize database schema
 * Reads schema.sql and executes it to create all tables
 * Ensures schema is executed only once by checking if tables already exist
 * @param {Object} db - SQLite database instance
 * @returns {Promise} - Resolves on success, rejects on error
 */
function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    // Check if schema is already initialized by checking if bookings table exists
    // This ensures schema.sql is executed only once at startup
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'", (err, row) => {
      if (err) {
        console.error('Error checking if schema exists:', err.message);
        return reject(err);
      }

      // If bookings table exists, schema is already initialized
      if (row) {
        console.log('Database schema already initialized');
        return resolve();
      }

      // Schema not initialized, proceed with initialization
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      // Read schema file
      fs.readFile(schemaPath, 'utf8', (err, sql) => {
        if (err) {
          console.error('Error reading schema file:', err.message);
          return reject(err);
        }

        // Verify db.exec exists and execute schema SQL
        if (typeof db.exec !== 'function') {
          const error = new Error('db.exec is not a valid function on the database instance');
          console.error('Error:', error.message);
          return reject(error);
        }

        // Execute schema SQL using db.exec (valid sqlite3 Database method)
        db.exec(sql, (err) => {
          if (err) {
            console.error('Error initializing database schema:', err.message);
            return reject(err);
          }
          
          console.log('Database schema initialized successfully');
          resolve();
        });
      });
    });
  });
}

module.exports = initializeDatabase;
