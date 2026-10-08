import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Google Sheets Auth ---
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env');
  }

  // Strip leading/trailing quotes if they exist (common with dotenv)
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.substring(1, key.length - 1);
  }

  const formattedKey = key.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function getSheetData(sheets, spreadsheetId, range) {
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return res.data.values || [];
  } catch (err) {
    console.error(`❌ Error reading range ${range}:`, err.message);
    return [];
  }
}

// Helper to get column value from alphabetical column letter (e.g. 'C', 'P')
function getValueByCol(row, colLetter) {
  let index = 0;
  for (let i = 0; i < colLetter.length; i++) {
    index = index * 26 + (colLetter.charCodeAt(i) - 64);
  }
  index = index - 1; // 0-indexed
  return row[index] !== undefined ? String(row[index]).trim() : '';
}

// Localized number parser (e.g. '€ 1.500,00' -> 1500)
function parseFormattedNumber(val) {
  if (!val) return 0;
  let clean = val
    .replace(/[€\s]/g, '')      // Remove € and spaces
    .replace(/\./g, '')         // Remove dots (thousand separators)
    .replace(/,/g, '.');        // Replace comma with dot (decimal separator)
  
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

// Localized date parser (e.g. '01/01/2026' or Excel serial date -> ISO string)
function parseSheetDate(val) {
  if (!val) return new Date().toISOString();
  
  // Try DD/MM/YYYY format first
  const parts = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    return new Date(Date.UTC(year, month, day)).toISOString();
  }
  
  // Try Excel serial number fallback
  const num = parseFloat(val);
  if (!isNaN(num)) {
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    return date.toISOString();
  }
  
  // Standard JS parser
  const parsed = Date.parse(val);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  
  return new Date().toISOString();
}

