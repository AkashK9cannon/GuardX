const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const isDev = !app || !app.isPackaged;
const settingsPath = isDev
  ? path.join(__dirname, "settings.json")
  : path.join(process.resourcesPath, "settings.json");

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch (err) {
    console.error("Failed to read settings.json:", err);
    return {};
  }
}

function writeSettings(newSettings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to settings.json:", err);
  }
}

function SearchEngine() {
  const settings = readSettings();
  let activeEngine = "";

  try {
    const engines = settings?.Menu?.["Search Engines"] || {};
    Object.entries(engines).forEach(([name, config]) => {
      if (config.status === "active") {
        activeEngine = config.url || name;
      }
    });
  } catch (err) {
    console.error("Error in SearchEngine():", err);
  }

  return activeEngine;
}

module.exports = {
  SearchEngine,
  readSettings,
  writeSettings,
  settingsPath
};
