const { BaseWindow, BrowserWindow, screen } = require("electron");
const ChildWindow = require("./ChildWindow");
const { writeFileSync } = require("fs");
const {} = require("path");
const Settings = require("./Settings");
const Tabs = require("./Tabs.json");

function LaunchAppWindow() {
  var AppWindow = new BaseWindow({
    acceptFirstMouse: true,
    backgroundColor: "rgba(255,255,255,1)",
    backgroundMaterial: "none",
    center: true,
    closable: true,
    focusable: true,
    frame: false,
    fullscreenable: true,
    hasShadow: false,
    height: screen.getPrimaryDisplay().bounds.height - 20,
    icon: "",
    kiosk: false,
    maximizable: true,
    minimizable: true,
    movable: true,
    parent: true,
    resizable: false,
    show: true,
    skipTaskbar: false,
    thickFrame: false,
    title: "GuardX",
    width: screen.getPrimaryDisplay().bounds.width,
    x: screen.getPrimaryDisplay().bounds.x,
    y: screen.getPrimaryDisplay().bounds.y,
  });

  function CreateTabs(url) {
    var url = url || Settings.SearchEngine();
    var ChildWindow = new BrowserWindow({
      acceptFirstMouse: false,
      center: true,
      closable: true,
      focusable: true,
      frame: false,
      fullscreenable: true,
      skipTaskbar: true,
    });
    AppWindow.addTabbedWindow = ChildWindow;
    // ChildWindow.setParentWindow = AppWindow;
    ChildWindow.loadURL(url);
    ChildWindow.setBounds({
      x: AppWindow.getBounds().x,
      y: AppWindow.getBounds().y + 40,
      height: AppWindow.getBounds().height - 40,
      width: AppWindow.getBounds().width,
    });
    Tabs.forEach((Tab) => {
      Tab.status = "inactive";
    });
    Tabs.push({
      id: ChildWindow.id,
      Url: url,
      Status: "active",
    });
    writeFileSync("./Tabs.json", JSON.stringify(Tabs));
    ShowActiveWindow(ChildWindow.id);
  }
  function ShowActiveWindow(id) {
    var cw = AppWindow.getChildWindows();
    Tabs.forEach((t) => {
      if (t.id != id) {
        t.status = "inactive";
        cw.forEach((w) => {
          w.id != id;
          w.hide();
        });
      } else if (t.id == id) {
        t.status = "active";
        cw.find((w) => {
          w.id == id;
          w.show();
        });
      }
    });
  }
  if(Tabs.length==0){
    CreateTabs()
    console.log(AppWindow.getChildWindows())
  }
}

module.exports = LaunchAppWindow;
