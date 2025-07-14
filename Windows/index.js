const {
  app,
  BaseWindow,
  BrowserWindow,
  WebContentsView,
  screen,
  ipcMain,
  globalShortcut,
} = require("electron");
const { writeFileSync } = require("fs");
const { join } = require("path");
const { SearchEngine, readSettings, writeSettings } = require("./settings");


function AppWindow() {
  const TabStore = require('./TabStore');
  const Tabs = TabStore.getTabs();

  const ScrHeight = screen.getPrimaryDisplay().bounds.height;
  const ScrWidth = screen.getPrimaryDisplay().bounds.width;

  const Basewindow = new BaseWindow({
    frame: false,
    width: ScrWidth,
    height: ScrHeight,
    parent: true,
    skipTaskbar: false,
    center: true,
    closable: true,
    resizable: true,
    icon: join(__dirname, "./sysMedia/images/logo/lwthbg.png"),
  });

  const childWindows = Basewindow.getChildWindows();
  const ParentWidth = Basewindow.getBounds().width;
  const ParentHeight = Basewindow.getBounds().height;
  const [ParentPosX, ParentPosY] = Basewindow.getPosition();

  const appmenu = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, "./preload.js"),
      contextIsolation: true,
      sandbox: false,
      devTools: false
    },
  });

  appmenu.setBounds({ x: 0, y: 0, width: ParentWidth, height: ParentHeight });
  appmenu.webContents.loadFile(join(__dirname, "./AppScripts/Html/GuardXAppBar.html"));
  // appmenu.webContents.openDevTools();
  Basewindow.contentView.addChildView(appmenu);

  function SetWindowFocus() {
    const b = Tabs.find((t) => t.status == "active");
    const a = childWindows.find((w) => w.id == b.id);
    Basewindow.isFocused = false;
    a.isFocused = true;
  }
  ipcMain.on("ActiveTabFocus", () => SetWindowFocus());

  ipcMain.on("CreateNewTab", (event, tab) => {
    const { id, url, status, TabId } = tab;
    CreateNewTab(id, url, status, TabId);
    const activeTab = Tabs.find((t) => t.status === "active");
    if (activeTab) event.sender.send("Created-New-Tab", activeTab);
  });

  function SetActivetab(e, id) {
    Tabs.forEach((t) => (t.status = t.id === id ? "active" : "inactive"));
    e.sender.send("Set-Active-Tab", id);
    TabStore.setTabs(Tabs);
  }
  ipcMain.on("SetActiveTab", (e, id) => SetActivetab(e, id));

  function ShowActiveTab(e, id, url = null) {
    Tabs.forEach((t) => (t.status = t.id === id ? "active" : "inactive"));
    const w = Basewindow.getChildWindows().find((w) => w.id == id);
    if (!w) return console.warn(`❌ No window with ID ${id}`);
    Basewindow.getChildWindows().forEach((wc) => wc.id !== id && wc.hide());
    w.show();
    Basewindow.focus();
    w.isFocused(false);

    const updateTabData = () => {
      const loadedUrl = w.webContents.getURL() || SearchEngine();
      const wd = {
        id: w.id,
        title: w.webContents.getTitle() || "New Tab",
        url: loadedUrl,
      };
      const tIndex = Tabs.findIndex((t) => t.id === id);
      if (tIndex !== -1) Tabs[tIndex].url = loadedUrl;
      TabStore.setTabs(Tabs);
      e.sender.send("Showing-Active-Tab", wd);
    };

    if (url && url !== w.webContents.getURL()) {
      w.loadURL(url).then(() => w.webContents.once("did-finish-load", updateTabData));
    } else if (w.webContents.isLoading()) {
      w.webContents.once("did-finish-load", updateTabData);
    } else {
      updateTabData();
    }
  }
  ipcMain.on("ShowActiveTab", (e, id) => ShowActiveTab(e, id));

  ipcMain.on("CloseTab", (event, closedId, fallbackId) => {
    const closedIndex = Tabs.findIndex((t) => t.id === closedId);
    if (closedIndex === -1) return console.warn("Tab not found:", closedId);

    const closedTab = Tabs[closedIndex];
    const win = Basewindow.getChildWindows().find((w) => w.id === closedTab.TabID);
    if (win) win.close();

    Tabs.splice(closedIndex, 1);
    TabStore.setTabs(Tabs);
    console.log("Closed tab:", closedTab);

    if (fallbackId) {
      const fallbackTab = Tabs.find((t) => t.id === fallbackId);
      if (fallbackTab) {
        fallbackTab.status = "active";
        Basewindow.getChildWindows().forEach((w) => {
          if (w.id === fallbackTab.TabID) w.show();
          else w.hide();
        });
      } else {
        console.warn("Fallback tab not found:", fallbackId);
      }
    }
  });

  ipcMain.on("ReloadTab", (e, id) => {
    const b = Basewindow.getChildWindows().find((w) => w.id == id);
    b?.reload();
  });

  ipcMain.on("NavigateBack", (e, id) => {
    const b = Basewindow.getChildWindows().find((w) => w.id == id);
    if (b?.webContents.canGoBack()) b.webContents.goBack();
  });

  ipcMain.on("NavigateForward", (e, id) => {
    const b = Basewindow.getChildWindows().find((w) => w.id == id);
    if (b?.webContents.canGoForward()) b.webContents.goForward();
  });

  ipcMain.on("CloseApp", () => {
    Basewindow.getChildWindows().forEach((t) => t.close());
    TabStore.setTabs([]);
    if (process.platform !== "darwin") app.quit();
  });

  ipcMain.on("NavigateTabTo", (event, taburl, id, TabId) => {
    const ta = Tabs.find((t) => t.status === "active");
    const brw = Basewindow.getChildWindows().find((w) => w.id === id);

    if (brw && id === brw.id) {
      brw.loadURL(taburl);
      brw.webContents.once("did-finish-load", () => {
        const title = brw.webContents.getTitle();
        const url = brw.webContents.getURL();
        const favicon = url + "/favicon.ico";
        if (ta) ta.url = url;
        TabStore.setTabs(Tabs);
        event.sender.send("tab-data-loaded", {
          title,
          url,
          favicon,
          tabId: ta?.TabID,
        });
      });
    }
  });

  ipcMain.on("SetupWinSizeToggle", (event, msg) => {
    if (msg === "Minimize-Window") {
      Basewindow.focus();
      Basewindow.setBounds({ width: 800, height: 600 });
      Basewindow.center();
      Basewindow.unmaximize();
    } else if (msg === "Maximize-Window") {
      Basewindow.maximize();
    }
  });

  ipcMain.on("Minimize", () => {
    Basewindow.isFocused(true);
    Basewindow.focus();
    Basewindow.minimize();
  });

  ipcMain.on("MsgFromBackend", () => appmenu.webContents.send("Hello"));

  function CreateNewTab(id, url, status, TabId) {
    const AppTab = new BrowserWindow({
      frame: false,
      skipTaskbar: false,
      width: ParentWidth - 10,
      height: ParentHeight - 70,
      x: ParentPosX + 5,
      y: ParentPosY + 70,
      hasShadow: false,
      parent: Basewindow,
      roundedCorners: true,
      thickFrame: false,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        nodeIntegration: false,
        nodeIntegrationInSubFrames: false,
        nodeIntegrationInWorker: false,
      },
      resizable: false,
    });

    const Url = url || SearchEngine();
    Tabs.push({ id, url: Url, status, TabId });
    TabStore.setTabs(Tabs);
    Basewindow.addTabbedWindow = AppTab;
    Basewindow.focus();
    AppTab.isFocused(false);
    AppTab.loadURL(Url);
  }

  function AppKeyShortcuts(){
    globalShortcut.register('')
  }
}

app.whenReady().then(() => {
  AppWindow();
});

app.on("quit", () => { if (process.platform != "darwin") app.quit(); });
