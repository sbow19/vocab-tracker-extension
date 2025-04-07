import { View } from "./views.js";
import { MessageTemplate } from "./messages.js";
import { Sanitiser } from "./sanitiser.js";
import { VocabDatabase } from "../database/database.js";

// Globals
let projectsModel = {};
let tagsArray = [];
let currentProject = {};

//Messages
const updateCurrentProjectTag = new MessageTemplate("update-current-tags", {
  tagName: "",
  action: "",
});

const translateMessage = new MessageTemplate("translate", {
  targetLanguage: "",
  outputLanguage: "",
  targetText: "",
  targetView: "",
});

const sendDatabaseRequest = new MessageTemplate("fetch-data", {
  searchTerms: {},
});

const sendDeleteMessage = new MessageTemplate("delete-entry", {
  value: "",
});

//view instantiations
const defaultView = new View("default-view");
const resultView = new View("result-view");
const translationView = new View("translation-view");
const addProjectView = new View("add-project-view");
const addTagsView = new View("tags-view");

//Set default view
document.addEventListener("DOMContentLoaded", () => {
  defaultView.setDisplay("flex");
  View.currentView = defaultView;
});

//Popup navigation
const currentProjectCreateButton = document.getElementById(
  "current-project-create-button"
);
const currentProjectSearchButton = document.getElementById(
  "search-wrapper-search-button"
);
const currentProjectTranslateButton = document.getElementById(
  "search-wrapper-translate-button"
);

const translateMainMenuButton = document.getElementById(
  "translation-main-menu-button"
);
const resultMainMenuButton = document.getElementById("result-main-menu-button");
const addMainMenuButton = document.getElementById(
  "add-project-main-menu-button"
);

const currentProjectManageButton = document.getElementById(
  "current-project-manage-button"
);

const tagsMainMenuButton = document.getElementById("tags-main-menu-button");

currentProjectCreateButton.addEventListener("click", () => {
  View.changeView(addProjectView);
});

currentProjectSearchButton.addEventListener("click", () => {
  View.changeView(resultView);
});

currentProjectTranslateButton.addEventListener("click", () => {
  View.changeView(translationView);
});

currentProjectManageButton.addEventListener("click", () => {
  View.changeView(addTagsView);
});

translateMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

resultMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

addMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

tagsMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

/**
 *
 * GENERAL FUNCTIONS
 */

function getTags(querySelector) {
  //This function will be used for other parts of the UI

  let tagsNodeList = document.querySelectorAll(`${querySelector} > li span`);

  let tagsList = [];

  for (let tag of tagsNodeList) {
    const parsedTagData = JSON.parse(tag.value);
    tagsList.push(parsedTagData.name);
  }

  return tagsList;
}

async function appendAllProjectDropDown(projectList) {
  //creating new option element for projects
  let projectsDropdownList = [
    currentProjectsProjectDropdown,
    translationProjectsDropdown,
  ];

  for (let dropdown of projectsDropdownList) {
    dropdown.innerHTML = "<option value=default>All Projects</option>";

    for (let project of Object.values(projectList)) {
      let newProjectNameElement = document.createElement("option");

      newProjectNameElement.setAttribute("value", JSON.stringify(project));

      newProjectNameElement.innerText = project.name;

      dropdown.appendChild(newProjectNameElement);
    }
  }

  allProjectsList.innerHTML = "";

  for (let project of Object.values(projectList)) {
    const newElement = document.createElement("li");

    //Create tag class
    newElement.classList.add("vocab-tag-outer");

    newElement.id = `add-tag-${project.name}-tag`;

    newElement.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${project.name}</span>
        </div>
        <div class="vocab-tag-delete" id="add-tag-${project.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    allProjectsList.appendChild(newElement);

    let tag = document.getElementById(`add-tag-${project.name}-delete`);

    tag.addEventListener("click", async () => {
      const deleteProjectMessage = new MessageTemplate("delete-project", project.id);

      // Triger project remove event in backend
      try {
        const response = await chrome.runtime.sendMessage(deleteProjectMessage);

        tag.parentNode.remove();
        delete projectsModel[project.id];

        // Remove current project if match
        if(currentProject.id === project.id){
          currentProject = {};
        }

        // Remove project from dropdowns
        appendAllProjectDropDown(projectsModel);
        appendProjectSearchDropdown(projectsModel)

        // Set current project
        setCurrentProject()

      } catch (e) {
        return;
      }
    });
  }
}

