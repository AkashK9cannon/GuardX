const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("GuardX", {
  // Sending messages to main
  CreateNewTab: (TabStats) => ipcRenderer.send("CreateNewTab", TabStats),
  SetActiveTab: (TabId) => ipcRenderer.send("SetActiveTab", TabId),
  ShowActiveTab: (TabId) => ipcRenderer.send("ShowActiveTab", TabId),
  ChangeTabs: () => ipcRenderer.send("setactivetab"),
  SetupWinSizeToggle: (msg) => ipcRenderer.send("SetupWinSizeToggle", msg),

  Minimize: () => ipcRenderer.send("Minimize"),
  UnMaximize: () => ipcRenderer.send("UnMaximize"),
  Maximize: () => ipcRenderer.send("Maximize"),
  CloseTab: (d, fbid) => ipcRenderer.send("CloseTab", d, fbid),

  ReloadTab: (id) => ipcRenderer.send("ReloadTab", id),
  NavigateBack: (id) => ipcRenderer.send('NavigateBack', id),
  NavigateForward: (id) => ipcRenderer.send('NavigateForward', id),

  OpenSettings: () => ipcRenderer.send("OpenSettings"),
  NavigateTabTo: (taburl, id, TabId) => 
    ipcRenderer.send("NavigateTabTo", taburl, id, TabId),
  ActiveTabFocus: () => ipcRenderer.send(`ActiveTabFocus`),
  CloseApp: () => ipcRenderer.send("CloseApp"),
  
  // Receiving messages from main
  MsgFromBackend: (channel, callback) => {
    ipcRenderer.on(channel, (event, data) => {
      callback(data);
    });
  },

  // One-off tab update listener
  CreatedtabUpdate: (callback) => {
    ipcRenderer.on("Update-Tab-data", (e, data) => callback(data));
  },
});
