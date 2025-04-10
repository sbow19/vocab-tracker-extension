import { MessageTemplate } from "./messages.js";
import { getTags } from "./helpers.js";
import * as Globals from "./globals.js";
import {Sanitiser} from "./sanitiser.js";

import {
  translationAddTagButton,
  translationSave,
  translationInput,
  translationOutput,
  translationTargetLanguageDropdown,
  translationOutputLanguageDropdown,
  currentProjectTargetLanguageDropdown,
  currentProjectOutputLanguageDropdown,
  translationTagsDropdown,
  translationTagSelection,
  translationProjectsDropdown,
  translateInput,
  translateButton,
} from "./targets.js";


// Add tags to translation area. When save entry is triggered, this area is parsed for tag values
translationAddTagButton.addEventListener("click", () => {
  //If another element has the tag, then another tag will not be appended

  const translationTagValue = JSON.parse(translationTagsDropdown.value);

  if (document.getElementById(`translation-${translationTagValue.name}-tag`))return;

  let newTag = document.createElement("li");

  //Create tag class
  newTag.classList.add("vocab-tag-outer");

  newTag.id = `translation-${translationTagValue.name}-tag`;

  newTag.innerHTML = `
        
        <div class="vocab-tag-inner" value='${translationTagsDropdown.value}'>
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
});

//Save to database button
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
    tags: JSON.stringify(getTags("#translation-tags-selected-list")),
    id: crypto.randomUUID(),
    projectId: projectObject.id,
    projectName: projectObject.name
  };

  const sendNewText = new MessageTemplate("add-new-text", translationResults);

  try {
    // Need to update entries n
    const response = await chrome.runtime.sendMessage(sendNewText);
    if (!response.success) return;

    translationResults.tags = JSON.parse(translationResults.tags)

    // Update global values
    Globals.projectsModel[projectObject.id].entries[translationResults.id] = translationResults;
    if (projectObject.id === Globals.currentProject.id) {
      Globals.currentProject.entries[translationResults.id] = translationResults;
    }

  } catch (e) {
    console.log(e);
    return;
  }

  //reset search parameters
  translationInput.value = "";
  translationOutput.value = "";
});



let timer;
// Start timer for automatic translation of input text
function startTimer() {
  timer = setTimeout(async() => {
    let translationStringInput = translationInput.value;

    let inputStatus = Sanitiser.checkTranslationInput(translationStringInput);

    if (inputStatus == true) {

      const translateMessage = new MessageTemplate("translate", {
        targetLanguage: "",
        outputLanguage: "",
        targetText: "",
      });
      //encode translate language message on click.
      translateMessage.details.targetLanguage =
        translationTargetLanguageDropdown.value;
      translateMessage.details.outputLanguage =
        translationOutputLanguageDropdown.value;
      translateMessage.details.targetText = translationStringInput;

    
      //Send message to initiate translation
      try{

        const result = await chrome.runtime.sendMessage(translateMessage);
        if(!result.success){
          translationOutput.value = "Oops... something went wrong"
        }
      }catch(e){

        console.log("Error translating")

      }      
    } else {
      translationOutput.value =
        "Max character limit reached. Only 50 characters permitted";
    }
  }, 1000);
}
function resetTimer() {
  clearTimeout(timer);
}

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

translationInput.addEventListener("input", (e) => {
  e.stopPropagation();

  resetTimer();
  startTimer();
});

// Button on default view
translateButton.addEventListener("click", async (e) => {
  e.stopPropagation();

  let translationStringInput = translateInput.value;

  translateInput.value = "";
  translationInput.value = translationStringInput;

  let inputStatus = Sanitiser.checkTranslationInput(translationStringInput);

  if (inputStatus == true) {
    //encode translate language message on click.
    const translateMessage = new MessageTemplate("translate", {
      targetLanguage: "",
      outputLanguage: "",
      targetText: "",
    });

    translateMessage.details.targetLanguage =
      currentProjectTargetLanguageDropdown.value;
    translateMessage.details.outputLanguage =
      currentProjectOutputLanguageDropdown.value;
    translateMessage.details.targetText = translationStringInput;

    //Send message to initiate translation

    try {
      const result = await chrome.runtime.sendMessage(translateMessage);
      if(!result.success){
        translationOutput.value = "Oops... something went wrong"
      }
    } catch (e) {
      translationOutput.value = "Unable to complete request";
    }
  } else {
    translationOutput.value =
      "Max character limit reached. Only 50 characters permitted";
  }
});
