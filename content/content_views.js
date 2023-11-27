//Injected Elements

class Views {

    constructor(){}
    
    /*These properties set the location of views based on the cursor location*/
    static xPos = null;
    static yPos = null;

    //This property sets the main view onto the super class
    static currentView = "none";
    
    static changeView(newView){

            //if the newView is set to none, because of some cancelling event (e.g.double click)
            if (newView === "none"){
                Views.currentView.style.display = "none";
                Views.currentView = "none";


            //If the current view is none, then the newView is added.
            }else if (Views.currentView === "none"){

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


    static appendView(view){
        let body = document.querySelector("body");
        view.style.display = "none"
        body.appendChild(view);
    }

    static viewPosition(view){

        view.style.position = "absolute"
        view.style.top = `${Views.yPos}px`
        view.style.left = `${Views.xPos}px`

        return view;

    }

    setElements(keyElements){

        //If user supplies list of elemnents, then this function parses those
        //and assigns to the object those elements by name.

        //Need to add condition checking the length of the keyElements paramter

        if (keyElements){
            let elements = {}

            let elementEntriesList = Object.entries(keyElements)

            for (let entry of elementEntriesList) {
                let [elementName, elementId] = entry;
                elements[elementName] = elementId;
            }

            return  elements

        } else {
            return
            
        }
    }
}

class BubbleView extends Views {

    constructor (baseView, keyElements) {
        super();
        let elements = this.setElements(keyElements)
        this.elements = elements;
        this.view = baseView;

    };
    
};

class TranslationView extends Views {

    constructor (baseView, keyElements) {
        super();
        let elements = this.setElements(keyElements)
        this.elements = elements;
        this.view = baseView;
    };
}

//Popup bubble object

const popupBubbleView = document.createElement("div");

popupBubbleView.innerHTML = `
<section class="popup-bubble-wrapper">
    <div class="popup-bubble-icon-container" title="Translate" >
        <img class="popup-icon" id="popup-bubble">
    </div>
</section>`
;

const popupBubbleObject = new BubbleView(popupBubbleView, 
    {
        mainButton:"popup-bubble"
    });

//Main translation popup object

const translationPopup = document.createElement("div");

translationPopup.innerHTML = `
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
                            <textarea name="" id="translation-input" cols="50" rows="3" placeholder="Input language"></textarea>
                        </div>
                        <div class="translation-output-text-wrapper">
                            <textarea name="" id="translation-output" cols="50" rows="3" placeholder="Output language"></textarea>
                        </div>
                    </div>

                </div>


                <div class="translation-parameters-wrapper">
                    <ul class="translation-parameters-list">
                        <li class="translation-parameter-language-wrapper">
                            <div class="translation-parameter-language-title-wrapper">
                                <span class="translation-parameter-language-title">Select Language</span>
                            </div>
                            <div class="translation-parameter-language-set-wrapper">
                                <select name="" id="translation-parameter-language-set">
                                    <option value="English">English</option>
    
                                </select>
                            </div>
                        </li>
                        <li class="translation-parameter-project-wrapper">
                            <div class="translation-parameter-project-title-wrapper">
                                <span class="translation-parameter-project-title">Select Project</span>
                            </div>
                            <div class="translation-parameter-project-set-wrapper">
                                <select name="" id="translation-parameter-project-set">
                                    <option value="default">Default</option>
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
                                    <select class="vocab-select" name="" id="translation-tag-select">
                                        <!-- New options based on tags associated with project-->
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

const translationPopupObject = new TranslationView(translationPopup, {
    input: "translation-input",
    output: "translation-output",
    language: "translation-parameter-language-set",
    project: "translation-parameter-project-set",
    saveButton: "translation-save",
    tags: "translation-tags-selected-list"
})

//Resources Search

async function resourceSearch(){

    let popUpBubbleImage = document.getElementById(popupBubbleObject["elements"]["mainButton"]);

    popUpBubbleImage.src = await chrome.runtime.getURL("assets/translation-icon.png");

    console.log(popUpBubbleImage.src)

}

//Listener for selected text

let selectionText;


let loadCount = 0;
//The main htmls need to be added before listeners can be added
chrome.runtime.onMessage.addListener(async (request)=>{

    if (request.load === "load content" && loadCount === 0){

        //Make sure that content script only fired once. 
        loadCount = loadCount + 1;
        console.log(loadCount);

        function appendProject(projectName, defaultSetting){

            let projectNameElement = document.createElement("option");

            projectNameElement.setAttribute("value", projectName);

            projectNameElement.innerText = projectName;

            translationPopUpProject.appendChild(projectNameElement);

            if (defaultSetting == true){
                translationPopUpProject.selectedIndex = 1;
            };
        };

        function appendLanguage(projectLanguage, defaultSetting){

            let projectLanguageElement = document.createElement("option");

            projectLanguageElement.setAttribute("value", projectLanguage);

            projectLanguageElement.innerText = projectLanguage;

            translationPopUpLanguage.appendChild(projectLanguageElement);

            if (defaultSetting == true){
                translationPopUpLanguage.selectedIndex = 1;
            };
        };

        function appendTags(tags){

            if (tags.length > 0){

                for (let tag of tags){
                    let newTag = document.createElement("li");
        
                    //Create tag class
                    newTag.classList.add("vocab-tag-outer");
        
                    newTag.id = `translation-${tag}-tag`
        
                    newTag.innerHTML = `
                    
                    <div class="vocab-tag-inner">
                        <span>${tag}</span>
                    </div>
                    <div class="vocab-tag-delete" id="translation-${tag}-delete">
                        <button> delete </button>
                    </div>
                    `
        
                    //Append new tag
                    translationPopUpTags.appendChild(newTag);
        
                    let deleteTag = document.getElementById(`translation-${tag}-delete`)
        
                    deleteTag.addEventListener("click", ()=>{
        
                        //Removes list element on click
        
                        deleteTag.parentNode.remove()
        
                    });
                };
            };
        };

        function appendAllProjectDropDown(projectList){
    
            //creating new option element for projects
    
            for (project of projectList){
                let newProjectNameElement = document.createElement("option");
    
                newProjectNameElement.setAttribute("value", project);
    
                newProjectNameElement.innerText = project;
    
                translationPopUpProject.appendChild(newProjectNameElement);
            };
        
        };


        //View display logic

        document.addEventListener("mousemove", (event)=>{
            //Dynamically update the view popup location to the mouse cursor position
            Views.xPos = event.clientX + document.documentElement.scrollLeft;
            Views.yPos  = event.clientY + document.documentElement.scrollTop;
        })

        //When the DOM has loaded, the views are appeneded to the current page

        Views.appendView(popupBubbleObject.view);
        Views.appendView(translationPopupObject.view);


        //Load content from web available resources (PNGs etc)
        resourceSearch();


        let selectionString;
        let translationString;

        let translationViewClicked = false;
        let bubbleViewClicked = false;

        //Translation popup elements

        let translationPopupInput =  document.getElementById(translationPopupObject["elements"]["input"]);
        let translationPopupOutput = document.getElementById(translationPopupObject["elements"]["output"]);
        let translationPopupSave = document.getElementById(translationPopupObject["elements"]["saveButton"]);
        let translationPopUpLanguage = document.getElementById(translationPopupObject["elements"]["language"]);
        let translationPopUpProject = document.getElementById(translationPopupObject["elements"]["project"]);
        let translationPopUpTags = document.getElementById(translationPopupObject["elements"]["tags"])
        

        document.addEventListener("mouseup", ()=>{

            let selectionObject = window.getSelection();
            selectionString = selectionObject.toString();
            selectionString = selectionString.trim()

            
            if (selectionString.length > 0 && bubbleViewClicked == false && translationViewClicked == false){

                //If there is a selection and bubble view has not been activated yet, it will display.

                Views.changeView(popupBubbleObject.view);
                bubbleViewClicked = true;

                
            } else if (bubbleViewClicked == true && selectionString.length === 0) {

                //If bubble view is active, but there is no selection, then the bubble is turned off.

                Views.changeView("none");
                bubbleViewClicked = false;
        

            } else if (translationViewClicked == true && selectionString.length > 0 && bubbleViewClicked == false){

                //if translation view is active, but there is a selection, and bubble is inactive, then nothing happens.
                return
            }
        });

        
        document.getElementById(popupBubbleObject["elements"]["mainButton"]).addEventListener("click", ()=>{

            //If the popup bubble is clicked , then the translation view is set, and the popup bubble reset
            Views.changeView(translationPopupObject.view);

            //Focus on the save button immediately
            translationPopupSave.focus()


            //The string which is to be adpoted by the translation view is set here. SelectionString will reset to 0 on click
            translationString = selectionString;
            translationPopupInput.value = translationString;

            translationViewClicked = true;
            bubbleViewClicked = false;

        })

        //Double click resets both views to hidden.

        document.addEventListener("dblclick", ()=>{
            Views.changeView("none");
            translationViewClicked = false;
            bubbleViewClicked = false;

            //Reset input value of translation input
            translationPopupInput.value = null;
            translationPopupOutput.value = null;
        })
        

        //Translation popup logic

        translationPopupInput.addEventListener("input", ()=>{
            console.log(translationPopupInput.value)

            /*add API translation code
            Add added text to cache which has a timer on how long since the last input
            if the input is longer than 2 seconds, then the API call is made. This helps prevent issues 
            with rate limiting.*/

            translationPopupOutput.value = translationPopupInput.value

        })
        
        translationPopupSave.addEventListener("click", ()=>{
            Views.changeView("none");
            translationViewClicked = false;

            translationPopupInput.value = null;
            translationPopupOutput.value = null;
        
            /*
            Execute database code
            */
        });

        //Get details of current project and set the popup defaults
        let currentProject = await chrome.storage.local.get(["currentProject"]);

        currentProject = currentProject["currentProject"];

        let [currentProjectName] = Object.keys(currentProject);

        let currentProjectDetails = currentProject[currentProjectName];

        appendProject(currentProjectName, true);

        appendLanguage(currentProjectDetails["language"], true);

        appendTags(currentProjectDetails["tags"]);

        //Gets all other content details saved in local- storage.

        let allProjectDetailsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

        //Append all projects in local storage
        appendAllProjectDropDown(allProjectDetails["allProjects"]);

    };
});

chrome.runtime.onMessage.addListener((request)=>{
   
    if (request.message === "set-project-details"){

        function setProject(projectName, projectOptionsList){

            let index = 0;

            for (project of projectOptionsList){
                
                if (project.innerText === projectName){
                    translationPopUpProject.selectedIndex = index;
                    return
                };

                index = index + 1
            };

        };

        function setLanguage(projectLanguage, languageOptionsList) {
            let index = 0;

            for (language of languageOptionsList){

                if (language.innerText === projectLanguage){
                    translationPopUpLanguage.selectedIndex = index;
                    return
                };

                index = index + 1;
            }
        }

        let translationPopUpLanguage = document.getElementById(translationPopupObject["elements"]["language"]);
        let translationPopUpProject = document.getElementById(translationPopupObject["elements"]["project"]);

        let projectOptionsList = translationPopUpProject.querySelectorAll("option");
        let languageOptionsList = translationPopUpLanguage.querySelectorAll("option");

        let projectName = Object.keys(request.details.projectDetails);
        projectName = projectName[0];

        setProject(projectName, projectOptionsList);

        setLanguage(request.details.projectDetails[projectName]["language"], languageOptionsList);

    };
});

chrome.runtime.onMessage.addListener( (request)=>{

    if(request.message === "add-new-project-details"){

        function appendProject(projectName, defaultSetting){

            let projectNameElement = document.createElement("option");

            projectNameElement.setAttribute("value", projectName);

            projectNameElement.innerText = projectName;

            translationPopUpProject.appendChild(projectNameElement);

            if (defaultSetting == true){
                translationPopUpProject.selectedIndex = 1;
            };
        };

        function appendLanguage(projectLanguage, defaultSetting){

            let projectLanguageElement = document.createElement("option");

            projectLanguageElement.setAttribute("value", projectLanguage);

            projectLanguageElement.innerText = projectLanguage;

            translationPopUpLanguage.appendChild(projectLanguageElement);

            if (defaultSetting == true){
                translationPopUpLanguage.selectedIndex = 1;
            };
        };

        let translationPopUpLanguage = document.getElementById(translationPopupObject["elements"]["language"]);
        let translationPopUpProject = document.getElementById(translationPopupObject["elements"]["project"]);

        let projectName = Object.keys(request.details.projectDetails);
        projectName = projectName[0];
        appendProject(projectName,false);

        let projectLanguage = request.details.projectDetails[projectName]["language"];
        appendLanguage(projectLanguage, false)
        
    };
});
