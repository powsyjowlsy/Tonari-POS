const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posNative', {
  isElectron: true,
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  saveCsvReport: (data) => ipcRenderer.invoke('save-csv-report', data),
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
  getAppVersion: () => '1.0.0'
});
