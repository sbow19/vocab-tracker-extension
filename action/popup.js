
class MessageTemplate {

    constructor(message, details){

        this.message = message
        this.details = details

    };
    
};

//Class to store state of views

class View{

    constructor(idString){
        this.view = document.getElementById(idString);
    };

    static currentView = null;

    static currentView(){
        return currentView;
    };

    setDisplay(value){
        this.view.style.display = value;
    };

}

//view instantiations

const defaultView = new View("default-view");
const resultView = new View("result-view");
const translationView = new View("translation-view");
const addProjectView = new View("add-project-view");
const addTagsView = new View("tags-view")

function changeView(newView){
    //View object passed into change view. Set display method
    //called on View objects to set new display values.

    let current = View.currentView
    current.setDisplay("none")

    View.currentView = newView
    newView.setDisplay("flex");
    
}

document.addEventListener("DOMContentLoaded", ()=>{
    defaultView.setDisplay("flex")
    View.currentView = defaultView
})

//Popup navigation

const currentProjectCreateButton = document.getElementById("current-project-create-button");
const currentProjectSearchButton = document.getElementById("search-wrapper-search-button");
const currentProjectTranslateButton = document.getElementById("search-wrapper-translate-button");

const translateMainMenuButton = document.getElementById("translation-main-menu-button");
const resultMainMenuButton = document.getElementById("result-main-menu-button");
const addMainMenuButton = document.getElementById("add-project-main-menu-button");

const currentProjectManageButton = document.getElementById("current-project-manage-button")

const tagsMainMenuButton = document.getElementById("tags-main-menu-button");

currentProjectCreateButton.addEventListener("click", ()=>{
    changeView(addProjectView);
})

currentProjectSearchButton.addEventListener("click", ()=>{
    changeView(resultView);
})

currentProjectTranslateButton.addEventListener("click", ()=>{
    changeView(translationView);
})

currentProjectManageButton.addEventListener("click", ()=>{
    changeView(addTagsView);
})

translateMainMenuButton.addEventListener("click", ()=>{
    changeView(defaultView);
})

resultMainMenuButton.addEventListener("click", ()=>{
    changeView(defaultView);
})

addMainMenuButton.addEventListener("click", ()=>{
    changeView(defaultView);
})

tagsMainMenuButton.addEventListener("click", ()=>{
    changeView(defaultView);
})


//General functions

function getTags(querySelector){
    //This function will be used for other parts of the UI

    let tagsNodeList = document.querySelectorAll(`${querySelector} > li span` );

    let tagsList = [];

    for (tag of tagsNodeList){

        tagsList.push(tag.innerText)

    }

    return tagsList;
};

const updateCurrentProjectTag = new MessageTemplate("update-current-tags", {

    tagName: "",
    action: ""

});

const deleteProjectMessage = new MessageTemplate("delete-project", {
    projectName : ""
});

async function appendAllProjectDropDown(projectList){
    
    //creating new option element for projects
    let projectsDropdownList = [
        currentProjectsProjectDropdown,
        searchProjectsDropdown,
        resultProjectDropdown,
        translationProjectsDropdown
    ];

    for (let dropdown of projectsDropdownList){

        dropdown.innerHTML = "<option value=`default`>All Projects</option>"

        for (let project of projectList){
            let newProjectNameElement = document.createElement("option");

            newProjectNameElement.setAttribute("value", project);

            newProjectNameElement.innerText = project;

            dropdown.appendChild(newProjectNameElement);
        };
    };

    allProjectsList.innerHTML = "";

    for (let project of projectList){

    
        const newElement = document.createElement("li");

        //Create tag class
        newElement.classList.add("vocab-tag-outer");

        newElement.id = `add-tag-${project}-tag`

        newElement.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${project}</span>
        </div>
        <div class="vocab-tag-delete" id="add-tag-${project}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        allProjectsList.appendChild(newElement);

        let tag = document.getElementById(`add-tag-${project}-delete`)

        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()
    
            deleteProjectMessage.details.projectName = project;

            console.log(deleteProjectMessage)

            chrome.runtime.sendMessage(deleteProjectMessage);
        });
    };

    try{

        let currentProject = await chrome.storage.local.get(["currentProject"]);
    
        let currentProjectName = Object.keys(currentProject["currentProject"]);
    
        currentProjectName = currentProjectName[0];
        
        let currentProjectDetails = currentProject["currentProject"][currentProjectName];

        //Check whether current project appears in all project details list

        let indexSet = projectList.indexOf(currentProjectName);

        currentProjectsProjectDropdown.selectedIndex = indexSet + 1
    
        //get current project tags
    
        let currentProjectTags = currentProjectDetails["tags"];
    
        changeTags(currentProjectTags);
    
    }catch(e){
        console.log(e);
        console.log("No current project set")
    }
};

