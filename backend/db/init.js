const fs = require('fs');
const path = require('path');

/**
 * Execute a database operation wrapped in a promise
 */
function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

/**
 * Migrate bookings table to include 'contacted' status in CHECK constraint
 * SQLite doesn't support ALTER TABLE for CHECK constraints, so we need to:
 * 1. Create new table with updated constraint
 * 2. Copy data from old table
 * 3. Drop old table
 * 4. Rename new table
 * 5. Recreate indexes
 * @param {Object} db - SQLite database instance
 * @returns {Promise} - Resolves on success, rejects on error
 */
function migrateBookingsStatus(db) {
  return new Promise((resolve, reject) => {
    // Check if migration is needed by checking the table definition
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'", (err, row) => {
      if (err) {
        return reject(err);
      }

      // If table doesn't exist, no migration needed
      if (!row || !row.sql) {
        return resolve();
      }

      // Check if 'contacted' is already in the constraint
      if (row.sql.includes("'contacted'")) {
        // Migration already done
        return resolve();
      }

      console.log('Migrating bookings table to include "contacted" status...');

      // Start transaction and chain operations
      dbRun(db, 'BEGIN TRANSACTION')
        .then(() => {
          // Step 1: Create new table with updated constraint
          return dbRun(db, `
            CREATE TABLE bookings_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              contact TEXT,
              people INTEGER NOT NULL,
              booking_type TEXT NOT NULL CHECK(booking_type IN ('regional', 'specialized', 'customized')),
              selected_date DATE,
              estimated_price DECIMAL(10, 2),
              status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
        })
        .then(() => {
          // Step 2: Copy data from old table to new table
          return dbRun(db, `
            INSERT INTO bookings_new (id, name, email, contact, people, booking_type, selected_date, estimated_price, status, created_at)
            SELECT id, name, email, contact, people, booking_type, selected_date, estimated_price, status, created_at
            FROM bookings
          `);
        })
        .then(() => {
          // Step 3: Drop old table
          return dbRun(db, 'DROP TABLE bookings');
        })
        .then(() => {
          // Step 4: Rename new table to original name
          return dbRun(db, 'ALTER TABLE bookings_new RENAME TO bookings');
        })
        .then(() => {
          // Step 5: Recreate indexes
          return dbRun(db, "CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)");
        })
        .then(() => {
          return dbRun(db, "CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type)");
        })
        .then(() => {
          return dbRun(db, "CREATE INDEX IF NOT EXISTS idx_bookings_selected_date ON bookings(selected_date)");
        })
        .then(() => {
          return dbRun(db, "CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at)");
        })
        .then(() => {
          // Commit transaction
          return dbRun(db, 'COMMIT');
        })
        .then(() => {
          console.log('Bookings table migration completed successfully');
          resolve();
        })
        .catch((migrationErr) => {
          // Rollback on error
          dbRun(db, 'ROLLBACK')
            .catch((rollbackErr) => {
              console.error('Error during rollback:', rollbackErr.message);
            })
            .finally(() => {
              reject(migrationErr);
            });
        });
    });
  });
}

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
        // Run migration to update status constraint if needed
        return migrateBookingsStatus(db)
          .then(() => resolve())
          .catch((migrationErr) => {
            console.error('Migration error (non-fatal):', migrationErr.message);
            // Continue even if migration fails (might already be migrated)
            resolve();
          });
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
