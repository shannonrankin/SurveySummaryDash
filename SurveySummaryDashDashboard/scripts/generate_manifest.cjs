const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const manifestPath = path.join(dataDir, 'data_manifest.json');

const files = fs.readdirSync(dataDir)
  .filter(file => file.endsWith('.csv'));

fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
console.log(`Manifest generated with ${files.length} CSV files.`); 