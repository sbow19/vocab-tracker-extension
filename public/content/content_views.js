class MessageTemplate {
  constructor(message, details) {
    this.message = message;
    this.details = details;
  }
}

let sendNewText = new MessageTemplate("add-new-text", {
  details: {},
});

//Injected Elements
class Views {
  constructor() {}

  //This property sets the value of the shadowDOM
  static shadowDOMHost = null;

  static hasLoaded = false

  static childShadowDOMHost = null;

  /*These properties set the location of views based on the cursor location*/
  static xPos = null;
  static yPos = null;

  //This property sets the main view onto the super class
  static currentView = "none";

  static changeView(newView) {
    //if the newView is set to none, because of some cancelling event (e.g.double click)
    if (newView === "none") {
      Views.currentView.style.display = "none";
      Views.currentView = "none";

      //If the current view is none, then the newView is added.
    } else if (Views.currentView === "none") {
      newView = Views.viewPosition(newView);

      Views.currentView = newView;

      Views.currentView.style.display = "flex";
    } else {
      Views.currentView.style.display = "none";
      newView = Views.viewPosition(newView);
      Views.currentView = newView;
      Views.currentView.style.display = "flex";
    }
  }

  static setShadowDOMHost(sheet) {
    // Check if element already exists
    const element = document.getElementById("shadow-host-vocab");
    if(element)return


    let host = document.createElement("div");

    host.setAttribute("id", "shadow-host-vocab");

    let body = document.querySelector("body");

    let bodyHeight = `${body.offsetHeight}px`;
    let bodyWidth = `${body.offsetWidth}px`;

    host.style.minHeight = bodyHeight;
    host.style.minWidth = bodyWidth;
    host.style.position = "absolute";
    host.style.top = 0;
    host.style.left = 0;
    host.style.pointerEvents = "none";
    host.style.boxSizing = "border-box";

    document.documentElement.style.setProperty(
      "--view-bg-color",
      "rgba(120, 120, 235, 0.5)"
    );
    document.documentElement.style.setProperty(
      "--placeholder-border",
      "1px solid black"
    );
    document.documentElement.style.setProperty(
      "--custom-font-title",
      "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"
    );

    body.appendChild(host);

    let shadowDOMHost = host.attachShadow({ mode: "open" });

    shadowDOMHost.adoptedStyleSheets = [sheet];

    //Set shadow DOM host extension div

    const translationPopupOuter = document.createElement("div");
    translationPopupOuter.setAttribute("id", "translation-popup-outer");

    shadowDOMHost.appendChild(translationPopupOuter);

    Views.shadowDOMHost = shadowDOMHost;

    //Set shadowDOM Host

    const childShadowDOMHost = shadowDOMHost.getElementById(
      "translation-popup-outer"
    );

    Views.childShadowDOMHost = childShadowDOMHost;
  }

  static appendView(view) {
    if(Views.hasLoaded)return
    view.style.display = "none";
    Views.childShadowDOMHost.appendChild(view);
  }

  static viewPosition(view) {
    view.style.position = "absolute";
    view.style.top = `${Views.yPos}px`;
    view.style.left = `${Views.xPos}px`;

    return view;
  }

  setElements(keyElements) {
    //If user supplies list of elemnents, then this function parses those
    //and assigns to the object those elements by name.

    //Need to add condition checking the length of the keyElements paramter

    if (keyElements) {
      let elements = {};

      let elementEntriesList = Object.entries(keyElements);

      for (let entry of elementEntriesList) {
        let [elementName, elementId] = entry;
        elements[elementName] = elementId;
      }

      return elements;
    } else {
      return;
    }
  }
}

class BubbleView extends Views {
  constructor(baseView, keyElements) {
    super();
    let elements = this.setElements(keyElements);
    this.elements = elements;
    this.view = baseView;
  }
}

class TranslationView extends Views {
  constructor(baseView, keyElements) {
    super();
    let elements = this.setElements(keyElements);
    this.elements = elements;
    this.view = baseView;
  }
}

//Popup bubble object
const popupBubbleView = document.createElement("div");

popupBubbleView.innerHTML = `
<section class="popup-bubble-wrapper">
    <div class="popup-bubble-icon-container" title="Translate" >
        <img class="popup-icon" id="popup-bubble">
    </div>
</section>`;

