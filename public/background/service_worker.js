//Imports
import { VocabDatabase } from "/database/database.js";
import { DeeplTranslate } from "/translation/translation.js";

//Set current tab in local storage
async function getCurrentTab(tabId) {
  let tab = await chrome.tabs.get(tabId);
  return tab;
}

function updateContentScript() {
  return new Promise(async (resolve, reject) => {
    try {
      const { currentTab } = await chrome.storage.local.get(["currentTab"]);
      // Fetch all content
      const projects = await VocabDatabase.getAll("projects");

      for (let project of projects) {
        allDetails.projects[project.id] = project;
      }

      const p = await VocabDatabase.getAll("currentProject");
      allDetails.currentProject = p[0] || {
        id: "default",
        name: "default",
        default_target_language: "Spanish",
        default_output_language: "Spanish",
        tags: "[]",
        entries: "{}",
      };

      allDetails.tags = await VocabDatabase.getAll("tags");

      //Content scripts load when tabs are updated
      await chrome.tabs.sendMessage(currentTab.id, {
        message: "set-content",
        data: allDetails,
      });

      resolve({
        success: true,
      });
    } catch (e) {
      console.log(e);

      reject({
        success: false,
      });
    }
  });
}

chrome.tabs.onActivated.addListener(async (result) => {
  const currentTab = await getCurrentTab(result.tabId);
  chrome.storage.local.set({
    currentTab,
  });
});

chrome.tabs.onUpdated.addListener(async (result) => {
  const currentTab = await getCurrentTab(result.tabId);
  chrome.storage.local.set({
    currentTab,
  });
});

chrome.tabs.onRemoved.addListener(async (result) => {
  const currentTab = await getCurrentTab(result.tabId);
  chrome.storage.local.set({
    currentTab,
  });
});

/* Listener which creates the initial IndexedDB on first install. Deletes same
when uninstalled.
*/

chrome.runtime.onInstalled.addListener(async (details) => {
  //Open a new database on first install. Data will persist even after Extension is deleted
  if (details.reason === "install") {
    VocabDatabase.openDatabase();

    // Gen id key
    try {
      // Key for access to backend services
      const newIdKey = crypto.randomUUID();
      await chrome.storage.local.set({
        appid: newIdKey,
      });
    } catch (e) {
      console.log("Could not generate id key");
    }
  }
});

