var Tabs = [];
var activeTab = "";
var previousTab = "";

const TabsContainer = document.getElementById("TabsContainer");
let createdTabs = 0;

let mwx = 80
TabsContainer.style.maxWidth = mwx+'vw'

// Manage the Tabs Size 
function MaintainTabContainerSize() {
  if (Tabs.length <= 4) {
    console.log("in good");
  } else {
    console.log("exceeding");
    Tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) {
        el.style.width = ((mwx - Tabs.length) / Tabs.length) + "vw";
      }
    });
  }
}

// Create a new tab
function CreateTab(url) {
  createdTabs++;
  const counter = createdTabs;
  const finalUrl = url || "Home";
  const tabId = "Tabs-" + counter;

  Tabs.push({
    id: tabId,
    url: finalUrl,
    status: "inactive"
  });

  const NewTab = document.createElement("div");
  const TabDiv = document.createElement("div");
  const TabText = document.createElement("p");
  const TabImg = document.createElement("img");
  NewTab.id = tabId;
  NewTab.className = "Tabs inactive";
  TabText.innerText = finalUrl +" "+tabId;
  TabDiv.className = 'innerTab'
  const tabClose = document.createElement("img");
  tabClose.src = "../../sysMedia/icons/Close.png";
  TabImg.src = "../../sysMedia/icons/Globe.png";
  tabClose.style.cursor = "pointer";
  tabClose.onclick = (e) => {
    e.stopPropagation();
    CloseTab(tabId);
  };
  TabDiv.appendChild(TabImg)
  TabDiv.appendChild(TabText)
  NewTab.appendChild(TabDiv);
  NewTab.appendChild(tabClose);
  NewTab.onclick = () => SetActiveTab(tabId);
  TabsContainer.appendChild(NewTab);
  MaintainTabContainerSize()
  SetActiveTab(tabId);
//   window.GuardX.CreateTab(tabId)
}

// Set a tab as active
function SetActiveTab(id) {
  if (!id) return;

  Tabs.forEach((t) => {
    t.status = (t.id === id) ? "active" : "inactive";
  });

  previousTab = activeTab;
  activeTab = id;

  ShowActiveTab();
}

// Show which tab is active/inactive visually
function ShowActiveTab() {
  Tabs.forEach((t) => {
    const el = document.getElementById(t.id);
    if (el) {
      el.classList.remove("active", "inactive");
      el.classList.add(t.status);
    }
  });
}

// Close a tab
function CloseTab(tabId) {
  const closedIndex = Tabs.findIndex((t) => t.id === tabId);
  const wasActive = activeTab === tabId;

  Tabs = Tabs.filter((t) => t.id !== tabId);

  const el = document.getElementById(tabId);
  if (el) TabsContainer.removeChild(el);
    // window.GuardX.CloseTab()
  if (Tabs.length === 0) {
    activeTab = "";
    previousTab = "";
    CreateTab(); // Auto-create one
  } else if (wasActive) {
    const fallback =
      Tabs[closedIndex] || Tabs[Tabs.length - 1] || Tabs[0];
    SetActiveTab(fallback.id);
  }
  MaintainTabContainerSize()
  console.log("Tabs:", Tabs);

} 

function HandleKeyControls() {
  document.addEventListener("keydown", (e) => {
    // Only act on key combinations we care about
    if (!(e.altKey || e.shiftKey)) return;

    // Alt + Shift + →
    if (e.altKey && e.shiftKey && e.key === "ArrowRight") {
      e.preventDefault();
      CreateTab();
      return;
    }

    // Alt + Shift + ←
    if (e.altKey && e.shiftKey && e.key === "ArrowLeft") {
      e.preventDefault();
      CloseTab(activeTab);
      return;
    }

    // Alt + →
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      const currentIndex = Tabs.findIndex((t) => t.id === activeTab);
      const nextIndex = (currentIndex + 1) % Tabs.length;
      SetActiveTab(Tabs[nextIndex].id);
      return;
    }

    // Alt + ←
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIndex = Tabs.findIndex((t) => t.id === activeTab);
      const prevIndex = (currentIndex - 1 + Tabs.length) % Tabs.length;
      SetActiveTab(Tabs[prevIndex].id);
      return;
    }
  });
}


// window.GuardX.MsgFromBackend('Message', ()=>{})

// Init
window.addEventListener("DOMContentLoaded", () => {
  CreateTab();
  HandleKeyControls()
});
