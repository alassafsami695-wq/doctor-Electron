import { contextBridge, ipcRenderer } from 'electron';

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // API URL management
  setApiUrl: (url: string) => ipcRenderer.invoke('set-api-url', url),
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      setApiUrl: (url: string) => Promise<boolean>;
      getApiUrl: () => Promise<string>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}