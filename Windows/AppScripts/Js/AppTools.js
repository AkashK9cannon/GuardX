document.body.addEventListener('keydown', (e) => {
  if(e.key == 'Tab'){
    console.log('Tab Key Presses')
    window.GuardX.Focus('ActiveTabFocus')
  }
})

const searchbar = document.getElementById("searchbar");

function normalizeUrl(inputString) {
  // Define common top-level domains for robust checking.
  // This list can be expanded for more comprehensive TLD coverage.
  const tlds = [
    ".com",
    ".org",
    ".net",
    ".io",
    ".co",
    ".gov",
    ".edu",
    ".biz",
    ".info",
  ];

  // Helper function to check if the string ends with a known TLD.
  const endsWithTld = (str) => {
    // Check if the string contains a '/' after a potential TLD,
    // which indicates a path, and the part before the '/' ends with a TLD.
    const firstSlashIndex = str.indexOf("/");
    let domainPart = str;
    if (firstSlashIndex !== -1) {
      domainPart = str.substring(0, firstSlashIndex);
    }

    return tlds.some((tld) => domainPart.endsWith(tld));
  };

  // 1. If it already starts with 'https://' AND ends with a recognized TLD, return as is.
  if (inputString.startsWith("https://") && endsWithTld(inputString)) {
    return inputString;
  }

  // 2. If it starts with 'www.' AND ends with a recognized TLD, prepend 'https://'.
  if (inputString.startsWith("www.") && endsWithTld(inputString)) {
    return `https://${inputString}`;
  }

  // 3. If it contains at least one dot, ends with a recognized TLD,
  //    and doesn't start with any protocol (http:// or https://) or 'www.',
  //    then prepend 'https://www.'. This handles cases like 'google.com' or 'google.com/path'.
  if (inputString.includes(".") && endsWithTld(inputString)) {
    if (
      !inputString.startsWith("http://") &&
      !inputString.startsWith("https://") &&
      !inputString.startsWith("www.")
    ) {
      return `https://www.${inputString}`;
    }
  }

  // 4. For all other cases (e.g., plain text, URLs with unrecognized TLDs,
  //    or malformed URLs that don't fit the above patterns), return the string as is.
  return inputString;
}

searchbar.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const act = Tabs.find((t) => t.status === "active");
    const SearchPro = searchbar.value;

    if (!SearchPro.trim()) {
      searchbar.placeholder = "Please type to search or a URL";
      return;
    }

    const finalUrl = normalizeUrl(SearchPro);
    searchbar.placeholder = finalUrl;

    // ✅ Trigger tab navigation
    window.GuardX.NavigateTabTo(finalUrl, act.id, act.TabId, );
    window.GuardX.MsgFromBackend("tab-data-loaded", (tabInfo) => {
      console.log("✅ Tab Data Loaded:", tabInfo);

      const tabElement = document.getElementById(
        `Tab-` + tabInfo.tabId + "-title"
      );
      if (tabElement) {
        tabElement.textContent = tabInfo.title; // ✅ use textContent instead of direct assignment
      }

      var a = Tabs.find((t) => t.id == tabInfo.tabId);
      const searchbar = document.getElementById("searchbar");
      if (searchbar) {
        searchbar.placeholder = tabInfo.url;
        searchbar.value = ""
        if (a) {
          a.url = tabInfo.url;
          console.log(a); // ✅ Corrected: log the object, not Tabs[a]
        }
      }
      console.log(Tabs[a]);

      // Optional: Update favicon
      // document.getElementById("favicon").src = tabInfo.favicon;
    });
  }
});
// ✅ 1. Setup MsgFromBackend once (outside keydown)

// const HomeButton = document.getElementById('HomeButton')
// HomeButton.addEventListener('click', () => {
//   const activeIndex = Tabs.findIndex(t => t.status === 'active');
//   if (activeIndex !== -1) {
//     window.GuardX.SetHome(Tabs[activeIndex].id);
//   }
// });
