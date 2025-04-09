//Class to store state of views
class View{
    constructor(idString){
        this.view = document.getElementById(idString);
    };

    static currentView = null;

    static currentView(){
        return currentView;
    };

    static changeView(newView){
        //View object passed into change view. Set display method
        //called on View objects to set new display values.
    
        let current = View.currentView
        current.setDisplay("none");
    
        View.currentView = newView
        newView.setDisplay("flex");
        
    }

    setDisplay(value){
        this.view.style.display = value;
    };

}

//view instantiations
const defaultView = new View("default-view");
const resultView = new View("result-view");
const translationView = new View("translation-view");
const addProjectView = new View("add-project-view");
const addTagsView = new View("tags-view");
//Set default view
document.addEventListener("DOMContentLoaded", () => {
  defaultView.setDisplay("flex");
  View.currentView = defaultView;
});

//Popup navigation
const currentProjectCreateButton = document.getElementById(
  "current-project-create-button"
);
const currentProjectSearchButton = document.getElementById(
  "search-wrapper-search-button"
);
const currentProjectTranslateButton = document.getElementById(
  "search-wrapper-translate-button"
);

const translateMainMenuButton = document.getElementById(
  "translation-main-menu-button"
);
const resultMainMenuButton = document.getElementById("result-main-menu-button");
const addMainMenuButton = document.getElementById(
  "add-project-main-menu-button"
);

const currentProjectManageButton = document.getElementById(
  "current-project-manage-button"
);

const tagsMainMenuButton = document.getElementById("tags-main-menu-button");

currentProjectCreateButton.addEventListener("click", () => {
  View.changeView(addProjectView);
});

currentProjectSearchButton.addEventListener("click", () => {
  View.changeView(resultView);
});

currentProjectTranslateButton.addEventListener("click", () => {
  View.changeView(translationView);
});

currentProjectManageButton.addEventListener("click", () => {
  View.changeView(addTagsView);
});

translateMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

resultMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

addMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

tagsMainMenuButton.addEventListener("click", () => {
  View.changeView(defaultView);
});

export {}