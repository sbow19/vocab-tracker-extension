import * as Globals from "./globals.js";
import { isJsonString } from "./helpers.js";

/**
 * searchTerms = {
     searchParameter: searchParameterValues.value, // Possibly stringified tag or project  object
     searchType: searchParameterDropdown.value, // Data type
     tags: getTags("#search-tags-selected-list"),
   };
 */
export function searchLogic(searchTerms) {
  const { searchParameter, searchType, tags } = searchTerms;

  // If no search parameter
  if (!searchParameter && searchType === "projects") return null;

  const projectsModel = Globals.projectsModel;
  const entries = [];

  switch (searchType) {
    case "projects": {
      //Get all entries per a given project
      const projectDetails = JSON.parse(searchParameter);
      const projectEntries = projectsModel[projectDetails.id].entries;
      Object.values(projectEntries).forEach((entry) => {
        if (isJsonString(entry.tags)) {
          entry.tags = JSON.parse(entry.tags);
        }
        entries.push(entry);
      });
      return entries;
    }
    case "tags":
      {
        // Get all entries matching tags
        const matchedEntryIds = [];

        //Loop through each tag
        for (let tag of tags) {
          //Get all projects and loop through
          Object.values(projectsModel).forEach((project) => {
            Object.values(project.entries).forEach((entry) => {
              // If entry already in matchedEntry ids then skip
              if (matchedEntryIds.includes(entry.id)) return;
              if (isJsonString(entry.tags)) {
                entry.tags = JSON.parse(entry.tags);
              }
              Object.values(entry.tags).forEach((indivTag) => {
                if (indivTag.id === tag.id) {
                  matchedEntryIds.push(entry.id);
                  entries.push(entry);
                }
              });
            });
          });
        }
      }
      return entries;
    case "allLanguages":
      {
        // Get all entries matching tags
        const matchedEntryIds = [];
        Object.values(projectsModel).forEach((project) => {
          Object.values(project.entries).forEach((entry) => {
            // If entry already in matchedEntry ids then skip
            if (matchedEntryIds.includes(entry.id)) return;
            
            if(entry.target_language === searchParameter || entry.output_language === searchParameter ){
              if (isJsonString(entry.tags)) {
                entry.tags = JSON.parse(entry.tags);
              }
              matchedEntryIds.push(entry.id)
              entries.push(entry)
            }
          });
        });
      }
      return entries;
    case "targetLanguage":
      {
        // Get all entries matching tags
        const matchedEntryIds = [];
        Object.values(projectsModel).forEach((project) => {
          Object.values(project.entries).forEach((entry) => {
            // If entry already in matchedEntry ids then skip
            if (matchedEntryIds.includes(entry.id)) return;
            
            if(entry.target_language === searchParameter){
              if (isJsonString(entry.tags)) {
                entry.tags = JSON.parse(entry.tags);
              }
              matchedEntryIds.push(entry.id)
              entries.push(entry)
            }
          });
        });
      }
      return entries
    case "outputLanguage":
      {
        // Get all entries matching tags
        const matchedEntryIds = [];
        Object.values(projectsModel).forEach((project) => {
          Object.values(project.entries).forEach((entry) => {
            // If entry already in matchedEntry ids then skip
            if (matchedEntryIds.includes(entry.id)) return;
            
            if(entry.output_language === searchParameter){
              if (isJsonString(entry.tags)) {
                entry.tags = JSON.parse(entry.tags);
              }
              matchedEntryIds.push(entry.id)
              entries.push(entry)
            }
          });
        });
      }
      return entries
      
    default:
      return null;
  }
}
