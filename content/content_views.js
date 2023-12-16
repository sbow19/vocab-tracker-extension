class MessageTemplate {

    constructor(message, details){

        this.message = message
        this.details = details

    };
    
}

let sendNewText = new MessageTemplate("add-new-text", {
    details: {}
});


//Injected Elements

class Views {

    constructor(){}

    //This property sets the value of the shadowDOM
    static shadowDOMHost = null;
    
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

    static setShadowDOMHost(sheet){

        let host = document.createElement("div");

        host.style.height = "100%";

        host.style.width = "100%";

        document.documentElement.style.setProperty("--view-bg-color", "rgba(120, 120, 235, 1)");
        document.documentElement.style.setProperty("--extension-height", "200px");
        document.documentElement.style.setProperty("--extension-width", "600px");
        document.documentElement.style.setProperty("--placeholder-border", "1px solid black");
        document.documentElement.style.setProperty("--custom-font-title", "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif")


        let body = document.querySelector("body");

        body.appendChild(host);

        let shadowDOMHost = host.attachShadow({mode: "open"});

        shadowDOMHost.adoptedStyleSheets = [sheet]

        Views.shadowDOMHost = shadowDOMHost

    }


    static appendView(view){
        view.style.display = "none"
        Views.shadowDOMHost.appendChild(view);
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
                                <label for="target-language">Select target language</label>
                                <select name="target-language" id="translation-target-language">
                                    <!---->
                                 </select>
                                <textarea name="" id="translation-input-text" cols="50" rows="3" placeholder="Input"></textarea>
                            </div>
                            <div class="translation-output-text-wrapper">
                                <label for="output-language">Select output language</label>
                                <select name="output-language" id="translation-output-language">
                                    <!---->
                                </select>
                                <textarea name="" id="translation-output-text" cols="50" rows="3" placeholder="Output"></textarea>
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

const translationPopupObject = new TranslationView(translationPopup, {
    input: "translation-input-text",
    output: "translation-output-text",
    project: "translation-parameter-project-set",
    saveButton: "translation-save",
    tags: "translation-tags-selected-list"
})

//Resources Search

async function resourceSearch(){

    let popUpBubbleImage = Views.shadowDOMHost.getElementById(popupBubbleObject["elements"]["mainButton"]);

    popUpBubbleImage.src = await chrome.runtime.getURL("assets/translation-icon.png");

    console.log(popUpBubbleImage.src)

}

//Listener for selected text

let selectionText;


let loadCount = 0;
//The views need to be added before listeners can be added
chrome.runtime.onMessage.addListener(async (request)=>{

    if (request.load === "load content"){

        //General reset for tags
        function appendTags(tags){

            translationPopUpSelectedTags.innerHTML = "";

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
                    translationPopUpSelectedTags.appendChild(newTag);
        
                    let deleteTag = Views.shadowDOMHost.getElementById(`translation-${tag}-delete`)
        
                    deleteTag.addEventListener("click", ()=>{
        
                        //Removes list element on click
        
                        deleteTag.parentNode.remove()
        
                    });
                };
            } ;
        };

        function appendAllProjectDropDown(projectList){
    
            translationPopUpProject.innerHTML = "<option value=`default`>All Projects</option>";
            //creating new option element for project
            for (project of projectList){
                let newProjectNameElement = document.createElement("option");
    
                newProjectNameElement.setAttribute("value", project);
    
                newProjectNameElement.innerText = project;
    
                translationPopUpProject.appendChild(newProjectNameElement);
            };
        };

        function appendAllTagsDropDown(allTagsList){

            //Check whether there are any tags in storage
            if(allTagsList.length === 0){
                translationPopUpTagsList.innerHTML = "<option value=`default`>No Tags Created</option>"
                
            }else{

                translationPopUpTagsList.innerHTML = ""

                for(let t of allTagsList){

                    let newTag = document.createElement("option");
                
                    newTag.innerText = t;

                    newTag.value = t;

                
                    //Append new tag
                    translationPopUpTagsList.appendChild(newTag);
                } 
            }    
        }

        async function appendAllLanguagesDropDown(allLanguagesList){

            //Check whether there are any tags in storage
            if(allLanguagesList.length === 0){
                translationPopUpTargetLanguage.innerHTML = "<option value=`default`>No Languages Set</option>"
                translationPopUpOutputLanguage.innerHTML = "<option value=`default`>No Languages Set</option>"
                
            }else{

                translationPopUpTargetLanguage.innerHTML = "";
                translationPopUpOutputLanguage.innerHTML = "";

                for(let t of allLanguagesList){

                    let newTag1 = document.createElement("option");
                    let newTag2 = document.createElement("option")
                
                    newTag1.innerText = t;

                    newTag1.value = t;

                    newTag2.innerText = t;

                    newTag2.value = t;

                
                    //Append new tag
                    translationPopUpTargetLanguage.appendChild(newTag1);
                    translationPopUpOutputLanguage.appendChild(newTag2);
                } 

                try{

                    let currentProject = await chrome.storage.local.get(["currentProject"]);
                
                    let currentProjectName = Object.keys(currentProject["currentProject"]);

                    let allProjectDetailsRequest = await chrome.storage.local.get(["allProjectDetails"]);

                    let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

                    let languagesList = allProjectDetails["allLanguages"]
                
                    currentProjectName = currentProjectName[0];
                    
                    let currentProjectDetails = currentProject["currentProject"][currentProjectName];
        
                    let currentProjectTargetLanguage = currentProjectDetails["target_language"]
                    let currentProjectOutputLanguage = currentProjectDetails["output_language"]
        
                    //Check whether current project appears in all project details list
        
                    let indexSetTarget = languagesList.indexOf(currentProjectTargetLanguage);
                    let indexSetOutput = languagesList.indexOf(currentProjectOutputLanguage);
        
                    translationPopUpTargetLanguage.selectedIndex = indexSetTarget;
                    translationPopUpOutputLanguage.selectedIndex = indexSetOutput;
                
                }catch(e){
                    console.log(e);
                }
            } 
        }

        function nodeConvert(nodeList){

            let newArray = Array.from(nodeList);

            let finalArray = [];

            for(let node of newArray){

                let htmltext = node.textContent;

                htmltext = htmltext.replaceAll("\\n", "").trim();

                finalArray.push(htmltext)
            }

            return finalArray

        }

        async function setProjectDropDown(currentProjectReset){

            if (currentProjectReset === "default"){

                let allProjectDetailsRequest = await chrome.storage.local.get(["allProjectDetails"]);

                let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

                
                let currentProject = await chrome.storage.local.get(["currentProject"]);
            
                let currentProjectName = Object.keys(currentProject["currentProject"]);
            
                currentProjectName = currentProjectName[0]
        
                //Check whether current project appears in all project details list
        
                let indexSet = allProjectDetails["allProjects"].indexOf(currentProjectName);
        
                translationPopUpProject.selectedIndex = indexSet + 1
            } else{

                translationPopUpProject.selectedIndex = 0

            }
        };

        //Setting Shadow DOM host on load
        Views.setShadowDOMHost(sheet)

        //When the DOM has loaded, the views are appeneded to the current page

        Views.appendView(popupBubbleObject.view);
        Views.appendView(translationPopupObject.view);

        //Load content from web available resources (PNGs etc)
        resourceSearch();

        ////Translation popup elements

        let translationPopupInput =  Views.shadowDOMHost.getElementById(translationPopupObject["elements"]["input"]);
        let translationPopupOutput = Views.shadowDOMHost.getElementById(translationPopupObject["elements"]["output"]);
        let translationPopupSave = Views.shadowDOMHost.getElementById(translationPopupObject["elements"]["saveButton"]);
        let translationPopUpTargetLanguage = Views.shadowDOMHost.getElementById("translation-target-language");
        let translationPopUpOutputLanguage = Views.shadowDOMHost.getElementById("translation-output-language")
        let translationPopUpProject = Views.shadowDOMHost.getElementById(translationPopupObject["elements"]["project"]);
        let translationPopUpSelectedTags = Views.shadowDOMHost.getElementById(translationPopupObject["elements"]["tags"]);
        let translationPopUpTagsList = Views.shadowDOMHost.getElementById("translation-tag-select");


        //Setting project details on initial load

        //Gets all other content details saved in local- storage.

        let allProjectDetailsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

        //Append all projects in local storage
        appendAllProjectDropDown(allProjectDetails["allProjects"]);

        //Append all tags in local storage
        appendAllTagsDropDown(allProjectDetails["allTags"])

        //Append all languages in local storage

        appendAllLanguagesDropDown(allProjectDetails["allLanguages"])

        //Try getting current project details

        try{
            let currentProjectRequest = await chrome.storage.local.get(["currentProject"]);

            let currentProject = currentProjectRequest["currentProject"];

            let [currentProjectName] = Object.keys(currentProject);

            let currentProjectDetails = currentProject[currentProjectName];

            //set index of project in project dropdown

            let indexToSetProject = allProjectDetails["allProjects"].indexOf(currentProjectName);

            translationPopUpProject.selectedIndex = indexToSetProject + 1

            //set index of target language

            let targetLanguage = currentProjectDetails["target_language"]

            let indexToSetTargetLanguage = allProjectDetails["allLanguages"].indexOf(targetLanguage)

            translationPopUpTargetLanguage.selectedIndex = indexToSetTargetLanguage;

            //set index of output language

            let outputLanguage = currentProjectDetails["output_language"]

            let indexToSetOutputLanguage = allProjectDetails["allLanguages"].indexOf(outputLanguage)

            translationPopUpTargetLanguage.selectedIndex = indexToSetOutputLanguage

            //set tags

            appendTags(currentProjectDetails["tags"])
        
        } catch(e){

            console.log(e)
        }

        
        //Main event listeners on pop up views

        //View display logic

        document.addEventListener("mousemove", (event)=>{
            //Dynamically update the view popup location to the mouse cursor position
            Views.xPos = event.clientX + document.documentElement.scrollLeft;
            Views.yPos  = event.clientY + document.documentElement.scrollTop;
        })


        //Pop up navigation logic

        let translationViewClicked = false;
        let bubbleViewClicked = false;

        let selectionString;

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

        
        Views.shadowDOMHost.getElementById(popupBubbleObject["elements"]["mainButton"]).addEventListener("click", (e)=>{

            e.stopPropagation();

            console.log(e)

            //If the popup bubble is clicked , then the translation view is set, and the popup bubble reset
            Views.changeView(translationPopupObject.view);

            //Focus on the save button immediately
            translationPopupSave.focus()


            //The string which is to be adpoted by the translation view is set here. SelectionString will reset to 0 on click
            translationPopupInput.value = selectionString;

            //These functions start the API call
            resetTimer();
            startTimer();

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
        
        
        translationPopupSave.addEventListener("click", (e)=>{

            e.stopPropagation();

            //Get tags
            let tagsNodelist = translationPopUpSelectedTags.querySelectorAll(".vocab-tag-inner");

            let tagsList = nodeConvert(tagsNodelist);


            let translationObject = {
                foreign_word: translationPopupInput.value,
                translated_word: translationPopupOutput.value,
                target_language: translationPopUpTargetLanguage.value,
                output_language: translationPopUpOutputLanguage.value,
                source_url: "",
                base_url:"",
                tags: tagsList,
                project: translationPopUpProject.value
            };

            sendNewText.details.details = translationObject;

            chrome.runtime.sendMessage(sendNewText);


            //Popup navigation logic
            Views.changeView("none");
            translationViewClicked = false;
            translationPopupInput.value = null;
            translationPopupOutput.value = null;

        });

        chrome.runtime.onMessage.addListener((request)=>{
            
            if (request.message === "set-project-details"){
        
                console.log(request)
        
                let projectOptionsNodeList = translationPopUpProject.querySelectorAll("option");
                let targetLanguageOptionsNodeList = translationPopUpTargetLanguage.querySelectorAll("option");
                let outputLanguageOptionsNodeList = translationPopUpOutputLanguage.querySelectorAll("option");

                let projectOptionsList = nodeConvert(projectOptionsNodeList);
                let targetLanguageOptionsList = nodeConvert(targetLanguageOptionsNodeList);
                let outputLanguageOptionsList = nodeConvert(outputLanguageOptionsNodeList);
        
                //Check whether Service Worker reset current Project to nil
                if(request.details.projectName === "default"){

                    //Reset tags to nil

                    appendTags([]);

                    //Reset language

                    translationPopUpTargetLanguage.selectedIndex = 0;
                    translationPopUpOutputLanguage.selectedIndex = 0;

                    //Reset projects

                    translationPopUpProject.selectedIndex = 0;

                }else{

                    let projectName = request.details.projectName

                    let {tags, target_language, output_language, urls} = request.details.projectDetails[projectName];

                    //Set tags

                    appendTags(tags)

                    //Set current project

                    console.log(projectOptionsList)
            
                    let indexToSetProject = projectOptionsList.indexOf(projectName);
            
                    translationPopUpProject.selectedIndex = indexToSetProject;
            
                    //Set language index
                    
                    let indexToSetTargetLanguage = targetLanguageOptionsList.indexOf(target_language);
            
                    translationPopUpTargetLanguage.selectedIndex = indexToSetTargetLanguage;

                    let indexToSetOutputLanguage = outputLanguageOptionsList.indexOf(output_language);
            
                    translationPopUpOutputLanguage.selectedIndex = indexToSetOutputLanguage;

                };
    
            };
        });

        //Update new projects
        chrome.runtime.onMessage.addListener((request)=>{

            if(request.message === "add-new-project-details"){

                let allProjectsList = request.details.projectList;

                appendAllProjectDropDown(allProjectsList);
                setProjectDropDown();

            };
        });

        //Delete project
        chrome.runtime.onMessage.addListener( (request)=>{

            if(request.message === "update-projects"){

                let allProjectsList = request.details.projectList;

                appendAllProjectDropDown(allProjectsList);

                if(request.details.removeCurrentProjectTags == true){
                    appendTags([]);
                    setProjectDropDown("default");

                }; 
                
                setProjectDropDown("");
            };
        });

        //Setting project within content view

        translationPopUpProject.addEventListener("change", async ()=>{

            let currentProjectName = translationPopUpProject.value;

            let currentProjectDetailsRequest = await chrome.storage.local.get([currentProjectName]);

            let currentProjectDetails = currentProjectDetailsRequest[currentProjectName];

            let currentProjectTags = currentProjectDetails?.tags;

            appendTags(currentProjectTags);
        });

        //Update tags

        chrome.runtime.onMessage.addListener((request)=>{

            if(request.message === "update-tags"){
                appendAllTagsDropDown(request.details.tagsList)   
            }
        });

        chrome.runtime.onMessage.addListener((request)=>{

            if(request.message === "update-current-tags"){
                
                appendTags(request.details.tagsList);

            };
        });

        //Translation logic

        const translateMessage = new MessageTemplate("translate", {
            targetLanguage:"",
            outputLanguage:"",
            targetText:"",
            targetView: ""
        });

        let timer;

        function startTimer(){

            timer = setTimeout(()=>{
                        let translationStringInput = translationPopupInput.value;

                        //encode translate language message on click.

                        translateMessage.details.targetLanguage = translationPopUpTargetLanguage.value;
                        translateMessage.details.outputLanguage = translationPopUpOutputLanguage.value;
                        translateMessage.details.targetText = translationStringInput;
                        translateMessage.details.targetView = "content-view";

                        //Send message to initiate translationS

                        chrome.runtime.sendMessage(translateMessage);

                    }, 500);
        };

        function resetTimer(){
            clearTimeout(timer);
        }

        translationPopupInput.addEventListener("input", (e)=>{
            e.stopPropagation();

            console.log(e)

            resetTimer();
            startTimer();
                
        });

        chrome.runtime.onMessage.addListener((request)=>{
            if(request.message === "translation-result" && request.details.targetView === "content-view"){
        
                console.log(request)
        
                translationPopupOutput.value = request.details.resultDetails
        
            };
        });

        //update language on change
        chrome.runtime.onMessage.addListener((request)=>{

            if(request.message === "update-current-language"){

                appendAllLanguagesDropDown(allProjectDetails["allLanguages"]);

            };
        });

        //Trigger translation when changing languages
        translationPopUpTargetLanguage.addEventListener("change", (e)=>{

            e.stopPropagation();
        
            resetTimer();
            startTimer();
        
        });
        
        translationPopUpOutputLanguage.addEventListener("change", (e)=>{
        
            e.stopPropagation();
        
            resetTimer();
            startTimer();
        });
        
    };
});


//CSS  Styles for Shadow DOM 

const sheet = new CSSStyleSheet();

sheet.replace(`
/*Common variables*/

:root{ 
    --view-bg-color: rgba(120, 120, 235, 0.5);
    --secondary-bg-color: rgba(0, 255, 255, 0.432);
    --extension-height: 350px;
    --extension-width: 600px;
    --placeholder-border: 1px solid black;
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

.extension-wrapper{
    color: initial;
    color-scheme: normal;
    font-family:initial;
    line-height: initial;
    height: var(--extension-height);
    width: var(--extension-width);
    border: solid 2px;
    border-radius: 10px;
    margin: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--view-bg-color);
    box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.733);
}

/*Translation pop up styling*/

.translation-view-wrapper{
    border: var(--placeholder-border);
    margin:0;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-around;
}

.translation-view-title-wrapper{
    display:flex;
    border: var(--placeholder-border);
    height:10%;
}

.translation-input-output-wrapper{
    display:flex;
    flex-direction: column;
    justify-content: space-around;
    flex:2.5;
    border: var(--placeholder-border);

}

.translation-input-output-wrapper-inner{
    border: var(--placeholder-border);
    display:flex;
    flex-direction: column;
    justify-content: space-evenly;
    height:70%;
    margin-top: 10px;
    margin-right: 5px;
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



.translation-parameters-wrapper{
    display: flex;
    flex:1;
    border: var(--placeholder-border);
    
}

.translation-parameters-list{
    display:flex;
    flex-direction: column;
    border: var(--placeholder-border);
    margin:0;
    width:100%;
    height:100%;
    padding:0;
}

.translation-parameters-list > li{
    border: var(--placeholder-border);
    margin: 0;
    list-style: none;
}

/*parameters styling*/



.translation-parameter-language-wrapper{
    display:flex;
    border: var(--placeholder-border);
    flex:1;
}

.translation-parameter-language-wrapper > div {
    border: var(--placeholder-border);
    display:flex;
}

.translation-parameter-language-set-wrapper{
    align-items: center;
}

.translation-parameter-project-wrapper{
    display:flex;
    border: var(--placeholder-border);
    flex:1;
}

.translation-parameter-project-wrapper > div {
    border: var(--placeholder-border);
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
    flex:2;
    max-height:60%;
    overflow:auto;
}

.translation-tagset-title-dropdown-wrapper{
    display:flex;
    flex-direction: column;
    align-items: center;
}

.translation-tagset-selected-wrapper{
    height:45%;
    max-height:45%;
    border: var(--placeholder-border);
    display:flex;
    flex-direction: column;
    margin:10px;
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

`)