/**
 * Get current project from indexedDB, or set new current project
 * by providing a project Id
 * @param {*} newProject
 */
async function setCurrentProject(newProject) {
  if (!newProject) {
    try {
      const [currentProjectResult] = await VocabDatabase.getAll(
        "currentProject"
      );

      currentProject = currentProjectResult;
      //get current project tags
      setProjectTags(currentProject.tags);
    } catch (e) {
      console.log(e);
    }
  } else {
    currentProject = newProject;
    setProjectTags(currentProject.tags);
  }

  const projectNodeArray =
    currentProjectsProjectDropdown.querySelectorAll("option");

  const projectArray = nodeConvert(projectNodeArray);

  let indexToSet;
  projectArray.find((project, index) => {
    if (project === "default") return false;
    if (project.id === currentProject.id) {
      indexToSet = index;
      return true;
    }
  });

  translationProjectsDropdown.selectedIndex = indexToSet;
  currentProjectsProjectDropdown.selectedIndex = indexToSet;
}

function appendProjectSearchDropdown(projects) {
  if (projects.length === 0) {
    searchParameterValues.innerHTML =
      "<option value=`default`>No Projects Created</option>";
  }
  for (let project of Object.values(projects)) {
    let optionElement = document.createElement("option");

    optionElement.innerText = project.name;

    optionElement.value = JSON.stringify(project);

    searchParameterValues.appendChild(optionElement);
  }
}

async function appendAllLanguages(languagesList) {
  // All language dropdown buttons
  const languageDropdownList = [
    addProjectTargetLanguageDropdown,
    addProjectOutputLanguageDropdown,
    currentProjectTargetLanguageDropdown,
    currentProjectOutputLanguageDropdown,
    translationTargetLanguageDropdown,
    translationOutputLanguageDropdown,
  ];

  for (let dropdown of languageDropdownList) {
    dropdown.innerHTML = "";

    if (languagesList.length === 0) {
      dropdown.innerHTML = "<option value=`default`>No Languages</option>";
    } else {
      for (let language of languagesList) {
        let newTag = document.createElement("option");

        newTag.innerText = language;

        newTag.value = language;

        //Append new tag
        dropdown.appendChild(newTag);
      }
    }
  }

  try {
    let currentProject = await chrome.storage.local.get(["currentProject"]);

    let currentProjectName = Object.keys(currentProject["currentProject"]);

    currentProjectName = currentProjectName[0];

    let currentProjectDetails =
      currentProject["currentProject"][currentProjectName];

    let currentProjectTargetLanguage = currentProjectDetails["target_language"];
    let currentProjectOutputLanguage = currentProjectDetails["output_language"];

    //Check whether current project appears in all project details list

    changeLanguages(currentProjectTargetLanguage, currentProjectOutputLanguage);
  } catch (e) {
    console.log(e);
  }
}

function nodeConvert(nodeList) {
  let newArray = Array.from(nodeList);

  return newArray.map((node) => {
    if (node.value === "default") return "default";
    return JSON.parse(node.value);
  });
}

//Setting tags by default.
function setProjectTags(tags) {
  currentProjectTagSelection.innerHTML = "";
  translationTagSelection.innerHTML = "";

  let tagsSelectionList = [currentProjectTagSelection, translationTagSelection];

  if (tags.length > 0) {
    for (let tagSelection of tagsSelectionList) {
      let tagSelectionValue = tagSelection.id;

      for (let tag of tags) {
        let newTag = document.createElement("li");

        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `${tagSelectionValue}-${tag}-tag`;

        newTag.innerHTML = `
                
                <div class="vocab-tag-inner">
                    <span>${tag.name}</span>
                </div>
                <div class="vocab-tag-delete" id="${tagSelectionValue}-${tag.name}-delete">
                    <button> delete </button>
                </div>
                `;

        //Append new tag
        tagSelection.appendChild(newTag);

        let deleteTag = document.getElementById(
          `${tagSelectionValue}-${tag}-delete`
        );

        if (tagSelection.id === "translation-tags-selected-list") {
          deleteTag.addEventListener("click", () => {
            //Removes list element on click
            deleteTag.parentNode.remove();
          });
        } else {
          deleteTag.addEventListener("click", () => {
            //Removes list element on click

            let tagValue = deleteTag.previousElementSibling.innerText;

            updateCurrentProjectTag.details.tagName = tagValue;
            updateCurrentProjectTag.details.action = "delete";


            //Removes list element on click
            deleteTag.parentNode.remove();

            //Update current project settings
            chrome.runtime.sendMessage(updateCurrentProjectTag);
          });
        }
      }
    }
  } else {
    currentProjectTagSelection.innerHTML = "";
    translationTagSelection.innerHTML = "";
  }
}

