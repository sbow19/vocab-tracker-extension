/**
 * Encapsulate tags logic
 */

import {
  currentProjectTagsDropdown,
  currentProjectAddTagButton,
  currentProjectTagSelection,
  addProjectTagsDropdown,
  addProjectAddTagButton,
  addProjectTagSelection,
  searchTagsDropdown,
  translationTagsDropdown,
  translationTagSelection,
  allTagsList,
  createNewTagInput,
  createNewTagButton,
} from "./targets.js";

import * as Globals from "./globals.js";

import { MessageTemplate } from "./messages.js";

// Delete tags
export async function deleteTagFromProjects(e, tag) {
  const updateCurrentProjectTag = new MessageTemplate(
    "update-current-project",
    {}
  );

  function filterTag(filteredTag) {
    if (filteredTag.id === tag.id) return false;
    return true;
  }
  // Remove tag from currentProject
  const filteredTags = Globals.currentProject.tags.filter(filterTag);

  //Removes tag from current project and updates the projectsModel as well
  try {
    updateCurrentProjectTag.details = {
      ...Globals.currentProject,
      tags: JSON.stringify(filteredTags),
      entries: JSON.stringify(Globals.currentProject.entries),
    };

    const result = await chrome.runtime.sendMessage(updateCurrentProjectTag);
    if (!result.success) return;

    // Filter from  current project tags
    Globals.currentProject.tags = filteredTags;
    // Filter from schema Model
    Globals.projectsModel[Globals.currentProject.id].tags = filteredTags;

    //Removes list element on click
    e.target.parentNode.remove();

    setProjectTags(filteredTags);
  } catch (e) {
    console.log(e);
    return;
  }
}

export async function deleteTagFromEverywhere(e, tag) {
  const removeTagMessage = new MessageTemplate("delete-tag", tag.id);

  function filterTag(filteredTag) {
    if (filteredTag.id === tag.id) return false;
    return true;
  }
  //Removes tag from current project and updates the projectsModel as well
  try {
    const result = await chrome.runtime.sendMessage(removeTagMessage);
    if (!result.success) return;


    // Filter from  current project tags
    if(Globals.currentProject){
      const filteredTags = Globals.currentProject.tags.filter(filterTag);

      Globals.currentProject.tags = filteredTags;
    }
    // Filter from schema Model
    Object.values(Globals.projectsModel).forEach((entry)=>{
      // Remove tag from all project models
      entry.tags = entry.tags.filter((oldTag)=>{
        if(oldTag.id === tag.id) return false
        return true
      })
      Globals.projectsModel[entry.id].tags = entry.tags
    })

    const filteredTags = Globals.tagsArray.filter(filterTag)

    for (let i = 0; i < Globals.tagsArray.length; i++) {
      Globals.tagsArray.pop();
    }
    for (let newTag of filteredTags) {
      Globals.tagsArray.push(newTag);
    }

    //Removes list element on click
    e.target.parentNode.remove();

    // Called when tag deleted from everywhere
    updateTags(Globals.tagsArray);

    // Update tags selection in selection areas
    setProjectTags(Globals.currentProject.tags);
  } catch (e) {
    console.log(e);
    return;
  }
}

//Set current project tags in tags selection areas
export function setProjectTags(tags) {
  currentProjectTagSelection.innerHTML = "";
  translationTagSelection.innerHTML = "";

  // Areas to populate tags
  let tagsSelectionList = [currentProjectTagSelection, translationTagSelection];

  if (tags.length > 0) {
    for (let tagSelection of tagsSelectionList) {
      //Id of tag selection area
      let tagSelectionValue =
        "current-project-tags-selected-list" === tagSelection.id
          ? "current-project"
          : "translation";

      // Tags must be an array of stringified tag objects
      for (let tag of tags) {
        // Tag is already a JS object, needs to be stringified
        let newTag = document.createElement("li");

        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `${tagSelectionValue}-${tag.name}-tag`;

        newTag.innerHTML = ` 
          <div class="vocab-tag-inner" value='${JSON.stringify(tag)}'>
              <span>${tag.name}</span>
          </div>
          <div class="vocab-tag-delete" id="${tagSelectionValue}-${
          tag.name
        }-delete">
              <button> delete </button>
          </div>
          `;

        //Append new tag
        tagSelection.appendChild(newTag);

        let deleteTag = document.getElementById(
          `${tagSelectionValue}-${tag.name}-delete`
        );

        if (tagSelection.id === "translation-tags-selected-list") {
          // Removing translation tags does not remove anything in DB
          deleteTag.addEventListener("click", () => {
            //Removes list element on click. Do not remove from DB
            deleteTag.parentNode.remove();
          });
        } else {
          // If removing from current project tag area, then remove from db
          deleteTag.addEventListener("click", (e) => {
            deleteTagFromProjects(e, { ...tag });
          });
        }
      }
    }
  } else {
    currentProjectTagSelection.innerHTML = "";
    translationTagSelection.innerHTML = "";
  }
}

