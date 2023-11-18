//testing basic view change functionality

const mainMenuButtonOne = document.getElementById("result-main-menu-button");
const defaultView = document.getElementById("default-view");
const searchView = document.getElementById("result-view");
const resultViewButton = document.getElementById("search-wrapper-search-button");

function changeViewOne () {
    searchView.style.display = "none";
    defaultView.style.display = "flex";
}

function changeViewTwo () {
    defaultView.style.display = "none";
    searchView.style.display = "flex";
}


mainMenuButtonOne.addEventListener("click", changeViewOne)

resultViewButton.addEventListener("click", changeViewTwo)