function updateTags(tagsList) {
  let tagDropDowns = [
    currentProjectTagsDropdown,
    searchTagsDropdown,
    translationTagsDropdown,
    addProjectTagsDropdown,
  ];

  for (let dropdown of tagDropDowns) {
    //Check whether there are any tags in storage
    if (tagsList.length === 0) {
      dropdown.innerHTML = "<option value=`default`>No Tags Created</option>";
    } else {
      dropdown.innerHTML = "";

      for (let t of tagsList) {
        let newTag = document.createElement("option");

        newTag.innerText = t.name;

        newTag.value = JSON.stringify(t);

        //Append new tag
        dropdown.appendChild(newTag);
      }
    }
  }

  allTagsList.innerHTML = "";

  for (const parsedTag of tagsList) {
    const newElement = document.createElement("li");

    //Create tag class
    newElement.classList.add("vocab-tag-outer");

    newElement.id = `add-tag-${parsedTag.name}-tag`;

    newElement.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${parsedTag.name}</span>
        </div>
        <div class="vocab-tag-delete" id="add-tag-${parsedTag.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    allTagsList.appendChild(newElement);

    let tag = document.getElementById(`add-tag-${parsedTag.name}-delete`);

    //Add event for when tag is removed, triggers update to local storage and updates other dropdowns
    tag.addEventListener("click", () => {
      //Removes list element on click
      const deleteTagMessage = new MessageTemplate("delete-tag", {
        tagName: "",
      });

      tag.parentNode.remove();

      deleteTagMessage.details.tagName = tagName;

      chrome.runtime.sendMessage(deleteTagMessage);
    });
  }
}

function changeLanguages(targetLanguage, outputLanguage) {
  let targetLanguageDropdownList = [
    currentProjectTargetLanguageDropdown,
    translationTargetLanguageDropdown,
  ];

  let outputLanguageDropdownList = [
    currentProjectOutputLanguageDropdown,
    translationOutputLanguageDropdown,
  ];

  for (let dropdown of targetLanguageDropdownList) {
    let languageNodeArray = dropdown.querySelectorAll("option");

    let languageArray = nodeConvert(languageNodeArray);

    let indexToSet = languageArray.indexOf(targetLanguage);

    dropdown.selectedIndex = indexToSet;
  }

  for (let dropdown of outputLanguageDropdownList) {
    let languageNodeArray = dropdown.querySelectorAll("option");

    let languageArray = nodeConvert(languageNodeArray);

    let indexToSet = languageArray.indexOf(outputLanguage);

    dropdown.selectedIndex = indexToSet;
  }
}

//Load current project details
document.addEventListener("DOMContentLoaded", async () => {
  //Get all languages from local storage
  const allLanguages = await chrome.storage.local.get(["allLanguages"]);
  appendAllLanguages(allLanguages.allLanguages);

  // Get all projects
  let allProjects = [];
  try {
    // Array of projects
    allProjects = await VocabDatabase.getAll("projects");
  } catch (e) {
    console.log("Failed to get all projects");
  }

  //Append all projects in local storage
  appendAllProjectDropDown(allProjects);
  appendProjectSearchDropdown(allProjects);

  // Assign projects to local project model
  allProjects.forEach((entry) => {
    projectsModel[entry.id] = entry;
  });

  // Set current project, setting dropdowns to current project etc
  try {
    await getCurrentProject();
  } catch (e) {}

  //Append all languages in local storage
  appendAllLanguages(allLanguages);

  //Append all tags in local storage
  let allTags = [];
  try {
    allTags = await VocabDatabase.getAll("tags");
  } catch (e) {
    console.log(e);
  }
  updateTags(allTags);

  // Assign projects to local project model
  Object.entries(allTags).forEach((entry) => {
    projectsModel[entry[0]] = entry[1];
  });

  // Set current projec
  await setCurrentProject();
});

//Default Popup View logic
const currentProjectsProjectDropdown = document.getElementById(
  "current-project-project-options"
);