//Setting tags by default.

function currentProjectTags(tags){

    if (tags.length > 0){

        for (let tag of tags){
            let newTag = document.createElement("li");

            //Create tag class
            newTag.classList.add("vocab-tag-outer");

            newTag.id = `current-project-${tag}-tag`

            newTag.innerHTML = `
            
            <div class="vocab-tag-inner">
                <span>${tag}</span>
            </div>
            <div class="vocab-tag-delete" id="current-project-${tag}-delete">
                <button> delete </button>
            </div>
            `

            //Append new tag
            currentProjectTagSelection.appendChild(newTag);

            let deleteTag = document.getElementById(`current-project-${tag}-delete`)

            deleteTag.addEventListener("click", ()=>{

                //Removes list element on click

                let tagValue = deleteTag.previousElementSibling.innerText

                updateCurrentProjectTag.details.tagName = tagValue;
                updateCurrentProjectTag.details.action = "delete"

                console.log(updateCurrentProjectTag)

                //Removes list element on click
                deleteTag.parentNode.remove()
                
                //Update current project settings
                chrome.runtime.sendMessage(updateCurrentProjectTag)

            });
        };
    }else{
        currentProjectTagSelection.innerHTML = ""
    }
};

function changeTags(tags){

    //When current project is selected, the current tags are changed.

    //Clear current tags

    currentProjectTagSelection.innerHTML = "";

    //Append tags to current project tags view

    currentProjectTags(tags);

    //Extracting tags list from current project details
    
};



function updateTags(tagsList){

    let tagDropDowns = [
        currentProjectTagsDropdown,
        searchTagsDropdown,
        resultTagsDropdown,
        translationTagsDropdown,
        addProjectTagsDropdown,
    ];

    for(let dropdown of tagDropDowns){

        //Check whether there are any tags in storage
        if(tagsList.length === 0){
            dropdown.innerHTML = "<option value=`default`>No Tags Created</option>"
            
        }else{

        dropdown.innerHTML = ""

            for(let t of tagsList){

                let newTag = document.createElement("option");
            
                newTag.innerText = t;

                newTag.value = t;

            
                //Append new tag
                dropdown.appendChild(newTag);
            } 
        };
    };

    allTagsList.innerHTML = "";

    for (let tagName of tagsList){

    
        const newElement = document.createElement("li");

        //Create tag class
        newElement.classList.add("vocab-tag-outer");

        newElement.id = `add-tag-${tagName}-tag`

        newElement.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${tagName}</span>
        </div>
        <div class="vocab-tag-delete" id="add-tag-${tagName}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        allTagsList.appendChild(newElement);

        let tag = document.getElementById(`add-tag-${tagName}-delete`);


        //Add event for when tag is removed, triggers update to local storage and updates other dropdowns
        
        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()

            deleteTagMessage.details.tagName = tagName;

            chrome.runtime.sendMessage(deleteTagMessage);
        });
    };
};



//Action load up details

//Load current project details


document.addEventListener("DOMContentLoaded", async()=>{
    console.log("this content has loaded");

    //Send message about current ID 
    chrome.runtime.sendMessage("loaded")


    //Get all project details from local storage

    let allProjectDetailsRequest = await chrome.storage.local.get(["allProjectDetails"]);

    let allProjectDetails = allProjectDetailsRequest["allProjectDetails"];

    //Append all projects in local storage
    appendAllProjectDropDown(allProjectDetails["allProjects"]);

    //Append all languages in local storage

    //Append all tags in local storage

    updateTags(allProjectDetails["allTags"])

    //Append all urls in local storage

    //Retrieve current project details from storage //REfactoring needed

    try{

        let currentProject = await chrome.storage.local.get(["currentProject"]);
    
        let currentProjectName = Object.keys(currentProject["currentProject"]);
    
        currentProjectName = currentProjectName[0];
        
        let currentProjectDetails = currentProject["currentProject"][currentProjectName];

        //Check whether current project appears in all project details list

        let indexSet = allProjectDetails["allProjects"].indexOf(currentProjectName);

        currentProjectsProjectDropdown.selectedIndex = indexSet + 1
    
        //get current project tags
    
        let currentProjectTags = currentProjectDetails["tags"];
    
        changeTags(currentProjectTags);
    
        
    }catch(e){
        console.log(e);
        console.log("No current project set")
    }
});

