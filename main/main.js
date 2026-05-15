const { app, BrowserWindow, ipcMain } = require('electron');
const serve = require('electron-serve');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Smart Clinic - Dental Management System',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    backgroundColor: '#f8fafc',
  });

  if (isProd) {
    mainWindow.setMenu(null);
  }

  if (isProd) {
    mainWindow.loadURL('app://./index.html');
  } else {
    const port = process.argv[2];
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('set-api-url', (_, url) => {
  return true;
});

ipcMain.handle('get-api-url', () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
});