//Current Project Logic

/*

    The details for the  current project are set in the main view. Details
    such as project name, urls, default language, and tags, are default values for
    other views and the translation pop up view.

    When the user adds and remove tags, the current project will change dynamically
    so that the current project only has the selected tags.

*/

//Details of current project set by Service Worker, and details of said project updated on DOMs
currentProjectsProjectDropdown.addEventListener("change", async () => {
  //Get project details from dropdown
  const newProject = JSON.parse(currentProjectsProjectDropdown.value);

  //Set message values. Send project name to be set to current
  const setCurrentProjectMessage = new MessageTemplate(
    "set-current-project",
    newProject
  );

  try {
    // If successful, update current project information locally
    const response = await chrome.runtime.sendMessage(setCurrentProjectMessage);
    if (!response) return;

    setCurrentProject(newProject);
  } catch (e) {
    return;
  }
});

//Default languages

const currentProjectTargetLanguageDropdown = document.getElementById(
  "current-project-target-language-set"
);

const currentProjectOutputLanguageDropdown = document.getElementById(
  "current-project-output-language-set"
);

//Tag selection

const currentProjectTagsDropdown = document.getElementById(
  "current-project-tag-select"
);

const currentProjectAddTagButton = document.getElementById(
  "current-project-add-tag"
);

const currentProjectTagSelection = document.getElementById(
  "current-project-tags-selected-list"
);

let currentProjectTagValue;

currentProjectAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded

  const tagData = JSON.parse(currentProjectTagsDropdown.value);
  if (!document.getElementById(`current-project-${tagData.name}-tag`)) {
    let newTag = document.createElement("li");

    //Create tag class
    newTag.classList.add("vocab-tag-outer");

    newTag.id = `current-project-${tagData.name}-tag`;

    newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${tagData.name}</span>
        </div>
        <div class="vocab-tag-delete" id="current-project-${tagData.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    currentProjectTagSelection.appendChild(newTag);

    //Update current project settings.

    updateCurrentProjectTag.details.tagName = currentProjectTagsDropdown.value;
    updateCurrentProjectTag.details.action = "add";

    chrome.runtime.sendMessage(updateCurrentProjectTag);

    let tag = document.getElementById(`current-project-${tagData.name}-delete`);

    tag.addEventListener("click", () => {
      let tagValue = tag.previousElementSibling.innerText;

      updateCurrentProjectTag.details.tagName = tagValue;
      updateCurrentProjectTag.details.action = "delete";

      //Removes list element on click
      tag.parentNode.remove();

      //Update current project settings
      chrome.runtime.sendMessage(updateCurrentProjectTag);
    });
  }
});

const changeLanguageMessage = new MessageTemplate("change-language", {
  language: "",
  type: "",
});

//Update current projects and translation view language select
currentProjectTargetLanguageDropdown.addEventListener("change", () => {
  //Check whether there is no current project set

  if (currentProjectsProjectDropdown.value === "default") {
    let newTargetLanguage = currentProjectTargetLanguageDropdown.value;

    let newOutputLanguage = currentProjectOutputLanguageDropdown.value;

    changeLanguages(newTargetLanguage, newOutputLanguage);
  } else {
    let newProjectTargetLanguage = currentProjectTargetLanguageDropdown.value;

    changeLanguageMessage.details.language = newProjectTargetLanguage;
    changeLanguageMessage.details.type = "target";

    chrome.runtime.sendMessage(changeLanguageMessage);
  }
});

//Update current projects and translation view language select
currentProjectOutputLanguageDropdown.addEventListener("change", () => {
  if (currentProjectsProjectDropdown.value === "default") {
    let newTargetLanguage = currentProjectTargetLanguageDropdown.value;

    let newOutputLanguage = currentProjectOutputLanguageDropdown.value;

    changeLanguages(newTargetLanguage, newOutputLanguage);
  } else {
    let newProjectOutputLanguage = currentProjectOutputLanguageDropdown.value;

    changeLanguageMessage.details.language = newProjectOutputLanguage;
    changeLanguageMessage.details.type = "output";

    chrome.runtime.sendMessage(changeLanguageMessage);
  }
});

//Current project search logic

//Tag selelction

const searchTagsDropdown = document.getElementById("search-tag-select");

const searchAddTagButton = document.getElementById("search-add-tag");

const searchTagSelection = document.getElementById("search-tags-selected-list");

searchAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded

  const searchTagValue = JSON.parse(searchTagsDropdown.value);
  if (!document.getElementById(`search-${searchTagsDropdown.name}-tag`)) {
    let newTag = document.createElement("li");

    //Create tag class
    newTag.classList.add("vocab-tag-outer");

    newTag.id = `search-${searchTagValue.name}-tag`;

    newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${searchTagValue.name}</span>
        </div>
        <div class="vocab-tag-delete" id="search-${searchTagValue.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    searchTagSelection.appendChild(newTag);

    let tag = document.getElementById(`search-${searchTagValue.name}-delete`);

    tag.addEventListener("click", () => {
      //Removes list element on click

      tag.parentNode.remove();
    });
  }
});

//Choose parameter dropdown

const searchParameterDropdown = document.getElementById(
  "search-wrapper-parameters-list"
);

const searchParameterValues = document.getElementById(
  "search-wrapper-data-list"
);

const searchByTagsWrapper = document.getElementById(
  "search-by-tag-list-wrapper"
);

searchByTagsWrapper.style.display = "none";

searchParameterDropdown.addEventListener("change", async () => {
  searchByTagsWrapper.style.display = "none";

  searchParameterValues.innerHTML = "";

  let searchParameterDropdownValue = searchParameterDropdown.value;

  let allProjectDetailsRequest = await chrome.storage.local.get([
    "allProjectDetails",
  ]);

  let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

  //Get array from list

  if (searchParameterDropdownValue === "allTags") {
    searchByTagsWrapper.style.display = "flex";
  } else if (
    searchParameterDropdownValue === "targetLanguage" ||
    searchParameterDropdownValue === "outputLanguage" ||
    searchParameterDropdownValue === "allLanguages"
  ) {
    let parameterValues = allProjectDetails["allLanguages"];

    for (let parameter of parameterValues) {
      let optionElement = document.createElement("option");

      optionElement.innerText = parameter;

      optionElement.value = parameter;

      searchParameterValues.appendChild(optionElement);
    }
  } else {
    let parameterValues = allProjectDetails[searchParameterDropdownValue];

    if (parameterValues.length === 0) {
      let optionElement = document.createElement("option");

      optionElement.innerText = "No data available";

      optionElement.value = "none";

      searchParameterValues.appendChild(optionElement);
    } else {
      for (let parameter of parameterValues) {
        let optionElement = document.createElement("option");

        optionElement.innerText = parameter;

        optionElement.value = parameter;

        searchParameterValues.appendChild(optionElement);
      }
    }
  }
});

//Search wrapper buttons logic

const searchSearchButton = document.getElementById(
  "search-wrapper-search-button"
);

searchSearchButton.addEventListener("click", () => {
  let searchTerms = {
    searchParameter: searchParameterValues.value,
    searchType: searchParameterDropdown.value,
    tags: getTags("#search-tags-selected-list"),
  };

  //Send request to get database entries

  sendDatabaseRequest.details.searchTerms = searchTerms;

  chrome.runtime.sendMessage(sendDatabaseRequest);

  //reset search parameters

  let listOfTags = document.querySelectorAll(`#search-tags-selected-list > li`);

  for (let listNode of listOfTags) {
    listNode.remove();
  }
});

//translate logic

const translateButton = document.getElementById(
  "search-wrapper-translate-button"
);

const translateInput = document.getElementById("translate-input");

translateButton.addEventListener("click", (e) => {
  e.stopPropagation();

  let translationStringInput = translateInput.value;

  translateInput.value = "";
  translationInput.value = translationStringInput;

  let inputStatus = Sanitiser.checkTranslationInput(translationStringInput);

  if (inputStatus == true) {
    //encode translate language message on click.

    translateMessage.details.targetLanguage =
      currentProjectTargetLanguageDropdown.value;
    translateMessage.details.outputLanguage =
      currentProjectOutputLanguageDropdown.value;
    translateMessage.details.targetText = translationStringInput;
    translateMessage.details.targetView = "translation-view";

    //Send message to initiate translation

    chrome.runtime.sendMessage(translateMessage);
  } else {
    translationOutput.value =
      "Max character limit reached. Only 50 characters permitted";
  }
});

//Results View logic

//Table

