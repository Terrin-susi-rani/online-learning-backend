const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configure database path
const dbPath = path.resolve(__dirname, '../../online-learning.db');

// Verify database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at:', dbPath);
  process.exit(1);
}

// Verify seed file exists
const seedPath = path.resolve(__dirname, '../../database/s.sql');
if (!fs.existsSync(seedPath)) {
  console.error('Seed file does not exist at:', seedPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }

  console.log('Connected to the database');
  
  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
      db.close();
      process.exit(1);
    }

    // Read the seed file
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Split and clean statements
    const statements = seedSQL.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement with error handling
    const executeNext = (index) => {
      if (index >= statements.length) {
        db.close();
        console.log('Database seeding completed successfully');
        process.exit(0);
        return;
      }

      const statement = statements[index];
      console.log(`Executing statement ${index + 1}/${statements.length}`);
      
      db.run(statement, (err) => {
        if (err) {
          console.error(`Error in statement ${index + 1}:`, err.message);
          console.error('Failed statement:', statement);
          db.close();
          process.exit(1);
        }
        
        executeNext(index + 1);
      });
    };

    executeNext(0);
  });
});