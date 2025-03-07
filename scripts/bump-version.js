// scripts/bump-version.js
const fs = require('fs');
const manifest = require('../manifest.json');

// Usage: node bump-version.js patch|minor|major
const type = process.argv[2] || 'patch';

const [major, minor, patch] = manifest.version.split('.').map(Number);
let newVersion;

switch(type) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

manifest.version = newVersion;
fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Version bumped to ${newVersion}`);