const resultTableBody = document.getElementById("popup-result-table-view");

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message === "display-results") {
    resultTableBody.innerHTML = "";

    let results;

    if (request.details.searchResults.length === 0) {
      resultTableBody.innerText = "No results found";

      return;
    }

    if (request.details.tags == true) {
      let resultsArrays = request.details.searchResults;

      let uniqueValues = [];

      results = [];

      for (let array of resultsArrays) {
        for (let entry of array) {

          if (!uniqueValues.some((element) => entry.foreign_word === element)) {
            uniqueValues.push(entry.foreign_word);
            results.push(entry);
          }
        }
      }
    } else {
      results = request.details.searchResults;
    }

    let resultTally = 0;

    //Populate table with rows

    for (let result of results) {
      resultTally = resultTally + 1;

      let tableRow = document.createElement("tr");

      tableRow.classList.add("result-table-content-row");

      let foreignWord = document.createElement("td");
      foreignWord.classList.add("table-cell");
      foreignWord.classList.add("result-table-content-fword");
      foreignWord.setAttribute("value", `${result.foreign_word}`);
      foreignWord.setAttribute("id", `${result.foreign_word}`);
      foreignWord.innerText = `${result.foreign_word}\n(${result.target_language})`;
      foreignWord.contentEditable = true;

      let translatedWord = document.createElement("td");
      translatedWord.classList.add("table-cell");
      translatedWord.classList.add("result-table-content-fword");
      translatedWord.innerText = `${result.translated_word}\n(${result.output_language})`;
      translatedWord.contentEditable = true;

      let project = document.createElement("td");
      project.classList.add("table-cell");
      project.classList.add("result-table-content-fword");
      project.innerText = result.project;

      let url = document.createElement("td");
      url.classList.add("table-cell");
      url.classList.add("result-table-content-fword");
      url.innerText = result.source_url;

      let tags = document.createElement("td");
      tags.classList.add("table-cell");
      tags.classList.add("result-table-content-fword");
      tags.innerText = result.tags;

      //Create delete button

      let deleteWrapper = document.createElement("td");
      deleteWrapper.classList.add("table-cell");
      deleteWrapper.classList.add("result-table-content-delete");
      let deleteButton = document.createElement("button");
      deleteButton.classList.add("vocab-button");
      deleteButton.innerText = "Delete";
      deleteButton.style.fontSize = "8px";
      deleteButton.setAttribute(
        "id",
        `result-view-delete-button-${resultTally}`
      );

      deleteWrapper.appendChild(deleteButton);

      tableRow.appendChild(foreignWord);
      tableRow.appendChild(translatedWord);
      tableRow.appendChild(project);
      tableRow.appendChild(url);
      tableRow.appendChild(tags);
      tableRow.appendChild(deleteWrapper);

      resultTableBody.appendChild(tableRow);

      let deleteButtonListener = document.getElementById(
        `result-view-delete-button-${resultTally}`
      );

      deleteButtonListener.addEventListener("click", () => {
        let elementToDelete = document.getElementById(`${result.foreign_word}`);

        let elementText = elementToDelete.textContent;

        console.log(elementText);

        //Splitting the two lines

        let lines = elementText.split("(");

        let elementValue = lines[0];

        console.log(elementValue);

        sendDeleteMessage.details.value = elementValue;

        console.log(sendDeleteMessage);

        chrome.runtime.sendMessage(sendDeleteMessage);

        elementToDelete.parentNode.remove();
      });
    }

    let currentDatabaseSearchRequest = await chrome.storage.local.get([
      "currentDatabaseSearch",
    ]);

    let currentDatabaseSearch =
      currentDatabaseSearchRequest["currentDatabaseSearch"];

    let csvString = [
      [
        "Foreign Word",
        "Foreign Word Language",
        "Translated Word",
        "Translated Word Language",
        "Project",
      ],
      ...currentDatabaseSearch.map((object) => [
        object.foreign_word,
        object.target_language,
        object.translated_word,
        object.output_language,
        object.project,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

    try {
      let oldLink = document.getElementById("result");
      resultExport.removeChild(oldLink);
    } catch (e) {
      console.log(e);
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("id", "result");
    link.download = "data.csv";

    resultExport.appendChild(link);
  }
});

//Search and clear buttons

const resultClear = document.getElementById("result-clear");

resultClear.addEventListener("click", async () => {
  //resultURLDropdown.selectedIndex = 0;
  //resultProjectDropdown.selectedIndex = 0;
  //resultTagsDropdown.selectedIndex = 0;

  let listOfTags = document.querySelectorAll(`#result-tags-selected-list > li`);

  for (let listNode of listOfTags) {
    listNode.remove();
  }

  //reset results table

  resultTableBody.innerHTML = "";

  //Reset current search value

  let currentDatabaseSearch = {
    currentDatabaseSearch: [],
  };

  await chrome.storage.local.set(currentDatabaseSearch);
});

//Export button

const resultExport = document.getElementById("result-export");

resultExport.addEventListener("click", () => {
  let link = document.getElementById("result");

  chrome.downloads.download({
    url: link.href,
  });
});

//Translation View Logic

//Tags selection

const translationTagsDropdown = document.getElementById(
  "translation-tag-select"
);

const translationAddTagButton = document.getElementById("translation-add-tag");

const translationTagSelection = document.getElementById(
  "translation-tags-selected-list"
);

translationAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded

  const translationTagValue = JSON.parse(translationTagsDropdown.value);

  if (!document.getElementById(`translation-${translationTagValue.name}-tag`)) {
    let newTag = document.createElement("li");

    //Get select value

    //Create tag class
    newTag.classList.add("vocab-tag-outer");

    newTag.id = `translation-${translationTagValue.name}-tag`;

    newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${translationTagValue.name}</span>
        </div>
        <div class="vocab-tag-delete" id="translation-${translationTagValue.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    translationTagSelection.appendChild(newTag);

    let tag = document.getElementById(
      `translation-${translationTagValue.name}-delete`
    );

    tag.addEventListener("click", () => {
      //Removes list element on click

      tag.parentNode.remove();
    });
  }
});

