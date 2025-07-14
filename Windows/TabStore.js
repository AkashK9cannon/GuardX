const { readFileSync, writeFileSync, existsSync } = require("fs");
const path = require("path");
const { app } = require("electron");

// Location where the file can be written to
const userDataPath = app.getPath("userData");
const tabsFilePath = path.join(userDataPath, "Tabs.json");

// Optional: shipped version inside extraResources (read-only)
const defaultTabsPath = path.join(process.resourcesPath, "Tabs.json");

// Copy the initial Tabs.json to userData if it doesn't exist
function ensureTabsFile() {
  if (!existsSync(tabsFilePath)) {
    if (existsSync(defaultTabsPath)) {
      const initialData = readFileSync(defaultTabsPath);
      writeFileSync(tabsFilePath, initialData);
    } else {
      writeFileSync(tabsFilePath, JSON.stringify([]));
    }
  }
}

ensureTabsFile();

let Tabs = [];
try {
  Tabs = JSON.parse(readFileSync(tabsFilePath));
} catch {
  Tabs = [];
}

function saveTabs() {
  writeFileSync(tabsFilePath, JSON.stringify(Tabs, null, 2));
}

module.exports = {
  getTabs: () => Tabs,
  setTabs: (newTabs) => { Tabs = newTabs; saveTabs(); },
  addTab: (tab) => { Tabs.push(tab); saveTabs(); },
  removeTab: (id) => {
    Tabs = Tabs.filter(t => t.id !== id);
    saveTabs();
  },
  updateTabStatus: (id, status) => {
    Tabs.forEach(t => t.status = t.id === id ? "active" : "inactive");
    saveTabs();
  }
};
