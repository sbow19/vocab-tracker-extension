
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


//Search terms logic

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

function getTags(querySelector){
    //This function will be used for other parts of the UI

    let tagsNodeList = document.querySelectorAll(`${querySelector} > li span` );

    let tagsList = [];

    for (tag of tagsNodeList){

        console.log(tag)

        tagsList.push(tag.innerText)

    }

    let listOfTags  = document.querySelectorAll(`${querySelector} > li`);

    for (listNode of listOfTags){
        console.log(listNode)
        listNode.remove()
    }

    return tagsList;

}


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
        console.log(listNode)
        listNode.remove()
    }

})

searchClearButton.addEventListener("click", ()=>{

    //reset search parameters
    searchInput.value = "";

    searchProjectsDropdown.selectedIndex = 0;
    searchURLDropdown.selectedIndex = 0;
})





//Add Project View Logic

//Add listener to create project



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

//Get lanaguage select