//Language and project buttons logic

const translationTargetLanguageDropdown = document.getElementById(
  "translation-target-language"
);
const translationOutputLanguageDropdown = document.getElementById(
  "translation-output-language"
);

const translationProjectsDropdown = document.getElementById(
  "translation-parameter-project-set"
);

//output logic

const translationInput = document.getElementById("translation-input-text");
const translationOutput = document.getElementById("translation-output-text");

//Save to database button
const translationSave = document.getElementById("translation-save");

translationSave.addEventListener("click", async () => {
  const projectObject = JSON.parse(translationProjectsDropdown.value);
  // Must assign an entry to a project
  if (!projectObject.id) return;
  const translationResults = {
    target_word: translationInput.value,
    output_word: translationOutput.value,
    target_language: translationTargetLanguageDropdown.value,
    output_language: translationOutputLanguageDropdown.value,
    /**
     * No URL here because translation  done directly in the
     * action popup.
     */
    url: "",
    tags: getTags("#translation-tags-selected-list"),
    id: crypto.randomUUID(),
    projectId: projectObject.id,
  };

  const sendNewText = new MessageTemplate("add-new-text", translationResults);

  sendNewText.details = translationResults;

  try {
    const response = await chrome.runtime.sendMessage(sendNewText);
    console.log(response);
    if (!response) return;
  } catch (e) {
    console.log(e);
    return;
  }

  //reset search parameters
  translationInput.value = "";
  translationOutput.value = "";
});

translationOutputLanguageDropdown.addEventListener("change", (e) => {
  e.stopPropagation();

  resetTimer();
  startTimer();
});

translationTargetLanguageDropdown.addEventListener("change", (e) => {
  e.stopPropagation();

  resetTimer();
  startTimer();
});

let timer;

function startTimer() {
  timer = setTimeout(() => {
    let translationStringInput = translationInput.value;

    let inputStatus = Sanitiser.checkTranslationInput(translationStringInput);

    if (inputStatus == true) {
      //encode translate language message on click.
      translateMessage.details.targetLanguage =
        translationTargetLanguageDropdown.value;
      translateMessage.details.outputLanguage =
        translationOutputLanguageDropdown.value;
      translateMessage.details.targetText = translationStringInput;
      translateMessage.details.targetView = "translation-view";

      //Send message to initiate translation
      chrome.runtime.sendMessage(translateMessage);
    } else {
      translationOutput.value =
        "Max character limit reached. Only 50 characters permitted";
    }
  }, 1000);
}

function resetTimer() {
  clearTimeout(timer);
}

translationInput.addEventListener("input", (e) => {
  e.stopPropagation();

  resetTimer();
  startTimer();
});

//Populate data based on API response

