var Tabs = [];
var activeTab;
var previousTab;

let createdTabs = 1;
let mwx = 80;

let TabsContainer = document.getElementById("TabsContainer"); // Declare here, assign after DOM loads

// Manage the Tabs Size
function MaintainTabContainerSize() {
  if (Tabs.length <= 4) {
    console.log("in good");
  } else {
    console.log("exceeding");
    Tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) {
        el.style.width = (mwx - Tabs.length) / Tabs.length + "vw";
      }
    });
  }
}

// Create a new tab
function CreateTab(url) {
  createdTabs++;
  const counter = createdTabs;
  const finalUrl = url;
  const tabId = "Tabs-" + counter;

  var TabStats = {
    id: counter,
    url: finalUrl,
    status: "active",
    TabId: tabId,
  };

  Tabs.push({
    id: counter,
    url: finalUrl,
    status: "inactive",
    TabId: tabId,
  });

  const NewTab = document.createElement("div");
  const TabDiv = document.createElement("div");
  const TabText = document.createElement("p");
  const TabImg = document.createElement("img");
  NewTab.id = tabId;
  NewTab.className = "Tabs inactive";
  TabDiv.className = "innerTab";
  TabDiv.id = TabStats.TabId + "-title";
  const tabClose = document.createElement("img");
  tabClose.src = "../../sysMedia/icons/Close.png";
  TabImg.src = "../../sysMedia/icons/Globe.png";
  tabClose.style.cursor = "pointer";
  tabClose.onclick = (e) => {
    e.stopPropagation();
    CloseTab(tabId);
  };
  TabDiv.appendChild(TabImg);
  TabDiv.appendChild(TabText);
  NewTab.appendChild(TabDiv);
  NewTab.appendChild(tabClose);
  NewTab.onclick = () => SetActiveTab(counter);
  TabsContainer.appendChild(NewTab);
  MaintainTabContainerSize();
  window.GuardX.CreateNewTab(TabStats);
  SetActiveTab(counter);
  Tabs.find((t) => {
    if (t.status == "active") {
      console.log("active", t);
    }
  });
  window.GuardX.MsgFromBackend(`Created-New-Tab`, (d) => {
    console.log(d);
  });
}
// Set a tab as active
function SetActiveTab(id) {
  if (!id) return;

  Tabs.forEach((t) => {
    t.status = t.id === id ? "active" : "inactive";
  });

  previousTab = activeTab;
  activeTab = id;
  console.log(`previousTab `, previousTab);
  console.log(`activeTab `, activeTab);
  console.log(`id: `, id);
  window.GuardX.SetActiveTab(id);
  window.GuardX.MsgFromBackend(`Set-Active-Tab`, (d) => {
    console.log(d);
  });
  ShowActiveTab(activeTab);
}

// Show which tab is active/inactive visually
function ShowActiveTab(id) {
  console.log(`➡️ Calling window.GuardX.ShowActiveTab(${id})`);

  Tabs.forEach((t) => {
    const el = document.getElementById(t.TabId); // ✅ using TabId
    if (!el) {
      console.warn(`⚠️ Element not found for tab ${t.TabId}`);
      return;
    }

    if (t.id === id) {
      el.classList.remove("inactive");
      el.classList.add("active");
      t.status = "active";
      console.log(`✅ Activated tab ${t.TabId}`);
    } else {
      el.classList.remove("active");
      el.classList.add("inactive");
      t.status = "inactive";
    }
  });

  const activeTab = Tabs.find((t) => t.id === id);
  if (!activeTab) {
    console.warn("Tab not found for id:", id);
    return;
  }
  
  window.GuardX.ShowActiveTab(activeTab.TabID ?? activeTab.id);
  window.GuardX.MsgFromBackend("Showing-Active-Tab", (tabInfo) => {
    console.log("Backend response:", tabInfo);

    const tabElement = document.getElementById(`Tab-${tabInfo.id}-title`);
    if (tabElement) {
      tabElement.textContent = tabInfo.title;
    }

    const searchbar = document.getElementById("searchbar");
    if (searchbar) {
      searchbar.placeholder = tabInfo.url || "Enter URL or search query";
      searchbar.value = "";
    }

    const tabData = Tabs.find((t) => t.id == tabInfo.id);
    if (tabData) {
      tabData.url = tabInfo.url;
    }
  });
}

function Minimize() {
  return window.GuardX.Minimize();
}

function SetupWinSizeToggle() {
  const a = document.getElementById("WinSizeToggle");
  a.addEventListener("click", (e) => {
    e.preventDefault();
    if (a.classList.contains("Max")) {
      a.classList.remove("Max");
      a.classList.add("Min");
      a.src = "../../sysMedia/icons/UnMaximize.png";
      window.GuardX.SetupWinSizeToggle(`Minimize-Window`); // <- Electron call if needed
    } else if (a.classList.contains("Min")) {
      a.classList.remove("Min");
      a.classList.add("Max");
      a.src = "../../sysMedia/icons/Maximize.png";
      window.GuardX.SetupWinSizeToggle(`Maximize-Window`); // <- Electron call if needed
    }
  });
}

