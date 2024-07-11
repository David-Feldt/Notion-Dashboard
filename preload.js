const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchNotionData: () => ipcRenderer.invoke('fetch-notion-data')
});