chrome.runtime.onMessage.addListener((request) => {
  if (
    request.message === "translation-result" &&
    request.details.targetView === "translation-view"
  ) {
    translationOutput.value = request.details.resultDetails;
  }
});

//Add event  listener to input so that when no changes take place for more than  3 seconds, then translation API is fired

//Add Project View Logic

//Tags selection

const addProjectTagsDropdown = document.getElementById(
  "add-project-tags-dropdown"
);

const addProjectAddTagButton = document.getElementById("add-project-add-tag");

const addProjectTagSelection = document.getElementById(
  "add-project-tags-selected-list"
);

addProjectAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded
  const addProjectTagValue = JSON.parse(addProjectTagsDropdown.value);

  if (!document.getElementById(`add-project-${addProjectTagValue.name}-tag`)) {
    let newTag = document.createElement("li");

    //Get select value

    //Create tag class
    newTag.classList.add("vocab-tag-outer");

    newTag.id = `add-project-${addProjectTagValue.name}-tag`;

    newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${addProjectTagValue.name}</span>
        </div>
        <div class="vocab-tag-delete" id="add-project-${addProjectTagValue.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    addProjectTagSelection.appendChild(newTag);

    let tag = document.getElementById(
      `add-project-${addProjectTagValue.name}-delete`
    );

    tag.addEventListener("click", () => {
      //Moves list element on click

      tag.parentNode.remove();
    });
  }
});

//Get dropdown selection
const addProjectTargetLanguageDropdown = document.getElementById(
  "add-project-target-language-dropdown"
);
const addProjectOutputLanguageDropdown = document.getElementById(
  "add-project-output-language-dropdown"
);

const addProjectNameInput = document.getElementById("add-project-name-input");

//Create project button
const addProjectCreate = document.getElementById("add-project-create-project");

/**
 * Project entry shape
 */
addProjectCreate.addEventListener("click", async () => {
  // Validate project details
  if (addProjectNameInput.value.length < 5) return;

  // Get details
  const newProjectDetails = {
    name: addProjectNameInput.value,
    default_target_language: addProjectTargetLanguageDropdown.value,
    default_output_language: addProjectOutputLanguageDropdown.value,
    tags: getTags("#add-project-tags-selected-list"),
    id: crypto.randomUUID(),
    entries: {},
  };

  try {
    await createProject(newProjectDetails);
  } catch (e) {
    console.log("Could not create project");

    return;
  }

  //Reset parameters

  addProjectNameInput.value = "";

  addProjectTargetLanguageDropdown.selectedIndex = 0;
  addProjectOutputLanguageDropdown.selectedIndex = 0;

  let listOfTags = document.querySelectorAll(
    `#add-project-tags-selected-list > li`
  );

  for (let listNode of listOfTags) {
    listNode.remove();
  }
});

async function createProject(newProjectDetails) {
  const addProjectMessage = new MessageTemplate("add-project", {
    projectDetails: newProjectDetails,
  });

  //New project details sent to Service Worker - returns message to update DOM.
  try {
    const success = await chrome.runtime.sendMessage(addProjectMessage);

    if (!success) throw new Error("");

    projectsModel[newProjectDetails.id] = newProjectDetails;
    // Append new project to projects lists
    appendAllProjectDropDown(projectsModel);
    appendProjectSearchDropdown(projectsModel);

    // Set project
    setCurrentProject()

    return success;
  } catch (e) {
    throw e;
  }
}

//Tags buttons

const createNewTagInput = document.getElementById("create-new-tag-input");

const createNewTagButton = document.getElementById(
  "tags-create-new-tag-button"
);

//lists

const allTagsList = document.getElementById("add-tags-tags-list");

const allProjectsList = document.getElementById("add-tags-project-list");

//Add tags events
createNewTagButton.addEventListener("click", async () => {
  let newTagInputText = createNewTagInput.value.trim();

  if (newTagInputText.length === 0) return;

  const addTagMessage = new MessageTemplate("add-tag", {
    name: "",
    id: "",
  });

  const newTag = {
    name: newTagInputText,
    id: crypto.randomUUID(),
  };
  addTagMessage.details = newTag;

  try {
    const response = await chrome.runtime.sendMessage(addTagMessage);

    console.log(response);

    if (!response) return;

    // If successful, add to tags list and update tags drop downs
    tagsArray.push(newTag);
    updateTags(tagsArray);
  } catch (e) {}
});
