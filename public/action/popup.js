import { VocabDatabase } from "../database/database.js";
import * as Tags from "./tags.js"
import * as Projects from "./projects.js"
import * as Languages from "./languages.js"
import * as Globals from "./globals.js"

import "./views.js"
import "./translation.js"
import "./search.js"
import { isJsonString } from "./helpers.js";


//Load current project details
document.addEventListener("DOMContentLoaded", async () => {
  //Get all languages from local storage
  const allLanguages = await chrome.storage.local.get(["allLanguages"]);
  Languages.appendAllLanguages(allLanguages.allLanguages);

  // Get all projects
  let allProjects = [];
  try {
    // Array of projects
    allProjects = await VocabDatabase.getAll("projects");
  } catch (e) {
    console.log("Failed to get all projects");
  }

  

  // Assign projects to local project model
  allProjects.forEach((entry) => {

    Globals.projectsModel[entry.id] = entry;


    // Parse tags array to ensure they are not stringified
    if(isJsonString(Globals.projectsModel[entry.id].tags)){
      Globals.projectsModel[entry.id].tags = JSON.parse(Globals.projectsModel[entry.id].tags)

    } else {
      Globals.projectsModel[entry.id].tags = Globals.projectsModel[entry.id].tags
    }

    // Parse entries object
    if(isJsonString(Globals.projectsModel[entry.id].entries)){
      Globals.projectsModel[entry.id].entries = JSON.parse(Globals.projectsModel[entry.id].entries)

    } else {
      Globals.projectsModel[entry.id].entries = Globals.projectsModel[entry.id].entries
    }

  });

  //Append all projects in local storage
  Projects.appendAllProjectDropDown(Globals.projectsModel);
  Projects.appendProjectSearchDropdown(Globals.projectsModel);

  //Append all tags in local storage
  let allTags = [];
  try {
    allTags = await VocabDatabase.getAll("tags");
    for(let tag of allTags){
      Globals.tagsArray.push(tag)
    }
  } catch (e) {
    console.log(e);
  }
  Tags.updateTags(allTags);

  // Set current projec
  Projects.setCurrentProject();
});





