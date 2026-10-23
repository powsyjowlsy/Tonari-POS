const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Start the local network server for smartphone access
const { server, getLocalNetworkIp, PORT } = require('./server');

let mainWindow = null;

function getActiveIp() {
  return getLocalNetworkIp();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    backgroundColor: '#F3F4F6',
    title: 'TONARI - Point of Sale System',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Thermal Receipt Printing
ipcMain.handle('print-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Main window not available' };

  return new Promise((resolve) => {
    mainWindow.webContents.print({
      silent: options.silent || false,
      printBackground: true,
      deviceName: options.deviceName || ''
    }, (success, failureReason) => {
      if (!success) {
        resolve({ success: false, error: failureReason });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// IPC Handler: Save CSV Sales Report directly to Desktop
ipcMain.handle('save-csv-report', async (event, { filename, content }) => {
  try {
    const desktopDir = app.getPath('desktop');
    const reportsDir = path.join(desktopDir, 'Tonari_Sales_Reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const targetFile = path.join(reportsDir, filename);
    fs.writeFileSync(targetFile, content, 'utf8');
    return { success: true, filePath: targetFile };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Retrieve Local Network Info
ipcMain.handle('get-network-info', async () => {
  return {
    localIp: getActiveIp(),
    port: PORT,
    fullUrl: `http://${getActiveIp()}:${PORT}`
  };
});
