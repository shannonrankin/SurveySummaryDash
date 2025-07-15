const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const audioDir = path.join(__dirname, '..', 'public', 'audio');
const manifestPath = path.join(dataDir, 'data_manifest.json');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Get CSV files
const csvFiles = fs.existsSync(dataDir) 
  ? fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'))
  : [];

// Get audio files
const audioFiles = fs.existsSync(audioDir)
  ? fs.readdirSync(audioDir).filter(file => file.endsWith('.wav'))
  : [];

// Create manifest with both CSV and audio files
const manifest = {
  csvFiles,
  audioFiles,
  datasets: csvFiles.map(file => {
    const [project, species] = file.replace('.csv', '').split('_');
    return { file, project, species };
  })
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated with ${csvFiles.length} CSV files and ${audioFiles.length} audio files.`); 