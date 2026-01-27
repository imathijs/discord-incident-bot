const fs = require('node:fs');
const { google } = require('googleapis');

let cachedClient = null;

function getCredentials() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    try {
      return JSON.parse(rawJson);
    } catch (err) {
      console.error('Google Sheets: JSON parse error in GOOGLE_SERVICE_ACCOUNT_JSON');
      return null;
    }
  }

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (err) {
      console.error('Google Sheets: base64 parse error in GOOGLE_SERVICE_ACCOUNT_B64');
      return null;
    }
  }

  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Google Sheets: cannot read GOOGLE_SERVICE_ACCOUNT_FILE');
      return null;
    }
  }

  return null;
}

function isSheetsEnabled(config) {
  return (
    config?.googleSheetsEnabled &&
    config?.googleSheetsSpreadsheetId &&
    config?.googleSheetsSheetName
  );
}

function getSheetsClient() {
  if (cachedClient) return cachedClient;
  const credentials = getCredentials();
  if (!credentials) return null;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  cachedClient = google.sheets({ version: 'v4', auth });
  return cachedClient;
}

function extractRowNumber(updatedRange) {
  if (!updatedRange) return null;
  const match = updatedRange.match(/!A(\d+)/);
  if (!match) return null;
  return Number(match[1]) || null;
}

async function appendIncidentRow({ config, row }) {
  if (!isSheetsEnabled(config)) return null;
  const client = getSheetsClient();
  if (!client) return null;

  try {
    const res = await client.spreadsheets.values.append({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: `${config.googleSheetsSheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [row] }
    });
    return extractRowNumber(res?.data?.updates?.updatedRange);
  } catch (err) {
    console.error('Google Sheets: append failed', err?.message || err);
    return null;
  }
}

async function updateIncidentStatus({ config, rowNumber, status }) {
  if (!isSheetsEnabled(config) || !rowNumber) return false;
  const client = getSheetsClient();
  if (!client) return false;

  try {
    await client.spreadsheets.values.update({
      spreadsheetId: config.googleSheetsSpreadsheetId,
      range: `${config.googleSheetsSheetName}!A${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[status]] }
    });
    return true;
  } catch (err) {
    console.error('Google Sheets: status update failed', err?.message || err);
    return false;
  }
}

module.exports = {
  appendIncidentRow,
  updateIncidentStatus
};
