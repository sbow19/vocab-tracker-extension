//Imports
import { VocabDatabase } from "/database/database.js";
import { DeeplTranslate } from "/translation/translation.js";

/*

Chrome local object structure

index: default

project, (string)
foreign_word, (string)
target_language, (string)
output_language, (string)
tags, (array)
translated_word, (string),
source_url, (string)
base_url, (string)

*/

//General functions

//Set current tab in local storage
async function getCurrentTab(tabId) {
  let tab = await chrome.tabs.get(tabId);
  return tab;
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

class MessageTemplate {
  constructor(message, details) {
    this.message = message;
    this.details = details;
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  //Open a new database on first install. Data will persist even after Extension is deleted
  if (details.reason === "install") {
    VocabDatabase.openDatabase();
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

// Listen for changes to the local storage
chrome.storage.local.onChanged.addListener((result) => {});

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
      })
      .catch(() => {
        sendResponse(result);
      });

    // Return true to indicate that the service worker event is asychronous
    return true;
  }
});

//Add tags message
const updateTagsMessage = new MessageTemplate("update-tags", {
  tagsList: [],
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "add-tag") {
    try {
      VocabDatabase.addItem("add-tag", request.details)
        .then((res) => {
          sendResponse(res);
        })
        .catch((e) => {
          sendResponse(e);
        });
    } catch (e) {
      sendResponse(false);
    }

    return true;
  }
});

//Delete tags message
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "delete-tag") {
    let allProjectsRequest = await chrome.storage.local.get([
      "allProjectDetails",
    ]);

    let allProjects = allProjectsRequest["allProjectDetails"];

    let indexToRemove = allProjects["allTags"].indexOf(request.details.tagName);

    allProjects["allTags"].splice(indexToRemove, 1);

    let allProjectDetailsUpdated = {
      allProjectDetails: allProjects,
    };

    await chrome.storage.local.set(allProjectDetailsUpdated);

    updateTagsMessage.details.tagsList = allProjects["allTags"];

    chrome.runtime.sendMessage(updateTagsMessage);

    //Prompt content script to add new project details
    let currentIDRequest = await chrome.storage.local.get(["currentID"]);
    let currentID = currentIDRequest["currentID"];

    chrome.tabs.sendMessage(currentID, updateTagsMessage);
  }
});

//Delete projects message
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "delete-project") {
    //Delete all entries related to project
    VocabDatabase.deleteItem("project", request.details)
      .then((res) => {
        sendResponse(true);
      })
      .catch((e) => {
        sendResponse(false);
      });

    return true;
  }

  //Update current project
});

const updateCurrentProjectTags = new MessageTemplate("update-current-tags", {
  tagsList: [],
});