const popupBubbleObject = new BubbleView(popupBubbleView, {
  mainButton: "popup-bubble",
});

//Main translation popup object
const translationPopupInner = document.createElement("div");

translationPopupInner.id = "translation-popup";
translationPopupInner.draggable = true;

translationPopupInner.innerHTML = `
<div class="extension-wrapper" id="extension-wrapper">

    <main class="content-wrapper" id="content-wrapper">


        <!--Translation popup view-->

        <section class="translation-view-wrapper"
                    id="translation-view">

                    <div class="translation-input-output-wrapper">

                        <div class="translation-view-title-wrapper">
                            <span class="translation-view-title">Translate!</span>
                        </div>

                        <div class="translation-input-output-wrapper-inner">
                            <div class="translation-input-text-wrapper">
                                <strong>Select target language</strong>
                                <select name="target-language" id="translation-target-language">
                                    <!---->
                                 </select>
                                <textarea name="" id="translation-input-text" cols="25" rows="2" maxlength="50" placeholder="Input"></textarea>
                            </div>
                            <div class="translation-output-text-wrapper">
                                <strong>Select output language</strong>
                                <select name="output-language" id="translation-output-language">
                                    <!---->
                                </select>
                                <textarea name="" id="translation-output-text" cols="25" rows="2" placeholder="Output"></textarea>
                            </div>
                        </div>
                    </div>


                    <div class="translation-parameters-wrapper">
                        <ul class="translation-parameters-list">
                        
                            <li class="translation-parameter-project-wrapper">
                                <div class="translation-parameter-project-title-wrapper">
                                    <span class="translation-parameter-project-title">Select Project</span>
                                </div>
                                <div class="translation-parameter-project-set-wrapper">
                                    <select name="" id="translation-parameter-project-set">
                                        <option value="default">Default</option>
                                        <option value="project 1">Project 1</option>
                                        <option value="project 2">Project 2</option>
                                    </select>
                                </div>
                            </li>


                            <li class="translation-parameter-tags-wrapper">
                                <div class="translation-tagset-title-dropdown-wrapper">
                                    <div class="translation-tagset-title-wrapper">
                                        <span class="translation-tagset-title">
                                            Select Tags
                                        </span>
                                    </div>
                                    <div class="translation-tagset-dropdown-wrapper">
                                        <select class="vocab-select" id="translation-tag-select" name="translation">
                                            <!--Tags inserted here-->
                                        </select>
                                    </div>
                                    <div class="translation-tagset-add-wrapper">
                                        <button class="vocab-button" id="translation-add-tag">
                                            Add
                                        </button>
                                    </div>
                                </div> 
        
                                <div class="translation-tagset-selected-wrapper">
                                    <div class="vocab-tags-selected-background">
                                        <ul class="vocab-tags-selected-list" id="translation-tags-selected-list">
        
                                            <!-- These list items will be appended on click-->
                                            
                                        </ul>
                                    </div>
                                </div>

                            </li>


                            <li class="translation-parameter-save-wrapper">
                                <button class="vocab-button translation-parameter-save-button" id="translation-save">Save</button>
                            </li>
                        </ul>

                    </div>


            </section>
    </main>
</div>`;

const translationPopupObject = new TranslationView(translationPopupInner, {
  input: "translation-input-text",
  output: "translation-output-text",
  project: "translation-parameter-project-set",
  saveButton: "translation-save",
  tags: "translation-tags-selected-list",
});

//Resources Search
async function resourceSearch() {
  let popUpBubbleImage = Views.shadowDOMHost.getElementById(
    popupBubbleObject["elements"]["mainButton"]
  );

  popUpBubbleImage.src = await chrome.runtime.getURL(
    "assets/translation-icon.png"
  );
}

function nodeConvert(nodeList) {
  let newArray = Array.from(nodeList);
  return newArray.map((node) => {
    if (node.value === "default") return "default";
    return JSON.parse(node.value);
  });
}

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

//Listener for selected text
let globals = {};
let languages;

let hasLoaded = false