// --- API Endpoint ---
app.get('/api/finances', async (_req, res) => {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Missing GOOGLE_SPREADSHEET_ID in .env' });
    }

    // Read worksheets in parallel
    const [txRows, annoRows, sinkingRows, assetRows, debtRows, netWorthRows] = await Promise.all([
      getSheetData(sheets, spreadsheetId, 'Lista Movimenti!A2:E2000'),
      getSheetData(sheets, spreadsheetId, 'ANNO!A3:Q45'),
      getSheetData(sheets, spreadsheetId, 'Sinking Funds!A2:K50'),
      getSheetData(sheets, spreadsheetId, 'Investimenti!A2:I50'),
      getSheetData(sheets, spreadsheetId, 'Debiti!A2:H50'),
      getSheetData(sheets, spreadsheetId, 'Net Worth!A1:F20')
    ]);

    // --- Parse Transactions ---
    const transactions = [];
    for (let i = 0; i < txRows.length; i++) {
      const row = txRows[i];
      const category = getValueByCol(row, 'B');
      const importo = parseFormattedNumber(getValueByCol(row, 'C'));
      
      // Skip empty rows or rows with 0 amount
      if (!category || category === 'Categoria' || importo === 0) {
        continue;
      }

      const nome = getValueByCol(row, 'A') || category;
      const data = parseSheetDate(getValueByCol(row, 'D'));
      let tipo = getValueByCol(row, 'E');

      if (tipo === 'Spesa') {
        tipo = 'Spesa';
      } else if (tipo === 'Risparmio') {
        tipo = 'Risparmio';
      } else if (tipo === 'Entrata') {
        tipo = 'Entrata';
      } else {
        // Infer from category if empty
        if (category.includes('Stipendio') || category.includes('entrate') || category.includes('Entrate')) {
          tipo = 'Entrata';
        } else {
          tipo = 'Spesa';
        }
      }

      transactions.push({
        id: String(i + 1),
        nome,
        categoria: category,
        importo,
        data,
        tipo
      });
    }

    // --- Parse Budget & Initial Liquidita ---
    let budgetMensile = 1024;
    for (const row of annoRows) {
      if (row[0] === 'Totale Uscite') {
        budgetMensile = parseFormattedNumber(getValueByCol(row, 'P')) || 1024;
      }
    }

    let liquiditaIniziale = 1400.0;
    for (const row of netWorthRows) {
      if (row[0] === 'OGGI' && row.length >= 2) {
        // Net Worth is calculated using today's liquidity
        liquiditaIniziale = parseFormattedNumber(row[1]) || 1400.0;
      }
    }

    const budget = {
      speso: 0, // frontend calcola lo speso mensile
      budget: budgetMensile,
    };

    // --- Parse Categories (from ANNO layout) ---
    const categoriesSet = new Set();
    const categorie = [];

    function addCategory(fullName, tipo) {
      if (!fullName || categoriesSet.has(fullName)) return;
      categoriesSet.add(fullName);
      
      const emojiMatch = fullName.match(/^([^\w\s\d,.-]+)\s*(.*)$/u);
      const emoji = emojiMatch ? emojiMatch[1].trim() : '📌';
      
      categorie.push({
        nome: fullName,
        tipo,
        emoji
      });
    }

    // Entrate: rows 4-5 in ANNO (offset 1 to 3 in read scope A3:Q45)
    for (let r = 1; r <= 3; r++) { 
      const row = annoRows[r];
      if (row && row[0] && row[0].trim() !== "" && !row[0].includes("Totale")) {
        addCategory(row[0].trim(), 'Entrata');
      }
    }

    // Necessità: rows 13-19 (offset 10 to 16 in annoRows)
    for (let r = 10; r <= 16; r++) {
      const row = annoRows[r];
      if (row) {
        const catName = getValueByCol(row, 'B');
        if (catName && catName.trim() !== "" && !catName.includes("Totale") && !catName.includes("--")) {
          addCategory(catName.trim(), 'Spesa');
        }
      }
    }

    // Extra: rows 23-30 (offset 20 to 27 in annoRows)
    for (let r = 20; r <= 27; r++) {
      const row = annoRows[r];
      if (row) {
        const catName = getValueByCol(row, 'B');
        if (catName && catName.trim() !== "" && !catName.includes("Totale") && !catName.includes("--")) {
          addCategory(catName.trim(), 'Spesa');
        }
      }
    }

    const settings = {
      liquiditaIniziale,
      budgetMensile,
      categorie,
    };

    // --- Parse Sinking Funds ---
    const sinkingFunds = [];
    for (let i = 0; i < sinkingRows.length; i++) {
      const row = sinkingRows[i];
      const attivita = getValueByCol(row, 'A');
      if (!attivita || attivita === 'Attività') continue;

      const stato = (getValueByCol(row, 'B') === 'Completata' || getValueByCol(row, 'B') === 'Completato') ? 'Completata' : 'In corso';
      const obiettivo = parseFormattedNumber(getValueByCol(row, 'C'));
      const spese = parseFormattedNumber(getValueByCol(row, 'F'));
      const saldoAttuale = parseFormattedNumber(getValueByCol(row, 'G'));
      // risparmioMensile maps to total saved = saldoAttuale + spese
      const risparmioMensile = saldoAttuale + spese;
      const dataScadenza = parseSheetDate(getValueByCol(row, 'K'));

      sinkingFunds.push({
        id: String(i + 1),
        attivita,
        stato,
        obiettivo,
        risparmioMensile,
        spese,
        dataScadenza
      });
    }

    // --- Parse Assets ---
    const assets = [];
    for (let i = 0; i < assetRows.length; i++) {
      const row = assetRows[i];
      const asset = getValueByCol(row, 'A');
      if (!asset || asset === 'Asset/Strumento') continue;

      const quantita = parseFormattedNumber(getValueByCol(row, 'C')) || 1;
      const pmc = parseFormattedNumber(getValueByCol(row, 'D'));
      let prezzoAttuale = parseFormattedNumber(getValueByCol(row, 'F'));
      const valoreAttuale = parseFormattedNumber(getValueByCol(row, 'H'));

      if (prezzoAttuale === 0 && valoreAttuale > 0) {
        prezzoAttuale = valoreAttuale / quantita;
      }

      assets.push({
        id: String(i + 1),
        asset,
        quantita,
        pmc,
        prezzoAttuale
      });
    }

    // --- Parse Debts ---
    const debts = [];
    for (let i = 0; i < debtRows.length; i++) {
      const row = debtRows[i];
      const nome = getValueByCol(row, 'A');
      if (!nome || nome === 'Attività' || nome === 'TOTALI') continue;

      const valoreDebitoIniziale = parseFormattedNumber(getValueByCol(row, 'C'));
      const rataMensile = parseFormattedNumber(getValueByCol(row, 'D'));
      const totalePagato = parseFormattedNumber(getValueByCol(row, 'E'));

      debts.push({
        id: String(i + 1),
        nome,
        valoreDebitoIniziale,
        rataMensile,
        totalePagato
      });
    }

    res.json({
      kpis: {}, // Frontend calculates KPIs dynamically from arrays
      budget,
      transactions,
      sinkingFunds,
      assets,
      debts,
      settings,
    });

  } catch (err) {
    console.error('❌ Error fetching Google Sheets data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Finance API server running on http://localhost:${PORT}`);
});
