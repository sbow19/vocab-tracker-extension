
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