//Default Popup View logic

const currentProjectsProjectDropdown = document.getElementById("current-project-project-options");


//Current Project Logic

//Set current project details

/*

    The details for the  current project are set in the main view. Details
    such as project name, urls, defaul language, and tags, are default values for
    other views and the translation pop up view.

    When the user adds and remove tags, the current project will change dynamically
    so that the current project only has the selected tags.

*/

const setCurrentProjectMessage = new MessageTemplate(
    "set-current-project",
    {
        currentProject : ""
    }
)

//Details of current project set by Service Worker, and details of said project updated on DOMs
currentProjectsProjectDropdown.addEventListener("change", async()=>{

    //Send to Service Worker  when refactoring for security reasons.

    //Get value of dropdown
    let currentProjectName = currentProjectsProjectDropdown.value

    //Set message values. Send project name to be set to current

    setCurrentProjectMessage.details.currentProject = currentProjectName;

    await chrome.runtime.sendMessage(setCurrentProjectMessage);
});

//UPdate to DOM when new project set
chrome.runtime.onMessage.addListener((request)=>{
    if (request.message === "set-project-details"){

        //Check whether Service Worker reset current Project to nil
        if(request.details.projectName === "default"){

            //Reset tags to nil

            changeTags([]);

        }else{

            let projectName = request.details.projectName

            let {tags, language, urls} = request.details.projectDetails[projectName];

            /*Code setting current project details to views.*/

            //setting tags on current view 

            changeTags(tags);
        };
    };
});

//Tag selelction

const currentProjectTagsDropdown = document.getElementById("current-project-tag-select");

const currentProjectAddTagButton = document.getElementById("current-project-add-tag");

const currentProjectTagSelection = document.getElementById("current-project-tags-selected-list");

let currentProjectTagValue;



currentProjectAddTagButton.addEventListener("click", ()=>{

    //If another element has the tag, then another tag will not be appeneded

    if(!document.getElementById(`current-project-${currentProjectTagsDropdown.value}-tag`)){

        let newTag = document.createElement("li");

        //Get select value

        currentProjectTagValue =  currentProjectTagsDropdown.value;


        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `current-project-${currentProjectTagValue}-tag`

        newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${currentProjectTagValue}</span>
        </div>
        <div class="vocab-tag-delete" id="current-project-${currentProjectTagValue}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        currentProjectTagSelection.appendChild(newTag);

        //Update current project settings.

        updateCurrentProjectTag.details.tagName = currentProjectTagsDropdown.value;
        updateCurrentProjectTag.details.action = "add"

        console.log(updateCurrentProjectTag)

        chrome.runtime.sendMessage(updateCurrentProjectTag)

        let tag = document.getElementById(`current-project-${currentProjectTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            let tagValue = tag.previousElementSibling.innerText

            updateCurrentProjectTag.details.tagName = tagValue;
            updateCurrentProjectTag.details.action = "delete"

            console.log(updateCurrentProjectTag)

            //Removes list element on click
            tag.parentNode.remove()
            
            //Update current project settings
            chrome.runtime.sendMessage(updateCurrentProjectTag)

        });
    };
});

//Current project search logic

//Tag selelction

const searchTagsDropdown = document.getElementById("search-tag-select");

const searchAddTagButton = document.getElementById("search-add-tag");

const searchTagSelection = document.getElementById("search-tags-selected-list");

let searchTagValue;

searchAddTagButton.addEventListener("click", ()=>{

    //If another element has the tag, then another tag will not be appeneded

    if(!document.getElementById(`search-${searchTagsDropdown.value}-tag`)){

        let newTag = document.createElement("li");

        //Get select value

        searchTagValue =  searchTagsDropdown.value;


        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `search-${searchTagValue}-tag`

        newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${searchTagValue}</span>
        </div>
        <div class="vocab-tag-delete" id="search-${searchTagValue}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        searchTagSelection.appendChild(newTag);

        let tag = document.getElementById(`search-${searchTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()

        });
    };
});

//Language and project buttons logic

const searchURLDropdown = document.getElementById("search-wrapper-url-list");

const searchProjectsDropdown = document.getElementById("search-wrapper-projects-list");

//Search box input

const searchInput = document.getElementById("vocab-search-by-word-input");

//Search wrapper buttons logic

const searchClearButton= document.getElementById("search-wrapper-clear-button")

const searchSearchButton = document.getElementById("search-wrapper-search-button");


