const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true,
  appVersion: '2.2.0',
  toggleFullScreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  setFullScreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
  isFullScreen: () => ipcRenderer.invoke('is-fullscreen'),
});
