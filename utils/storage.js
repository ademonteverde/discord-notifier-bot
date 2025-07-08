const fs = require('fs');

// DRY helper for loading or initializing JSON files
function loadOrInitJSON(path, fallback = {}) {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(fallback, null, 2), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(path));
}

function loadTracker(filePath) {
  const rawData = loadOrInitJSON(filePath);
  return new Set(Object.keys(rawData));
}

function saveTracker(filePath, trackerSet) {
  const data = {};
  trackerSet.forEach(id => {
    data[id] = true;
  });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadMembers() {
  return loadOrInitJSON('./data/members.json');
}

function saveMembers(data) {
  fs.writeFileSync('./data/members.json', JSON.stringify(data, null, 2));
}

module.exports = {
  loadTracker,
  saveTracker,
  loadMembers,
  saveMembers,
  loadOrInitJSON
};