searchSearchButton.addEventListener("click", ()=>{
    let searchTerms = {
        project: searchProjectsDropdown.value,
        url: searchURLDropdown.value,
        tags: getTags("#search-tags-selected-list"),
        word: searchInput.value,
    }

    //reset search parameters

    searchInput.value = "";

    searchProjectsDropdown.selectedIndex = 0;
    searchURLDropdown.selectedIndex = 0;

    let listOfTags  = document.querySelectorAll(`#search-tags-selected-list > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

})

searchClearButton.addEventListener("click", ()=>{

    //reset search parameters
    searchInput.value = "";

    searchProjectsDropdown.selectedIndex = 0;
    searchURLDropdown.selectedIndex = 0;
})


//Results View logic

//Tags select

const resultTagsDropdown = document.getElementById("result-tag-select");

const resultAddTagButton = document.getElementById("result-add-tag");

const resultTagSelection = document.getElementById("result-tags-selected-list");

let resultTagValue;

resultAddTagButton.addEventListener("click", ()=>{

    //If another element has the tag, then another tag will not be appeneded

    if(!document.getElementById(`result-${resultTagsDropdown.value}-tag`)){

        let newTag = document.createElement("li");

        //Get select value

        resultTagValue =  resultTagsDropdown.value;


        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `result-${resultTagValue}-tag`

        newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${resultTagValue}</span>
        </div>
        <div class="vocab-tag-delete" id="result-${resultTagValue}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        resultTagSelection.appendChild(newTag);

        let tag = document.getElementById(`result-${resultTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()

        });
    };
});

//Table

const resultTableBody = document.getElementById("popup-result-table-view");


//URL and Project drop down

const resultURLDropdown = document.getElementById("result-parameter-url-set");

const resultProjectDropdown = document.getElementById("result-parameter-project-set");

//Search and clear buttons

const resultSearch = document.getElementById("result-search");

const resultClear = document.getElementById("result-clear");