//Upate current project tags

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "update-current-tags") {
    //Updating current project

    let currentProjectsRequest = await chrome.storage.local.get([
      "currentProject",
    ]);

    let [currentProjectName] = Object.keys(
      currentProjectsRequest["currentProject"]
    );

    let currentProjectDetails =
      currentProjectsRequest["currentProject"][currentProjectName];

    if (request.details.action === "add") {
      currentProjectDetails["tags"].push(request.details.tagName);

      let updatedCurrentProjectDetails = {
        [currentProjectName]: currentProjectDetails,
      };

      let updatedCurrentProjectDetailsPush = {
        currentProject: updatedCurrentProjectDetails,
      };

      await chrome.storage.local.set(updatedCurrentProjectDetailsPush);

      updateCurrentProjectTags.details.tagsList = currentProjectDetails["tags"];

      let currentIDRequest = await chrome.storage.local.get(["currentID"]);
      let currentID = currentIDRequest["currentID"];

      chrome.tabs.sendMessage(currentID, updateCurrentProjectTags);
      chrome.runtime.sendMessage(updateCurrentProjectTags);
    } else if ((request.details.action = "delete")) {
      let indexToRemove = currentProjectDetails["tags"].indexOf(
        request.details.tagName
      );

      currentProjectDetails["tags"].splice(indexToRemove, 1);

      let updatedCurrentProjectDetails = {
        [currentProjectName]: currentProjectDetails,
      };

      let updatedCurrentProjectDetailsPush = {
        currentProject: updatedCurrentProjectDetails,
      };

      await chrome.storage.local.set(updatedCurrentProjectDetailsPush);

      updateCurrentProjectTags.details.tagsList = currentProjectDetails["tags"];

      let currentIDRequest = await chrome.storage.local.get(["currentID"]);
      let currentID = currentIDRequest["currentID"];

      chrome.tabs.sendMessage(currentID, updateCurrentProjectTags);
      chrome.runtime.sendMessage(updateCurrentProjectTags);
    }

    //updating project with new tag information

    let projectRequest = await chrome.storage.local.get([currentProjectName]);

    let projectDetails = projectRequest[currentProjectName];

    if (request.details.action === "add") {
      projectDetails["tags"].push(request.details.tagName);

      let updatedCurrentProjectDetails = {
        [currentProjectName]: projectDetails,
      };

      await chrome.storage.local.set(updatedCurrentProjectDetails);
    } else if (request.details.action === "delete") {
      let indexToRemove = projectDetails["tags"].indexOf(
        request.details.tagName
      );

      console.log(projectDetails);

      projectDetails["tags"].splice(indexToRemove, 1);

      let updatedCurrentProjectDetails = {
        [currentProjectName]: projectDetails,
      };

      await chrome.storage.local.set(updatedCurrentProjectDetails);
    }
  }
});

//update current language

const updateCurrentLanguage = new MessageTemplate("update-current-language");

chrome.runtime.onMessage.addListener(async (request) => {
  if (
    request.message === "change-language" &&
    request.details.type === "target"
  ) {
    try {
      //Get project details from local storage
      let result = await chrome.storage.local.get(["currentProject"]);

      let currentProject = result["currentProject"];

      let [currentProjectName] = Object.keys(currentProject);

      currentProject[currentProjectName].target_language =
        request.details.language;

      let storageCurrentProjectDetails = { currentProject: currentProject };

      //Set new current project details
      await chrome.storage.local.set(storageCurrentProjectDetails);

      //Change language settings on project

      await chrome.storage.local.set(currentProject);

      chrome.runtime.sendMessage(updateCurrentLanguage);

      let currentIDRequest = await chrome.storage.local.get(["currentID"]);
      let currentID = currentIDRequest["currentID"];

      chrome.tabs.sendMessage(currentID, updateCurrentLanguage);
    } catch (e) {
      console.log(e);
    }
  } else if (
    request.message === "change-language" &&
    request.details.type === "output"
  ) {
    try {
      //Get project details from local storage
      let result = await chrome.storage.local.get(["currentProject"]);

      let currentProject = result["currentProject"];

      let [currentProjectName] = Object.keys(currentProject);

      currentProject[currentProjectName].output_language =
        request.details.language;

      let storageCurrentProjectDetails = { currentProject: currentProject };

      //Set new current project details
      await chrome.storage.local.set(storageCurrentProjectDetails);

      //Change language settings on project

      await chrome.storage.local.set(currentProject);

      chrome.runtime.sendMessage(updateCurrentLanguage);

      let currentIDRequest = await chrome.storage.local.get(["currentID"]);
      let currentID = currentIDRequest["currentID"];

      chrome.tabs.sendMessage(currentID, updateCurrentLanguage);
    } catch (e) {
      console.log(e);
    }
  }
});

//Listen for load events on a tab page
chrome.tabs.onUpdated.addListener(async (updatedTab, changeInfo, tab) => {
  let tabURL = await chrome.tabs.get(tab.id);

  let currentTabURLObject = { currentTabURL: "" };

  currentTabURLObject.currentTabURL = tabURL.url;

  chrome.storage.local.set(currentTabURLObject);

  //Content scripts load when tabs are updated
  await chrome.tabs.sendMessage(updatedTab, {
    load: "load content",
  });
});