/**
 * Set loca storage details.
 *
 * Local storage details shape:
 *      - allLanguages: Array<string>
 *      - currentTab: chrome.Tabs.tab
 *      - currentSearch: EntryModel
 *
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Set all languages
    const allLanguages = {
      allLanguages: [
        "Spanish",
        "English",
        "German",
        "Bulgarian",
        "Czech",
        "Danish",
        "Greek",
        "Estonian",
        "Finnish",
        "French",
        "Hungarian",
        "Indonesian",
        "Italian",
        "Japanese",
        "Korean",
        "Lithuanian",
        "Latvian",
        "Norwegian",
        "Dutch",
        "Polish",
        "Portuguese",
        "Romanian",
        "Russian",
        "Slovak",
        "Slovenian",
        "Swedish",
        "Turkish",
        "Ukrainian",
        "Chinese",
      ],
    };
    await chrome.storage.local.set(allLanguages);

    // Set current search
    const currentDatabaseSearch = {
      currentDatabaseSearch: {},
    };
    await chrome.storage.local.set(currentDatabaseSearch);

    // Set current tab
    const currentTab = {
      currentTab: {},
    };
    await chrome.storage.local.set(currentTab);
  }
});

//Set current project based on selected current project
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "set-current-project") {
    //Extract project name from message
    const currentProject = request.details;

    //Check whether we reset current project
    if (currentProject.name === "default") {
      // Default
    } else {
      VocabDatabase.setCurrentProject(currentProject)
        .then((res) => {
          sendResponse(true);

          return updateContentScript();
        })
        .then((res) => {
          // React to content script update
        })
        .catch((e) => {
          sendResponse(false);
        });
    }

    return true;
  }
});

//Add new project details to local storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "add-project") {
    VocabDatabase.addItem("add-project", message.details.projectDetails)
      .then((result) => {
        sendResponse(result);

        return updateContentScript();
      })
      .then((res) => {
        // React to  content script update
      })
      .catch(() => {
        sendResponse(result);
      });

    // Return true to indicate that the service worker event is asychronous
    return true;
  }
});

// Add new tag
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "add-tag") {
    try {
      VocabDatabase.addItem("add-tag", request.details)
        .then((res) => {
          sendResponse({
            success: true,
          });

          return updateContentScript();
        })
        .then(() => {
          // React to content script update
        })
        .catch((e) => {
          sendResponse(false);
        });
    } catch (e) {
      sendResponse(false);
    }

    return true;
  }
});

//Delete tags message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "delete-tag") {
    VocabDatabase.deleteItem("tag", request.details)
      .then((res) => {
        sendResponse({
          success: true,
        });

        return updateContentScript();
      })
      .then(() => {
        // React to content script update
      })
      .catch((e) => {
        sendResponse(false);
      });

    return true;
  }
});

//Delete projects message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "delete-project") {
    VocabDatabase.deleteItem("project", request.details)
      .then((res) => {
        sendResponse(true);

        return updateContentScript();
      })
      .then(() => {
        // React to content script updat
      })
      .catch((e) => {
        sendResponse(false);
      });

    return true;
  }
});

//Upate current project details, including tags. Replace schemaModels version too
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "update-current-project") {
    // Update with new project details
    VocabDatabase.updateCurrentProject(request.details)
      .then((res) => {
        sendResponse({
          success: true,
        });

        return updateContentScript();
      })
      .then(() => {
        // React to content script update
      })
      .catch((e) => {
        sendResponse(false);
      });

    return true;
  }
});

// Change language of current project
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "change-language") {
    VocabDatabase.updateCurrentProject(message.details)
      .then((res) => {
        sendResponse({
          success: true,
        });
        return updateContentScript();
      })
      .then(() => [
        // React to cntetn script udate
      ])
      .catch((e) => {
        sendResponse({
          success: false,
        });
      });

    return true;
  }
});

const allDetails = {
  projects: {},
  currentProject: {},
  tags: [],
};

//Listen for load events on a tab page
chrome.tabs.onUpdated.addListener(async (updatedTab, changeInfo, tab) => {
  let tabURL = await chrome.tabs.get(tab.id);

  // Set current URL
  let currentTabURLObject = { currentTabURL: "" };
  currentTabURLObject.currentTabURL = tabURL.url;
  chrome.storage.local.set(currentTabURLObject);

  // Fetch all content
  const projects = await VocabDatabase.getAll("projects");

  for (let project of projects) {
    allDetails.projects[project.id] = project;
  }

  const p = await VocabDatabase.getAll("currentProject");
  allDetails.currentProject = p[0] || {
    id: "default",
    name: "default",
    default_target_language: "Spanish",
    default_output_language: "Spanish",
    tags: "[]",
    entries: "{}",
  };

  allDetails.tags = await VocabDatabase.getAll("tags");

  //Content scripts load when tabs are updated
  await chrome.tabs.sendMessage(updatedTab, {
    load: "load content",
    data: allDetails,
  });
});

let queue = false;
//Listen for new text to save in database from  content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "add-new-text") {
    //Check whether there is any text sent from popup or content views
    let translationInput = request.details.target_word.trim();

    if (queue) sendResponse("Too many requests");
    queue = true;

    if (translationInput === "") {
      sendResponse("No input");
    } else {
      VocabDatabase.addItem("add-entry", request.details)
        .then(() => {
          sendResponse({
            success: true,
          });
        })
        .catch(() => {
          sendResponse({
            success: false,
          });
        })
        .finally(() => {
          queue = false;
        });
    }
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "delete-entry") {
    VocabDatabase.deleteItem("entry", message.details)
      .then((res) => {
        sendResponse(res);

        return updateContentScript();
      })
      .then(() => {
        // React to content script updaate
      })
      .catch((e) => {
        sendResponse(false);
      });

    return true;
  }
});

//Deeply translateButton
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "translate") {
    const searchTerms = {
      targetLanguage: request.details.targetLanguage,
      outputLanguage: request.details.outputLanguage,
      targetText: request.details.targetText,
    };

    DeeplTranslate.translate(searchTerms)
      .then((res) => {
        sendResponse({
          success: true,
          text: res.text,
        });
      })
      .catch((e) => {
        sendResponse({
          success: false,
          text: "Oops... something went wrong",
        });
      });

    return true;
  }
});