// Close a tab
function CloseTab(tabId) {
  const tab = Tabs.find((t) => t.TabId === tabId);
  if (!tab) return;

  const closedTabIndex = Tabs.findIndex((t) => t.TabId === tabId);
  const isActiveTab = activeTab === tab.id;

  let fallbackId = null;

  // Only compute fallback if the tab being closed is active
  if (isActiveTab && Tabs.length > 1) {
    // Try to set the previous tab as fallback
    const prevTab = Tabs[closedTabIndex - 1] || Tabs[closedTabIndex + 1];
    if (prevTab) fallbackId = prevTab.id;
  }

  // Remove tab from DOM
  const ct = document.getElementById(tabId);
  if (ct) TabsContainer.removeChild(ct);

  // Remove from memory
  Tabs.splice(closedTabIndex, 1);

  MaintainTabContainerSize();

  console.log("Closing tabId:", tab.id, "fallbackId:", fallbackId);
  window.GuardX.CloseTab(tab.id, fallbackId);

  if (fallbackId) SetActiveTab(fallbackId);
  else if (Tabs.length === 0) {
    // No tabs left, create one
    CreateTab("https://www.bing.com");
  }
}

const ReloadButton = document.getElementById("ReloadButton");
ReloadButton.addEventListener("click", () => {
  var a = Tabs.findIndex((t) => t.status == "active");
  console.log(Tabs[a].id);
  window.GuardX.ReloadTab(Tabs[a].id);
});
const BackButton = document.getElementById("BackButton");
const ForwardButton = document.getElementById("ForwardButton");
BackButton.addEventListener("click", () => {
  var a = Tabs.findIndex((t) => t.status == "active");
  console.log(Tabs[a].id);
  window.GuardX.NavigateBack(Tabs[a].id);
  window.GuardX.MsgFromBackend("Navigated-Back", (tabInfo) => {
    console.log("✅ Tab Data Loaded:", tabInfo);
  });
});
ForwardButton.addEventListener("click", () => {
  var a = Tabs.findIndex((t) => t.status == "active");
  console.log(Tabs[a].id);
  window.GuardX.NavigateForward(Tabs[a].id);
  window.GuardX.MsgFromBackend("Navigated-Forward", (tabInfo) => {
    console.log("✅ Tab Data Loaded:", tabInfo);
  });
});

function HandleKeyControls() {
  document.addEventListener("keydown", (e) => {
    // Only continue if either ALT or SHIFT is pressed
    if (!e.altKey) return;

    // ALT + SHIFT + RIGHT → Create New Tab
    if (e.shiftKey && e.key === "ArrowRight") {
      e.preventDefault();
      CreateTab();
      return;
    }

    // ALT + SHIFT + LEFT → Close Active Tab
    if (e.shiftKey && e.key === "ArrowLeft") {
      e.preventDefault();
      CloseTab(getTabIdById(activeTab)); // send TabId not numeric id
      return;
    }

    // ALT + RIGHT → Switch to Next Tab
    if (!e.shiftKey && e.key === "ArrowRight") {
      e.preventDefault();
      if (Tabs.length <= 1) return;

      const currentIndex = Tabs.findIndex((t) => t.id === activeTab);
      const nextIndex = (currentIndex + 1) % Tabs.length;
      SetActiveTab(Tabs[nextIndex].id);
      return;
    }

    // ALT + LEFT → Switch to Previous Tab
    if (!e.shiftKey && e.key === "ArrowLeft") {
      e.preventDefault();
      if (Tabs.length <= 1) return;

      const currentIndex = Tabs.findIndex((t) => t.id === activeTab);
      const prevIndex = (currentIndex - 1 + Tabs.length) % Tabs.length;
      SetActiveTab(Tabs[prevIndex].id);
      return;
    }
  });

  // Utility: get TabId by numeric id
  function getTabIdById(id) {
    const tab = Tabs.find((t) => t.id === id);
    return tab ? tab.TabId : null;
  }
}

function CloseApp() {
  const CloseButton = document.getElementById("CloseButton");
  if (CloseButton) {
    CloseButton.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Clicked Close");
      if (window.GuardX && window.GuardX.CloseApp) {
        window.GuardX.CloseApp();
      } else {
        console.warn("GuardX or CloseApp not available");
      }
    });
  }
}

// ✅ Init only after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  TabsContainer = document.getElementById("TabsContainer");
  if (!TabsContainer) {
    console.error("TabsContainer not found in DOM");
    return;
  }

  TabsContainer.style.maxWidth = mwx + "vw";

  CreateTab(); // Create the first tab
  HandleKeyControls(); // Set up hotkeys
  SetupWinSizeToggle();
});
CloseApp(); // Setup Close button listener
