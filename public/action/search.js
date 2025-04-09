import {
  searchAddTagButton,
  searchTagsDropdown,
  searchParameterDropdown,
  searchParameterValues,
  searchByTagsWrapper,
  searchSearchButton,
  resultTableBody,
  resultClear,
  resultExport,
  searchTagSelection
} from "./targets.js";

import * as Globals from "./globals.js";

import { getTags } from "./helpers.js";

import { MessageTemplate } from "./messages.js";
import { searchLogic } from "./searchLogic.js";

searchAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded

  const searchTagValue = JSON.parse(searchTagsDropdown.value);
  if (document.getElementById(`search-${searchTagsDropdown.name}-tag`)) return;

  let newTag = document.createElement("li");
  //Create tag class
  newTag.classList.add("vocab-tag-outer");

  newTag.id = `search-${searchTagValue.name}-tag`;

  newTag.innerHTML = `
        
        <div class="vocab-tag-inner" value='${searchTagsDropdown.value}'>
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
});

// Default styling
searchByTagsWrapper.style.display = "none";

// Choose different parameter to search by
searchParameterDropdown.addEventListener("change", async () => {
  searchByTagsWrapper.style.display = "none";

  searchParameterValues.innerHTML = "";

  const searchParameterDropdownValue = searchParameterDropdown.value;

  if (searchParameterDropdownValue === "tags") {
    searchByTagsWrapper.style.display = "flex";
  } else if (
    searchParameterDropdownValue === "targetLanguage" ||
    searchParameterDropdownValue === "outputLanguage" ||
    searchParameterDropdownValue === "allLanguages"
  ) {
    const {allLanguages} = await chrome.storage.local.get(["allLanguages"]);
    for (let parameter of allLanguages) {
      let optionElement = document.createElement("option");

      optionElement.innerText = parameter;

      optionElement.value = parameter;

      searchParameterValues.appendChild(optionElement);
    }
  } else if (searchParameterDropdownValue === "projects") {
    let parameterValues = Object.values(Globals.projectsModel);

    if (parameterValues.length === 0) {
      let optionElement = document.createElement("option");

      optionElement.innerText = "No data available";

      optionElement.value = "none";

      searchParameterValues.appendChild(optionElement);
    } else {
      for (let parameter of parameterValues) {
        let optionElement = document.createElement("option");

        optionElement.innerText = parameter.name;

        optionElement.value = JSON.stringify(parameter);

        searchParameterValues.appendChild(optionElement);
      }
    }
  }
});

//Search wrapper buttons logic
searchSearchButton.addEventListener("click", () => {
  let searchTerms = {
    searchParameter: searchParameterValues.value, // Possibly stringified tag or project  object
    searchType: searchParameterDropdown.value, // Data type
    tags: getTags("#search-tags-selected-list"),
  };


  // Searches can be done in frontend
  const results = searchLogic(searchTerms);

  // Set current search results

  //Set table
  setTable(results);

  //reset search parameters
  let listOfTags = document.querySelectorAll(`#search-tags-selected-list > li`);

  for (let listNode of listOfTags) {
    listNode.remove();
  }
});

// Used for export
let globalResults;
//Table
export function setTable(results) {
  resultTableBody.innerHTML = "";

  if (!results || results.length === 0) {
    resultTableBody.innerText = "No results found";
    return;
  }
  
  let resultTally = 0;

  globalResults = results;

  //Populate table with rows
  for (let entry of results) {
    ++resultTally;

    let tableRow = document.createElement("tr");

    tableRow.classList.add("result-table-content-row");

    let targetWord = document.createElement("td");
    targetWord.classList.add("table-cell");
    targetWord.classList.add("result-table-content-tword");
    targetWord.setAttribute("value", `${entry.id}`);
    targetWord.setAttribute("id", `${entry.id}`);
    targetWord.innerText = `${entry.target_word}\n(${entry.target_language})`;
    targetWord.contentEditable = false;

    let outputWord = document.createElement("td");
    outputWord.classList.add("table-cell");
    outputWord.classList.add("result-table-content-oword");
    outputWord.innerText = `${entry.output_word}\n(${entry.output_language})`;
    outputWord.contentEditable = false;

    let project = document.createElement("td");
    project.classList.add("table-cell");
    project.classList.add("result-table-content-project");
    project.innerText = entry.projectName;

    let url = document.createElement("td");
    url.classList.add("table-cell");
    url.classList.add("result-table-content-url");
    url.innerText = entry.url;

    let tags = document.createElement("td");
    tags.classList.add("table-cell");
    tags.classList.add("result-table-content-tags");

    let tagsText = ""
    

    entry.tags.forEach(tag=>tagsText += `${tag.name}, `)
    tags.innerText = tagsText;

    //Create delete button
    let deleteWrapper = document.createElement("td");
    deleteWrapper.classList.add("table-cell");
    deleteWrapper.classList.add("result-table-content-delete");
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("vocab-button");
    deleteButton.innerText = "Delete";
    deleteButton.style.fontSize = "8px";
    deleteButton.setAttribute("id", `result-view-delete-button-${resultTally}`);

    deleteWrapper.appendChild(deleteButton);

    tableRow.appendChild(targetWord);
    tableRow.appendChild(outputWord);
    tableRow.appendChild(project);
    tableRow.appendChild(url);
    tableRow.appendChild(tags);
    tableRow.appendChild(deleteWrapper);

    resultTableBody.appendChild(tableRow);

    let deleteButtonListener = document.getElementById(
      `result-view-delete-button-${resultTally}`
    );

    deleteButtonListener.addEventListener("click", async () => {
      const deleteOptions = {
        id: "",
        projectId: "",
      };
      deleteOptions.id = entry.id;
      deleteOptions.projectId = entry.projectId;

      const sendDeleteMessage = new MessageTemplate(
        "delete-entry",
        deleteOptions
      );
      const elementToDelete = document.getElementById(`${entry.id}`);

      // Attempt to delete entry in backend first
      try {
        const result = await chrome.runtime.sendMessage(sendDeleteMessage);
        if (!result) return;

        // Delete entry in current rpoejct and all projects
        Object.values(Globals.projectsModel).forEach((project) => {
          const projectEntries = project.entries;

          Object.values(projectEntries).forEach((projectEntry) => {
            if (projectEntry.id === entry.id) delete projectEntries[entry.id];
          });
          project.entries = projectEntries;
        });

        elementToDelete.parentNode.remove();
      } catch (e) {
        return;
      }
    });
  }
}

//Search and clear buttons
resultClear.addEventListener("click", async () => {
  let listOfTags = document.querySelectorAll(`#result-tags-selected-list > li`);

  for (let listNode of listOfTags) {
    listNode.remove();
  }

  //reset results table
  resultTableBody.innerHTML = "";
});

//Export button
resultExport.addEventListener("click", () => {
  let blob;
  console.log(globalResults)
  // Create a Blob from the JSON data
  blob = new Blob([JSON.stringify(globalResults, null, 2)], {
    type: "application/json",
  });

  if (!blob) return;

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const date = new Date();
  const link = document.createElement("a");
  link.href = url;
  link.download = `vocabextension_${date.toDateString()}.json`;

  // Trigger the download
  link.click();

  // Revoke the URL after download
  URL.revokeObjectURL(url);
});
