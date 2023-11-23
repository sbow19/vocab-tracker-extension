
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


currentProjectCreateButton.addEventListener("click", ()=>{
    changeView(addProjectView);
})

currentProjectSearchButton.addEventListener("click", ()=>{
    changeView(resultView);
})

currentProjectTranslateButton.addEventListener("click", ()=>{
    changeView(translationView);
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


//General functions

function getTags(querySelector){
    //This function will be used for other parts of the UI

    let tagsNodeList = document.querySelectorAll(`${querySelector} > li span` );

    let tagsList = [];

    for (tag of tagsNodeList){

        tagsList.push(tag.innerText)

    }

    let listOfTags  = document.querySelectorAll(`${querySelector} > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

    return tagsList;

}


//Default Popup View logic


//Current Project Logic

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

        let tag = document.getElementById(`current-project-${currentProjectTagValue}-delete`)

        tag.addEventListener("click", ()=>{

            //Removes list element on click

            tag.parentNode.remove()

        });
    };
});

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

    console.log(searchTerms);

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

    console.log(searchParameters);

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

addProjectCreate.addEventListener("click", ()=>{

    let newProjectDetails = {
        name: addProjectNameInput.value,
        language: addProjectLanguageDropdown.value,
        tags: getTags("#add-project-tags-selected-list"),
    };

    console.log(newProjectDetails);

    //reset search parameters

    addProjectNameInput.value = "";

    addProjectLanguageDropdown.selectedIndex = 0;

    let listOfTags  = document.querySelectorAll(`#add-project-tags-selected-list > li`);

    for (listNode of listOfTags){
        listNode.remove()
    }

})