//The views need to be added before listeners can be added
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.load === "load content" && !Views.hasLoaded && !hasLoaded) {

    hasLoaded = true
    // Set content
    globals = request.data;

    //General reset for tags
    function appendTags(rawTags) {
      let tags;
      if (isJsonString(rawTags)) {
        tags = JSON.parse(rawTags);
      } else {
        tags = rawTags;
      }

      translationPopUpSelectedTags.innerHTML = "";

      if (tags.length > 0) {
        for (let tag of tags) {
          let newTag = document.createElement("li");

          //Create tag class
          newTag.classList.add("vocab-tag-outer");

          newTag.id = `translation-${tag.name}-tag`;

          newTag.innerHTML = `
                    
                    <div class="vocab-tag-inner" value='${JSON.stringify(tag)}'>
                        <span>${tag.name}</span>
                    </div>
                    <div class="vocab-tag-delete" id="translation-${
                      tag.name
                    }-delete">
                        <button> delete </button>
                    </div>
                    `;

          //Append new tag
          translationPopUpSelectedTags.appendChild(newTag);

          let deleteTag = Views.shadowDOMHost.getElementById(
            `translation-${tag.name}-delete`
          );

          deleteTag.addEventListener("click", () => {
            //Removes list element on click

            deleteTag.parentNode.remove();
          });
        }
      }
    }

    function appendAllProjectDropDown(projectList) {
      translationPopUpProject.innerHTML =
        "<option value='default'>default</option>";
      //creating new option element for project
      for (let project of Object.values(projectList)) {
        let newProjectNameElement = document.createElement("option");

        newProjectNameElement.setAttribute("value", JSON.stringify(project));

        newProjectNameElement.innerText = project.name;

        translationPopUpProject.appendChild(newProjectNameElement);
      }
    }

    function appendAllTagsDropDown(allTagsList) {
      //Check whether there are any tags in storage
      if (allTagsList.length === 0) {
        translationPopUpTagsList.innerHTML =
          "<option value=`default`>No Tags Created</option>";
      } else {
        translationPopUpTagsList.innerHTML = "";

        // Generic dropdowns
        //Check whether there are any tags in storage
        if (allTagsList.length === 0) {
          translationPopUpTagsList.innerHTML =
            "<option value=`default`>No Tags Created</option>";
        } else {
          translationPopUpTagsList.innerHTML = "";

          for (let t of allTagsList) {
            let newTag = document.createElement("option");

            newTag.innerText = t.name;

            newTag.setAttribute("value", JSON.stringify(t));

            //Append new tag
            translationPopUpTagsList.appendChild(newTag);
          }
        }
      }
    }

    function appendAllLanguagesDropDown(allLanguagesList) {
      //Check whether there are any tags in storage
      if (allLanguagesList.length === 0) {
        translationPopUpTargetLanguage.innerHTML =
          "<option value=`default`>No Languages Set</option>";
        translationPopUpOutputLanguage.innerHTML =
          "<option value=`default`>No Languages Set</option>";
      } else {
        translationPopUpTargetLanguage.innerHTML = "";
        translationPopUpOutputLanguage.innerHTML = "";

        for (let t of allLanguagesList) {
          let newTag1 = document.createElement("option");
          let newTag2 = document.createElement("option");

          newTag1.innerText = t;

          newTag1.value = t;

          newTag2.innerText = t;

          newTag2.value = t;

          //Append new tag
          translationPopUpTargetLanguage.appendChild(newTag1);
          translationPopUpOutputLanguage.appendChild(newTag2);
        }

        try {
          const { default_target_language, default_output_language } =
            globals.currentProject;
          let indexSetTarget = languages.indexOf(default_target_language);
          let indexSetOutput = languages.indexOf(default_output_language);

          translationPopUpTargetLanguage.selectedIndex = indexSetTarget;
          translationPopUpOutputLanguage.selectedIndex = indexSetOutput;
        } catch (e) {
          console.log(e);
        }
      }
    }

    function setProjectDropDown() {
      // Change project index for dropdowns
      const projectNodeArray =
        translationPopUpProject.querySelectorAll("option");

      const projectArray = nodeConvert(projectNodeArray);

      let indexToSet;
      projectArray.find((project, index) => {
        if (project === "default") return false;
        if (project.id === globals.currentProject.id) {
          indexToSet = index;
          return true;
        }
      });

      translationPopUpProject.selectedIndex = indexToSet;
    }

    function addTag() {
      //If another element has the tag, then another tag will not be appeneded
      const translationPopUpTagsListValue = JSON.parse(
        translationPopUpTagsList.value
      );

      if (
        Views.shadowDOMHost.getElementById(
          `translation-${translationPopUpTagsListValue.name}-tag`
        )
      )
        return;

      let newTag = document.createElement("li");
      //Create tag class
      newTag.classList.add("vocab-tag-outer");

      newTag.id = `translation-${translationPopUpTagsListValue.name}-tag`;

      newTag.innerHTML = `  
          <div class="vocab-tag-inner" value='${translationPopUpTagsList.value}'>
              <span>${translationPopUpTagsListValue.name}</span>
          </div>
          <div class="vocab-tag-delete" id="translation-${translationPopUpTagsListValue.name}-delete" >
              <button> delete </button>
          </div>
          `;

      //Append new tag
      translationPopUpSelectedTags.appendChild(newTag);

      let deleteTag = Views.shadowDOMHost.getElementById(
        `translation-${translationPopUpTagsListValue.name}-delete`
      );

      deleteTag.addEventListener("click", (e) => {
        //Moves list element on click
        deleteTag.parentNode.remove();
      });
    }

    function getTags(querySelector) {
      //This function will be used for other parts of the UI

      let tagsNodeList = Views.shadowDOMHost.querySelectorAll(
        `${querySelector} > li .vocab-tag-inner`
      );

      let tagsList = [];

      for (let tag of tagsNodeList) {
        const tagValue = tag.getAttribute("value");

        if (isJsonString(tagValue)) {
          const parsedTagData = JSON.parse(tagValue);
          tagsList.push(parsedTagData);
        } else {
          tagsList.push(tagValue);
        }
      }

      return tagsList;
    }

    //Setting Shadow DOM host on load
    Views.setShadowDOMHost(sheet);

    //When the DOM has loaded, the views are appeneded to the current page
    Views.appendView(popupBubbleObject.view);
    Views.appendView(translationPopupObject.view);

    //Load content from web available resources (PNGs etc)
    resourceSearch();

    ////Translation popup elements
    let translationPopupInput = Views.shadowDOMHost.getElementById(
      translationPopupObject["elements"]["input"]
    );
    let translationPopupOutput = Views.shadowDOMHost.getElementById(
      translationPopupObject["elements"]["output"]
    );
    let translationPopupSave = Views.shadowDOMHost.getElementById(
      translationPopupObject["elements"]["saveButton"]
    );
    let translationPopUpTargetLanguage = Views.shadowDOMHost.getElementById(
      "translation-target-language"
    );
    let translationPopUpOutputLanguage = Views.shadowDOMHost.getElementById(
      "translation-output-language"
    );
    let translationPopUpProject = Views.shadowDOMHost.getElementById(
      translationPopupObject["elements"]["project"]
    );
    let translationPopUpSelectedTags = Views.shadowDOMHost.getElementById(
      translationPopupObject["elements"]["tags"]
    );
    let translationPopUpTagsList = Views.shadowDOMHost.getElementById(
      "translation-tag-select"
    );
    let translationAddTagList = Views.shadowDOMHost.getElementById(
      "translation-add-tag"
    );

    //Append all projects in local storage
    appendAllProjectDropDown(globals.projects);

    // Set the current project in dropdown
    setProjectDropDown();

    //Append all tags in local storage
    appendAllTagsDropDown(globals.tags);

    //Append all languages in local storage
    const { allLanguages } = await chrome.storage.local.get(["allLanguages"]);
    languages = allLanguages;
    appendAllLanguagesDropDown(allLanguages);

    //Try getting current project details
    appendTags(globals.currentProject.tags);

    //Main event listeners on pop up views

    //View display logic
    document.addEventListener("mousemove", (event) => {
      //Dynamically update the view popup location to the mouse cursor position
      Views.xPos = event.clientX + document.documentElement.scrollLeft;
      Views.yPos = event.clientY + document.documentElement.scrollTop;
    });

    //Pop up navigation logic
    let translationViewClicked = false;
    let bubbleViewClicked = false;
    let selectionString;

    document.addEventListener("mouseup", () => {
      let selectionObject = window.getSelection();
      selectionString = selectionObject.toString();
      selectionString = selectionString.trim();

      if (
        selectionString.length > 0 &&
        bubbleViewClicked == false &&
        translationViewClicked == false
      ) {
        //If there is a selection and bubble view has not been activated yet, it will display.
        Views.changeView(popupBubbleObject.view);
        bubbleViewClicked = true;
      } else if (bubbleViewClicked == true && selectionString.length === 0) {
        //If bubble view is active, but there is no selection, then the bubble is turned off.

        Views.changeView("none");
        bubbleViewClicked = false;
      } else if (
        translationViewClicked == true &&
        selectionString.length > 0 &&
        bubbleViewClicked == false
      ) {
        //if translation view is active, but there is a selection, and bubble is inactive, then nothing happens.
        return;
      }
    });

    // Make translation view appear
    Views.shadowDOMHost
      .getElementById(popupBubbleObject["elements"]["mainButton"])
      .addEventListener("click", (e) => {
        e.stopPropagation();

        //If the popup bubble is clicked , then the translation view is set, and the popup bubble reset
        Views.changeView(translationPopupObject.view);

        //Focus on the save button immediately
        translationPopupSave.focus();

        //The string which is to be adpoted by the translation view is set here. SelectionString will reset to 0 on click
        translationPopupInput.value = selectionString.slice(0, 50);

        //These functions start the API call
        resetTimer();
        startTimer();

        translationViewClicked = true;
        bubbleViewClicked = false;
      });

    //Double click resets both views to hidden.
    document.addEventListener("dblclick", () => {
      Views.changeView("none");
      translationViewClicked = false;
      bubbleViewClicked = false;

      //Reset input value of translation input
      translationPopupInput.value = null;
      translationPopupOutput.value = null;
    });

    // Save new translation object
    translationPopupSave.addEventListener("click", async (e) => {
      e.stopPropagation();
      const projectObject = JSON.parse(translationPopUpProject.value);

      const { currentTab } = await chrome.storage.local.get(["currentTab"]);

      let translationObject = {
        target_word: translationPopupInput.value,
        output_word: translationPopupOutput.value,
        target_language: translationPopUpTargetLanguage.value,
        output_language: translationPopUpOutputLanguage.value,
        url: currentTab.url,
        tags: JSON.stringify(getTags("#translation-tags-selected-list")),
        id: crypto.randomUUID(),
        projectId: projectObject.id,
        projectName: projectObject.name,
      };

      const sendNewText = new MessageTemplate(
        "add-new-text",
        translationObject
      );

      try {
        // Need to update entries n
        const response = await chrome.runtime.sendMessage(sendNewText);
        if (!response.success) return;

        translationObject.tags = JSON.parse(translationObject.tags);

        // Update global values
        globals.projects[projectObject.id].entries[translationObject.id] =
          translationObject;

        if (projectObject.id === globals.currentProject.id) {
          globals.currentProject.entries[translationObject.id] =
            translationObject;
        }
      } catch (e) {
        console.log(e);
        return;
      }

      //Popup navigation logic
      Views.changeView("none");
      translationViewClicked = false;
      translationPopupInput.value = "";
      translationPopupOutput.value = "";
    });

    // Add tag to translation add selectred area
    translationAddTagList.addEventListener("click", () => {
      addTag();
    });

    //Make popup draggable
    Views.shadowDOMHost
      .getElementById("translation-popup")
      .addEventListener("dragstart", (ev) => {
        ev.dataTransfer.effectAllowed = "move";

        ev.dataTransfer.setData("text/plain", ev.target.id);
      });

    const dropZone = Views.shadowDOMHost.getElementById(
      "translation-popup-outer"
    );

    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropZone.style.pointerEvents = "auto";
      event.dataTransfer.dropEffect = "move";
    });

    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();

      let draggedElement = Views.shadowDOMHost.getElementById(
        event.dataTransfer.getData("text/plain")
      );

      let xPos = event.clientX + document.documentElement.scrollLeft;
      let yPos = event.clientY + document.documentElement.scrollTop;
      draggedElement.style.top = `${yPos}px`;
      draggedElement.style.left = `${xPos}px`;

      event.target.appendChild(draggedElement);
      dropZone.style.pointerEvents = "none";

      event.dataTransfer.clearData();
    });

    /**
     * New project details from background
     */
    chrome.runtime.onMessage.addListener(async (request) => {
      if (request.message === "set-content") {
        // Set content
        globals = request.data;

        //Append all projects in local storage
        appendAllProjectDropDown(globals.projects);

        // Set the current project in dropdown
        setProjectDropDown();

        //Append all tags in local storage
        appendAllTagsDropDown(globals.tags);

        //Append all languages in local storage
        const { allLanguages } = await chrome.storage.local.get([
          "allLanguages",
        ]);
        languages = allLanguages;
        appendAllLanguagesDropDown(allLanguages);

        //Try getting current project details
        appendTags(globals.currentProject.tags);
      }
    });

    //Setting project within content view
    translationPopUpProject.addEventListener("change", async () => {
      /* IMPLEMENT */
    });

    //Translation logic
    const translateMessage = new MessageTemplate("translate", {
      targetLanguage: "",
      outputLanguage: "",
      targetText: "",
    });

    let timer;


    function startTimer() {
      timer = setTimeout(async () => {
        let translationStringInput = translationPopupInput.value;

        //encode translate language message on click.
        translateMessage.details.targetLanguage =
          translationPopUpTargetLanguage.value;
        translateMessage.details.outputLanguage =
          translationPopUpOutputLanguage.value;
        translateMessage.details.targetText = translationStringInput;

        //Send message to initiate translation
        try {
          const result = await chrome.runtime.sendMessage(translateMessage);
          if (!result.success) {
            translationPopupOutput.value = "Oops... something went wrong";
          }
          translationPopupOutput.value = result.text;
        } catch (e) {
          console.log("Error translating");
        }
      }, 500);
    }

    function resetTimer() {
      clearTimeout(timer);
    }

    translationPopupInput.addEventListener("input", (e) => {
      e.stopPropagation();

      resetTimer();
      startTimer();
    });

    //Trigger translation when changing languages
    translationPopUpTargetLanguage.addEventListener("change", (e) => {
      e.stopPropagation();

      resetTimer();
      startTimer();
    });

    translationPopUpOutputLanguage.addEventListener("change", (e) => {
      e.stopPropagation();

      resetTimer();
      startTimer();
    });

    //reset shadow DOM size when resized;
    window.addEventListener("resize", () => {
      let host = document.getElementById("shadow-host");

      let body = document.querySelector("body");

      let bodyHeight = `${body.offsetHeight}px`;
      let bodyWidth = `${body.offsetWidth}px`;

      host.style.minHeight = bodyHeight;
      host.style.minWidth = bodyWidth;
    });

    // Set has loaded on global view
    Views.hasLoaded = true
  }
});

