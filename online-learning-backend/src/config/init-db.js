const fs = require('fs');
const path = require('path');
const db = require('./database');

const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf-8');
const seeds = fs.readFileSync(path.join(__dirname, '../../database/seeds.sql'), 'utf-8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating schema', err.message);
  } else {
    console.log('✅ Schema created');
    db.exec(seeds, (err) => {
      if (err) {
        console.error('Error seeding data', err.message);
      } else {
        console.log('✅ Seeds inserted');
      }
    });
  }
});