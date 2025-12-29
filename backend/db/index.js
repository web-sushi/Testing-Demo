const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const initializeDatabase = require('./init');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

// Create sqlite3 Database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }

  console.log('Connected to SQLite database');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
      return;
    }

    // Initialize database schema after connection and foreign keys are enabled
    initializeDatabase(db)
      .then(() => {
        // Schema initialization success is logged in init.js
      })
      .catch((err) => {
        console.error('Failed to initialize database schema:', err.message);
      });
  });
});

module.exports = db;