/**
 * Update tags list after adding or removing tag
 */
export function updateTags(tagsList) {
  let tagDropDowns = [
    searchTagsDropdown,
    addProjectTagsDropdown,
    translationTagsDropdown,
    currentProjectTagsDropdown,
  ];

  // Generic dropdowns
  for (let dropdown of tagDropDowns) {
    //Check whether there are any tags in storage
    if (tagsList.length === 0) {
      dropdown.innerHTML = "<option value=`default`>No Tags Created</option>";
    } else {
      dropdown.innerHTML = "";

      for (let t of tagsList) {
        let newTag = document.createElement("option");

        newTag.innerText = t.name;

        newTag.setAttribute("value", JSON.stringify(t));

        //Append new tag
        dropdown.appendChild(newTag);
      }
    }
  }

  // Set list of tags in create ags view
  allTagsList.innerHTML = "";

  for (const parsedTag of tagsList) {
    const newElement = document.createElement("li");

    //Create tag class
    newElement.classList.add("vocab-tag-outer");

    newElement.id = `add-tag-${parsedTag.name}-tag`;

    newElement.innerHTML = `
        
        <div class="vocab-tag-inner" value='${JSON.stringify(parsedTag)}'>
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
    tag.addEventListener("click", (e) => {
      deleteTagFromEverywhere(e, { ...parsedTag });
    });
  }
}

// Add tags in create project view
addProjectAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appeneded
  const addProjectTagValue = JSON.parse(addProjectTagsDropdown.value);

  if (document.getElementById(`add-project-${addProjectTagValue.name}-tag`))
    return;

  let newTag = document.createElement("li");
  //Create tag class
  newTag.classList.add("vocab-tag-outer");

  newTag.id = `add-project-${addProjectTagValue.name}-tag`;

  newTag.innerHTML = `  
      <div class="vocab-tag-inner" value='${addProjectTagsDropdown.value}'>
          <span>${addProjectTagValue.name}</span>
      </div>
      <div class="vocab-tag-delete" id="add-project-${addProjectTagValue.name}-delete" >
          <button> delete </button>
      </div>
      `;

  //Append new tag
  addProjectTagSelection.appendChild(newTag);

  let tag = document.getElementById(
    `add-project-${addProjectTagValue.name}-delete`
  );

  tag.addEventListener("click", (e) => {
    //Moves list element on click
    tag.parentNode.remove();
  });
});

// Add tag to current project. Triggers add events for current and existing projects
currentProjectAddTagButton.addEventListener("click", async () => {
  //If another element has the tag, then another tag will not be appeneded
  const tagData = JSON.parse(currentProjectTagsDropdown.value);

  // Cannot add tags to a default project 
  if(Globals.currentProject.id === "default") return

  // Check if current project already has the tag
  if(Globals.currentProject.tags.some((oldTag)=>{
    if(oldTag.id === tagData.id) return true
  })) {
    return
  }

  // add tag to currentProject
  const addedTags = [...Globals.currentProject.tags, tagData]

  try {
    const newCurrentProject = {
      ...Globals.currentProject,
      tags: JSON.stringify(addedTags),
      entries: JSON.stringify(Globals.currentProject.entries),
    };

    // Add tag to current rpoejct and projects model before adding to DOM
    const updateCurrentProjectTag = new MessageTemplate(
      "update-current-project", newCurrentProject
    );

    const result = await chrome.runtime.sendMessage(updateCurrentProjectTag);
    if (!result) return;

    // Filter from  current project tags
    Globals.currentProject.tags = addedTags;
    // Filter from schema Model
    Globals.projectsModel[Globals.currentProject.id].tags = addedTags;

    // Set tags in relevant palces
    setProjectTags(Globals.currentProject.tags);
  } catch (e) {
    return;
  }
});

//Add tags events
createNewTagButton.addEventListener("click", async () => {
  let newTagInputText = createNewTagInput.value.trim();

  if (newTagInputText.length === 0) return;

  const addTagMessage = new MessageTemplate("add-tag", {});

  const newTag = {
    name: newTagInputText,
    id: crypto.randomUUID(),
  };
  addTagMessage.details = newTag;

  try {
    const response = await chrome.runtime.sendMessage(addTagMessage);

    if (!response.success) return;

    // If successful, add to tags list and update tags drop downs
    Globals.tagsArray.push(newTag);
    updateTags(Globals.tagsArray);
    createNewTagInput.value = "";
  } catch (e) {}
});
