/**
 * Encapsulates prjoects logic
 */

import {
  translationProjectsDropdown,
  currentProjectsProjectDropdown,
  currentProjectTargetLanguageDropdown,
  currentProjectOutputLanguageDropdown,
  allProjectsList,
  addProjectCreate,
  addProjectNameInput,
  addProjectOutputLanguageDropdown,
  addProjectTargetLanguageDropdown,
  searchParameterValues,
} from "./targets.js";
import { MessageTemplate } from "./messages.js";
import { VocabDatabase } from "../database/database.js";
import * as Globals from "./globals.js";
import { setProjectTags } from "./tags.js";
import { changeLanguages } from "./languages.js";
import * as Helpers from "./helpers.js";

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
    /**
     * Tags array needs to be stringified--
     */
    tags: JSON.stringify(Helpers.getTags("#add-project-tags-selected-list")),
    id: crypto.randomUUID(),
    entries: JSON.stringify({}),
  };

  try {
    await createProject(newProjectDetails);
  } catch (e) {
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

export async function createProject(newProjectDetails) {
  const addProjectMessage = new MessageTemplate("add-project", {
    projectDetails: newProjectDetails,
  });

  //New project details sent to Service Worker - returns message to update DOM.
  try {
    const success = await chrome.runtime.sendMessage(addProjectMessage);

    if (!success) throw new Error("");

    // Parse the tags and entries aprts
    newProjectDetails.tags = JSON.parse(newProjectDetails.tags);
    newProjectDetails.entries = JSON.parse(newProjectDetails.entries);

    Globals.projectsModel[newProjectDetails.id] = newProjectDetails;
    // Append new project to projects lists
    appendAllProjectDropDown(Globals.projectsModel);
    appendProjectSearchDropdown(Object.values(Globals.projectsModel));

    return success;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Details of current project set by Service Worker, and details of said project updated on DOMs
currentProjectsProjectDropdown.addEventListener("change", async (e) => {
  let newProject;
  if (currentProjectsProjectDropdown.value === "default") {
    newProject = "default";
  } else {
    //Get project details from dropdown
    newProject = JSON.parse(currentProjectsProjectDropdown.value);

    // Stringify tags and entries
    newProject.tags = JSON.stringify(newProject.tags);
    newProject.entries = JSON.stringify(newProject.entries);
  }

  //Set message values. Send project name to be set to current
  const setCurrentProjectMessage = new MessageTemplate(
    "set-current-project",
    newProject
  );

  try {
    // If successful, update current project information locally
    const response = await chrome.runtime.sendMessage(setCurrentProjectMessage);
    if (!response) return;

    if (currentProjectsProjectDropdown.value !== "default") {
      newProject.tags = JSON.parse(newProject.tags);
      newProject.entries = JSON.parse(newProject.entries);
    }
    setCurrentProject(newProject);
  } catch (e) {
    return;
  }
});

/**
 * Get current project from indexedDB, or set new current project
 * by providing a project Id
 * @param {*} newProject
 */
export async function setCurrentProject(newProject) {
  if (!newProject) {
    try {
      const [currentProjectResult] = await VocabDatabase.getAll(
        "currentProject"
      );

      if (!currentProjectResult) {
        Globals.currentProject.id = "default";
        Globals.currentProject.name = "default";
        Globals.currentProject.default_target_language = "Spanish";
        Globals.currentProject.default_output_language = "Spanish";
        Globals.currentProject.tags = [];
        Globals.currentProject.entries = {};
      } else {
        Object.entries(currentProjectResult).forEach((entry) => {
          if (entry[0] === "tags" || entry[0] === "entries") {
            Globals.currentProject[entry[0]] = Helpers.isJsonString(entry[1])
              ? JSON.parse(entry[1])
              : entry[1];
            return;
          }
          Globals.currentProject[entry[0]] = entry[1];
        });
      }
    } catch (e) {
      console.log(e);
    }
  } else if (newProject === "default") {
    Globals.currentProject.id = "default";
    Globals.currentProject.name = "default";
    Globals.currentProject.default_target_language = "Spanish";
    Globals.currentProject.default_output_language = "Spanish";
    Globals.currentProject.tags = [];
    Globals.currentProject.entries = {};
  } else {
    Object.entries(newProject).forEach((entry) => {
      Globals.currentProject[entry[0]] = entry[1];
    });
  }

  // Update dropdowns and other values
  //get current project tags. .tags is stringified
  setProjectTags(Globals.currentProject.tags);

  // Change language index set on dropdown
  changeLanguages(
    Globals.currentProject.default_target_language,
    Globals.currentProject.default_output_language
  );

  // Change project index for dropdowns
  const projectNodeArray =
    currentProjectsProjectDropdown.querySelectorAll("option");

  const projectArray = Helpers.nodeConvert(projectNodeArray);

  let indexToSet;
  projectArray.find((project, index) => {
    if (project === "default") return false;
    if (project.id === Globals.currentProject.id) {
      indexToSet = index;
      return true;
    }
  });

  translationProjectsDropdown.selectedIndex = indexToSet;
  currentProjectsProjectDropdown.selectedIndex = indexToSet;
}



//Update current projects and translation view language select
currentProjectTargetLanguageDropdown.addEventListener("change", async() => {
  if (currentProjectsProjectDropdown.value === "default") {
    let newTargetLanguage = currentProjectTargetLanguageDropdown.value;
    let newOutputLanguage = currentProjectOutputLanguageDropdown.value;
    changeLanguages(newTargetLanguage, newOutputLanguage);
  } else {
    let newProjectTargetLanguage = currentProjectTargetLanguageDropdown.value;

    const updatedProject = {
      ...Globals.currentProject,
      default_target_language: newProjectTargetLanguage,
      tags: JSON.stringify(Globals.currentProject.tags),
      entries: JSON.stringify(Globals.currentProject.entries),

    }

    const changeLanguageMessage = new MessageTemplate("change-language", updatedProject);

    try{
      const result = await chrome.runtime.sendMessage(changeLanguageMessage);

      if(!result.success) return

      // Update local current project
      Globals.currentProject.default_target_language =  newProjectTargetLanguage;

      // Update rpoejct in pprojectModels
      Globals.projectsModel[Globals.currentProject.id].default_target_language =  newProjectTargetLanguage;

      changeLanguages(newProjectTargetLanguage,  Globals.currentProject.default_output_language)

    }catch(e){
      console.log(e)
      return
    }
  }
});

//Update current projects and translation view language select
currentProjectOutputLanguageDropdown.addEventListener("change", async() => {
  if (currentProjectsProjectDropdown.value === "default") {
    let newTargetLanguage = currentProjectTargetLanguageDropdown.value;

    let newOutputLanguage = currentProjectOutputLanguageDropdown.value;

    changeLanguages(newTargetLanguage, newOutputLanguage);
  } else {
    let newProjectOutputLanguage = currentProjectOutputLanguageDropdown.value;

    const updatedProject = {
      ...Globals.currentProject,
      default_output_language: newProjectOutputLanguage,
      tags: JSON.stringify(Globals.currentProject.tags),
      entries: JSON.stringify(Globals.currentProject.entries),

    }

    const changeLanguageMessage = new MessageTemplate("change-language", updatedProject);

    try{
      const result = await chrome.runtime.sendMessage(changeLanguageMessage);

      if(!result.success) return

      // Update local current project
      Globals.currentProject.default_output_language =  newProjectOutputLanguage;

      // Update rpoejct in pprojectModels
      Globals.projectsModel[Globals.currentProject.id].default_output_language =  newProjectOutputLanguage;

      changeLanguages(Globals.currentProject.default_target_language,  newProjectOutputLanguage)


    }catch(e){
      console.log(e)
      return
    }

  }
});

export async function appendAllProjectDropDown(projectList) {
  //creating new option element for projects
  let projectsDropdownList = [
    currentProjectsProjectDropdown,
    translationProjectsDropdown,
  ];

  for (let dropdown of projectsDropdownList) {
    dropdown.innerHTML = "<option value=default>default</option>";

    for (let project of Object.values(projectList)) {
      let newProjectNameElement = document.createElement("option");

      newProjectNameElement.setAttribute("value", JSON.stringify(project));

      newProjectNameElement.innerText = project.name;

      dropdown.appendChild(newProjectNameElement);
    }
  }

  // List of projects in manage projects  section
  allProjectsList.innerHTML = "";

  for (let project of Object.values(projectList)) {
    const newElement = document.createElement("li");

    //Create tag class
    newElement.classList.add("vocab-tag-outer");

    newElement.id = `add-tag-${project.name}-tag`;

    newElement.innerHTML = `
        
        <div class="vocab-tag-inner" value="${JSON.stringify(project)}">
            <span>${project.name}</span>
        </div>
        <div class="vocab-tag-delete" id="add-tag-${project.name}-delete">
            <button> delete </button>
        </div>
        `;
    //Append new tag
    allProjectsList.appendChild(newElement);

    //Delete button
    let deleteButton = document.getElementById(
      `add-tag-${project.name}-delete`
    );

    // Delete project and update UI
    deleteButton.addEventListener("click", async () => {
      const deleteProjectMessage = new MessageTemplate(
        "delete-project",
        project.id
      );

      // Trigger project remove event in backend
      try {
        const response = await chrome.runtime.sendMessage(deleteProjectMessage);

        if (!response) return;

        // Remove tag and button
        deleteButton.parentNode.remove();

        // Remove project from projectsModel
        delete Globals.projectsModel[project.id];


        // Remove project from dropdowns
        appendAllProjectDropDown(Globals.projectsModel);
        appendProjectSearchDropdown(Object.values(Globals.projectsModel));

        // Set current project after all projects finished
        if (Globals.currentProject.id === project.id) {
          Globals.currentProject.id = "default";
          Globals.currentProject.name = "default";
          Globals.currentProject.default_target_language = "Spanish";
          Globals.currentProject.default_output_language = "Spanish";
          Globals.currentProject.tags = [];
          Globals.currentProject.entries = {};
        }

        setCurrentProject(Globals.currentProject);
      } catch (e) {
        console.log(e)
        return;
      }
    });
  }
}

export function appendProjectSearchDropdown(projects) {
  if (projects.length === 0) {
    searchParameterValues.innerHTML =
      "<option value=`default`>No Projects Created</option>";
  }
  for (let project of Object.values(projects)) {
    let optionElement = document.createElement("option");

    optionElement.innerText = project.name;

    optionElement.setAttribute("value", JSON.stringify(project));

    searchParameterValues.appendChild(optionElement);
  }
}