//Listen for new text to save in database
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "add-new-text") {
    //Check whether there is any text sent from popup or content views
    let translationInput = request.details.target_word.trim();

    if (translationInput === "") {
      sendResponse("No input");
    } else {
      const result = await VocabDatabase.addItem("add-entry", request.details);
      sendResponse(result);
    }
    return true;
  }
});

//Listen for new database retrieval request

//Send  search results message

let searchResultsMessage = new MessageTemplate("display-results", {
  searchResults: [],
  tags: false,
});

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "fetch-data") {
    let searchTerms = request.details.searchTerms;

    if (searchTerms.searchType === "allTags") {
      let resultsList = [];

      for (let tag of searchTerms.tags) {
        let results = await VocabDatabase.retrieveFromDatabase(
          searchTerms.searchType,
          tag
        );

        resultsList.push(results);
      }

      searchResultsMessage.details.searchResults = resultsList;
      searchResultsMessage.details.tags = true;

      chrome.runtime.sendMessage(searchResultsMessage);

      let currentDatabaseSearch = {
        currentDatabaseSearch: resultsList,
      };

      await chrome.storage.local.set(currentDatabaseSearch);
    } else if (searchTerms.searchType === "allLanguages") {
      let targetResults = await VocabDatabase.retrieveFromDatabase(
        "targetLanguage",
        searchTerms.searchParameter
      );

      let outputResults = await VocabDatabase.retrieveFromDatabase(
        "outputLanguage",
        searchTerms.searchParameter
      );

      let mergedResults = [];

      //Check first array

      for (let resultObject of targetResults) {
        if (
          !mergedResults.some(
            (object) => resultObject.foreign_word === object.foreign_word
          )
        ) {
          mergedResults.push(resultObject);
        }
      }

      for (let resultObject of outputResults) {
        if (
          !mergedResults.some(
            (object) => resultObject.foreign_word === object.foreign_word
          )
        ) {
          mergedResults.push(resultObject);
        }
      }

      searchResultsMessage.details.searchResults = mergedResults;
      searchResultsMessage.details.tags = false;

      chrome.runtime.sendMessage(searchResultsMessage);

      let currentDatabaseSearch = {
        currentDatabaseSearch: mergedResults,
      };

      await chrome.storage.local.set(currentDatabaseSearch);
    } else {
      let results = await VocabDatabase.retrieveFromDatabase(
        searchTerms.searchType,
        searchTerms.searchParameter
      );

      searchResultsMessage.details.searchResults = results;
      searchResultsMessage.details.tags = false;

      chrome.runtime.sendMessage(searchResultsMessage);

      let currentDatabaseSearch = {
        currentDatabaseSearch: results,
      };

      await chrome.storage.local.set(currentDatabaseSearch);
    }
  }
});

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "delete-entry") {
    let entryValue = request.details.value;

    VocabDatabase.removeFromDatabase(entryValue);
  }
});

const translationMessage = new MessageTemplate("translation-result", {
  resultDetails: {},
  targetView: "",
});

//Deeply translateButton
chrome.runtime.onMessage.addListener(async (request) => {
  if (
    request.message === "translate" &&
    request.details.targetView === "translation-view"
  ) {
    //Handle things like

    let translationTarget = request.details;

    let translationResponse = await DeeplTranslate.translate(translationTarget);

    //Handle network errors etc

    //Encode message with response text
    translationMessage.details.resultDetails = translationResponse.text;

    //Send translation message to correct view
    translationMessage.details.targetView = request.details.targetView;

    chrome.runtime.sendMessage(translationMessage);
  } else if (
    request.message === "translate" &&
    request.details.targetView === "content-view"
  ) {
    //Handle things like

    let translationTarget = request.details;

    let translationResponse = await DeeplTranslate.translate(translationTarget);

    //Encode message with response text
    translationMessage.details.resultDetails = translationResponse.text;

    //Send translation message to correct view
    translationMessage.details.targetView = request.details.targetView;

    let currentIDRequest = await chrome.storage.local.get(["currentID"]);
    let currentID = currentIDRequest["currentID"];

    chrome.tabs.sendMessage(currentID, translationMessage);
  }
});
