const fs = require('node:fs');
const path = require('node:path');

const config = require('../config.json');
const configPath = path.join(__dirname, '..', 'config.json');
const token = process.env.DISCORD_TOKEN;

function saveConfig() {
  try {
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.error('Config opslaan mislukt:', err);
  }
}

function generateIncidentNumber() {
  const current = Number(config.incidentCounter) || 2026000;
  const next = current + 1;
  config.incidentCounter = next;
  saveConfig();
  return `INC-${next}`;
}

module.exports = {
  config,
  configPath,
  token,
  saveConfig,
  generateIncidentNumber
};
