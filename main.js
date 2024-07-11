const { app, BrowserWindow, ipcMain } = require('electron');
const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_KEY });

async function getPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    return response.results;
  } catch (error) {
    console.error(error);
  }
}

async function findInlineDatabase(pageId) {
  const pageContent = await getPageContent(pageId);
  for (const block of pageContent) {
    if (block.type === 'child_database') {
      const databaseId = block.id;
      console.log(`Found inline database with ID: ${databaseId}`);
      return databaseId;
    }
  }
  console.log('No inline database found on this page.');
  return null;
}

async function fetchNotionData() {
  const database_id = '261c30aa25d649898320e41125292a9a';
  const response = await notion.databases.query({ database_id: database_id });
  const data = response.results;
  const page_id = data[0].id;
  const database_month_id = await findInlineDatabase(page_id);
  const response2 = await notion.databases.query({ database_id: database_month_id });
  return response2.results;
}

ipcMain.handle('fetch-notion-data', async () => {
  return await fetchNotionData();
});

// Create the Electron browser window
function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  win.loadFile('index.html');
}

// Start Electron app
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
