/**
 * Encapsulate languages logic
 */

import * as Helpers from "./helpers.js";
import * as Globals from "./globals.js";

// Elements
import {
  currentProjectTargetLanguageDropdown,
  currentProjectOutputLanguageDropdown,
  addProjectOutputLanguageDropdown,
  addProjectTargetLanguageDropdown,
  translationOutputLanguageDropdown,
  translationTargetLanguageDropdown,
} from "./targets.js";

/**
 * Update all relevant language dropdown when current project updated
 */
export function changeLanguages(targetLanguage, outputLanguage) {
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

    let languageArray = Array.from(languageNodeArray);

    let indexToSet = 0;
    languageArray.forEach((option, index)=>{
      if(option.textContent === targetLanguage) indexToSet = index
    });

    dropdown.selectedIndex = indexToSet;
  }

  for (let dropdown of outputLanguageDropdownList) {
    let languageNodeArray = dropdown.querySelectorAll("option");

    let languageArray = Array.from(languageNodeArray);

    let indexToSet = 0;
    languageArray.forEach((option, index)=>{
      if(option.textContent === outputLanguage) indexToSet = index
    });
    dropdown.selectedIndex = indexToSet;
  }
}

export async function appendAllLanguages(languagesList) {
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

  if (!Globals.currentProject) return;
  if (
    Globals.currentProject.target_language &&
    Globals.currentProject.output_language
  ) {
    changeLanguages(
      Globals.currentProject.target_language,
      Globals.currentProject.output_language
    );
  }
}