//Styling for

//CSS  Styles for Shadow DOM
const sheet = new CSSStyleSheet();

sheet.replace(`
/*Common variables*/

:root{ 
    --view-bg-color: rgba(120, 120, 235, 0.5);
    --secondary-bg-color: rgba(0, 255, 255, 0.432);
    --extension-height: 350px;
    --extension-width: 400px;
    --placeholder-border: none;
    --custom-font-title: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

/*General styles*/

.vocab-button{
    background-color: rgba(32, 21, 3, 0.767);
    color:rgb(228, 233, 236);
    border-radius: 10%;
    box-shadow: 0 0 2px rgba(32, 21, 3, 0.555);
}

.vocab-button:hover{
    background-color: rgba(32, 21, 3, 0.692);
}

.vocab-title{
    font-family: var(--custom-font-title);
}

* {
  font-family: var(--custom-font-title)
}

.vocab-tags-selected-list{
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 9px;
    display:flex;
    flex-direction: column;
}

.vocab-select{
    width: 80px;
    overflow: ellipsis;
}


/*Scrollbar styling*/

::-webkit-scrollbar{
    width:10px;
}

::-webkit-scrollbar-thumb{
    background-color: rgba(32, 21, 3, 0.767);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover{
    background-color: rgba(32, 21, 3, 0.959)
}

/*extension wrapper styling*/

#translation-popup-outer{
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    top: 0px;
    left: 0px;
    position: absolute;
    pointer-events: none;
}

.extension-wrapper{
    color: initial;
    color-scheme: normal;
    font-family:initial;
    line-height: initial;
    min-height: 200px;
    max-height:200px;
    min-width: 400px;
    max-width:400px;
    border: solid 2px;
    padding: 2px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    background-color: white;

    justify-content: space-between;
    box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.733);
    pointer-events: auto

}

#content-wrapper {
  border-radius: 10px;
  overflow: hidden
}

/*Translation pop up styling*/

.translation-view-wrapper{
    margin:0;
    background-color: var(--view-bg-color);

    min-height: 200px;
    max-height:200px;
    min-width: 400px;
    max-width:400px;
    overflow:hidden;
    display: flex;
    justify-content: space-between;
}

.translation-view-title-wrapper{
    display:flex;
    height:15%;
    width: 100%;
    background-color: rgba(0, 255, 255, 0.432);
    justify-content: center;
    align-items: center;
    font-weight: 600
    
}

.translation-input-output-wrapper{
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 235px;
    max-width: 235px;

}

.translation-input-output-wrapper-inner{
    border: 1px solid black;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px black;
    overflow: hidden;
    display:flex;
    flex-direction: column;
    justify-content: space-evenly;
    height:80%;
    margin-top: 5px;
    margin-right: 3px;
}

.translation-input-output-wrapper textarea{
    resize: none;
}

.translation-popup-main-view-button-wrapper{
    border: var(--placeholder-border);
    height:10%;
    display:flex;
    justify-content: left;
}

.translation-input-text-wrapper {
  padding: 0 5px
}

.translation-output-text-wrapper {
  padding: 0 5px
}

strong {
  font-size: 12px
}

.translation-parameters-wrapper{
    display: flex;
    min-width: 150px;
    max-width: 150px;
    border: 1px solid black;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px black;
    overflow: hidden
    
}

.translation-parameters-list{
    display:flex;
    flex-direction: column;
    margin:0;
    width:100%;
    height:100%;
    padding:0;
}

.translation-parameters-list > li{
    margin: 0;
    list-style: none;
}

/*parameters styling*/

.translation-parameter-project-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-weight: 600;
  text-align:center;
  font-size: 12px

}



.translation-parameter-language-wrapper{
    display:flex;
    flex:1;
}

.translation-parameter-language-wrapper > div {
    display:flex;
}

.translation-parameter-language-set-wrapper{
    align-items: center;
}

.translation-parameter-project-wrapper{
    display:flex;
    flex:1;
}

.translation-parameter-project-wrapper > div {
    display:flex;
}

.translation-parameter-project-set-wrapper{
    align-items: center;
}


.translation-parameter-save-wrapper{
    display:flex;
    justify-content: center;
    flex:1;
}

.translation-parameter-save-button{
    flex:1;
    align-self: center;
    max-width:55%;
}
.translation-parameter-tags-wrapper{
    min-height:45%;
    max-height:45%;
    overflow:auto;
}

.translation-tagset-title-dropdown-wrapper{
    display:flex;
    flex-direction: column;
    align-items: center;
}

.translation-tagset-title-wrapper{
    font-size: 12px
}

.translation-tagset-selected-wrapper{
    min-height:100%;
    max-height: 100%
    display:flex;
    flex-direction: column;
    margin:5px;
    background-color: white;
    overflow: auto;
}

.vocab-tags-selected-background{
    max-height:100%;
    overflow: auto;
}

.popup-bubble-wrapper{
    height:30px;
    width:30px;
    border: solid 1px rgba(0, 0, 0, 0.507);
    display:flex;
    border-radius: 21px;
    justify-content: center;
    align-items: center;
    margin:0;
    padding:0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.527);
    pointer-events: auto
}

.popup-bubble-icon-container{
    margin:0;
    padding:0;
    height:24px;
    width:24px;
    border: solid 1px rgba(0, 0, 0, 0.288);
    display:flex;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    z-index: 2;
    background-color: rgb(0, 255, 255);

}

.popup-bubble-icon-container:hover{
    background-color: rgb(0, 225, 255)
}

.popup-bubble-icon-container:active{
    background-color: rgb(0, 174, 255);
}

.popup-icon{
    margin:0;
    padding: 0;
    height:20px;
    width:20px;
    z-index: 3;
}

.vocab-tag-outer{
  margin: 5px;
  font-size: 12px
}

.vocab-tag-delete{
  display: inline-block
}
.vocab-tag-inner{
  display: inline-block
}

`);
