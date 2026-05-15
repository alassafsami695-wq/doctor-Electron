const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  setApiUrl: (url) => ipcRenderer.invoke('set-api-url', url),
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});
