const fs = require('fs');
const buf = fs.readFileSync('db/seed.sql').slice(0, 4);
console.log('BOM:', buf.toString('hex'));