resultSearch.addEventListener("click", ()=>{

    let searchParameters = {
        project: resultProjectDropdown.value,
        url: resultURLDropdown.value,
        tags: getTags("#result-tags-selected-list")
    };

    //reset search parameters

    resultURLDropdown.selectedIndex = 0;
    resultProjectDropdown.selectedIndex = 0;

    let listOfTags  = document.querySelectorAll(`#result-tags-selected-list > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

    //reset results table

    resultTableBody.innerHTML = "";
})

resultClear.addEventListener("click", ()=>{

    resultURLDropdown.selectedIndex = 0;
    resultProjectDropdown.selectedIndex = 0;
    resultTagsDropdown.selectedIndex = 0;

    let listOfTags  = document.querySelectorAll(`#result-tags-selected-list > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

    //reset results table

    resultTableBody.innerHTML = "";
});


//Export button

const resultExport = document.getElementById("result-export");

resultExport.addEventListener("click", ()=>{

    console.log(resultTableBody.innerHTML)

})


//Translation View Logic

//Tags sleection

const translationTagsDropdown = document.getElementById("translation-tag-select");

const translationAddTagButton = document.getElementById("translation-add-tag");

const translationTagSelection = document.getElementById("translation-tags-selected-list");

let translationTagValue;

translationAddTagButton.addEventListener("click", ()=>{

    //If another element has the tag, then another tag will not be appeneded

    if(!document.getElementById(`translation-${translationTagsDropdown.value}-tag`)){

        let newTag = document.createElement("li");

        //Get select value

        translationTagValue =  translationTagsDropdown.value;


        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `translation-${translationTagValue}-tag`

        newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${translationTagValue}</span>
        </div>
        <div class="vocab-tag-delete" id="translation-${translationTagValue}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        translationTagSelection.appendChild(newTag);

        let tag = document.getElementById(`translation-${translationTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()

        });
    };
});

//Language and project buttons logic 

const translationLanguageDropdown = document.getElementById("translation-parameter-language-set");

const translationProjectsDropdown = document.getElementById("translation-parameter-project-set");

//output logic

const translationInput = document.getElementById("translation-input-text");
const translationOutput = document.getElementById("translation-output-text")


//Save to database button

const translationSave = document.getElementById("translation-save");

translationSave.addEventListener("click", ()=>{

    let translationResults = {
        project: translationProjectsDropdown.value,
        language: translationLanguageDropdown.value,
        tags: getTags("#translation-tags-selected-list"),
        foreign_word: translationInput.value,
        translated_word: translationOutput.value
    };

    console.log(translationResults);

    //reset search parameters

    translationInput.value = "";
    translationOutput.value = "";

})


//Add Project View Logic


//Tags selection 

const addProjectTagsDropdown = document.getElementById("add-project-tags-dropdown");

const addProjectAddTagButton = document.getElementById("add-project-add-tag");

const addProjectTagSelection = document.getElementById("add-project-tags-selected-list");

let addProjectTagValue;

addProjectAddTagButton.addEventListener("click", ()=>{

    //If another element has the tag, then another tag will not be appeneded

    if(!document.getElementById(`add-project-${addProjectTagsDropdown.value}-tag`)){

        let newTag = document.createElement("li");

        //Get select value

        addProjectTagValue =  addProjectTagsDropdown.value;


        //Create tag class
        newTag.classList.add("vocab-tag-outer");

        newTag.id = `add-project-${addProjectTagValue}-tag`

        newTag.innerHTML = `
        
        <div class="vocab-tag-inner">
            <span>${addProjectTagValue}</span>
        </div>
        <div class="vocab-tag-delete" id="add-project-${addProjectTagValue}-delete">
            <button> delete </button>
        </div>
        `
        //Append new tag
        addProjectTagSelection.appendChild(newTag);

        let tag = document.getElementById(`add-project-${addProjectTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            //Moves list element on click

            tag.parentNode.remove()
            

        });
    };
});

//Get dropdown selection

const addProjectLanguageDropdown = document.getElementById("add-project-language-dropdown");

const addProjectNameInput = document.getElementById("add-project-name-input");

//Create project button

const addProjectCreate = document.getElementById("add-project-create-project");

addProjectCreate.addEventListener("click", async ()=>{

    let newProjectDetails = {
        name: addProjectNameInput.value,
        language: addProjectLanguageDropdown.value,
        tags: getTags("#add-project-tags-selected-list"),
        urls: []
        
    };

    //reset search parameters

    addProjectNameInput.value = "";

    addProjectLanguageDropdown.selectedIndex = 0;

    let listOfTags  = document.querySelectorAll(`#add-project-tags-selected-list > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

    //set project details in local storage

    createProject(newProjectDetails);

});

const checkProjectMessage = new MessageTemplate("check-duplicate-project", {
    projectName : ""
});

const addProjectMessage = new MessageTemplate("add-project", {
    projectDetails: {},
    projectName: ""
});

const getProjectMessage = new MessageTemplate("get-project", {
    projectName: ""
})

async function createProject(newProjectDetails){

    let projectName = newProjectDetails.name; 

    checkProjectMessage.details.projectName = newProjectDetails.name

    //If no duplicate detected, then new project assigned.

    let projectDetails = {
        language: newProjectDetails.language,
        tags: newProjectDetails.tags,
        urls: newProjectDetails.urls
    };

    let newProjectDetailsSet = {[projectName]: projectDetails};

    addProjectMessage.details.projectDetails = newProjectDetailsSet;
    addProjectMessage.details.projectName = projectName;

    //New project details sent to Service Worker - returns message to update DOM.
    await chrome.runtime.sendMessage(addProjectMessage);
        
};

//When new  project added, append new details to dropdown
chrome.runtime.onMessage.addListener((request)=>{
    if (request.message === "add-new-project-details"){
        //If duplicate project not detected in memory, then project details added

        appendAllProjectDropDown(request.details.projectList);

    };
});

//Tags View 


//Tags buttons

const createNewTagInput = document.getElementById("create-new-tag-input");

const createNewTagButton = document.getElementById("tags-create-new-tag-button");

//lists

const allTagsList = document.getElementById("add-tags-tags-list");

const allProjectsList = document.getElementById("add-tags-project-list");

//Add/remove tags template

const addTagMessage = new MessageTemplate("add-tag", {
    tagName: ""
});

const deleteTagMessage = new MessageTemplate("delete-tag", {
    tagName: ""
});

//Add tags events

createNewTagButton.addEventListener("click", ()=>{

    let newTagInputText = createNewTagInput.value.trim();

    if(newTagInputText.length > 0){

        addTagMessage.details.tagName = newTagInputText

        chrome.runtime.sendMessage(addTagMessage)

    };
});

chrome.runtime.onMessage.addListener((request)=>{

    if(request.message === "update-tags"){
        updateTags(request.details.tagsList)
    };
});


//Delete project events

chrome.runtime.onMessage.addListener((request)=>{

    if(request.message === "update-projects"){
        appendAllProjectDropDown(request.details.projectList);

        console.log(request)

        if(request.details.removeCurrentProjectTags == true){
            changeTags([]);
        };     
    };
});
