//Imports 
import { VocabDatabase } from "/database/database.js";
import { DeeplTranslate } from "/translation/translation.js"

/*

Chrome local object structure

index: default

project, (string)
foreign_word, (string)
target_language, (string)
output_language, (string)
tags, (array)
translated_word, (string),
source_url, (string)
base_url, (string)

*/

//General functions

async function addToProjectList(newProjectName){

    let detailsList = await chrome.storage.local.get(["allProjectDetails"]);

    let newAllProjectDetails = detailsList["allProjectDetails"]

    newAllProjectDetails["allProjects"].push(newProjectName);

    let allProjectDetails = {
        allProjectDetails: newAllProjectDetails
    }
    
    await chrome.storage.local.set(allProjectDetails);

    return newAllProjectDetails["allProjects"]
};

//Set current tab ID globally.
let currentID;

chrome.tabs.onActivated.addListener((result)=>{
    currentID = result.tabId;

});

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request === "loaded"){

        let queryOptions = {active: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        console.log(tab)
        currentID = tab.id;
    };
});

/* Listener which creates the initial IndexedDB on first install. Deletes same
when uninstalled.
*/

class MessageTemplate {

    constructor(message, details){

        this.message = message
        this.details = details

    };
    
}

chrome.runtime.onInstalled.addListener((details)=>{

    //Open a new database on first install. Data will persist even after Extension is deleted
    if (details.reason === "install"){

        VocabDatabase.openDatabase();

    }
});

chrome.runtime.onInstalled.addListener(async(details)=>{

    if(details.reason === "install"){

        let allProjectDetails = 
        {  allProjectDetails: {
                allProjects: [],
                allLanguages: [
                    "Spanish", 
                    "English", 
                    "German",
                    "Bulgarian",
                    "Czech",
                    "Danish",
                    "Greek",
                    "Estonian",
                    "Finnish",
                    "French",
                    "Hungarian",
                    "Indonesian",
                    "Italian",
                    "Japanese",
                    "Korean",
                    "Lithuanian",
                    "Latvian",
                    "Norwegian",
                    "Dutch",
                    "Polish",
                    "Portuguese",
                    "Romanian",
                    "Russian",
                    "Slovak",
                    "Slovenian",
                    "Swedish",
                    "Turkish",
                    "Ukrainian",
                    "Chinese"
                ],
                allURLs: [],
                allTags: []
            }
        };

        await chrome.storage.local.set(allProjectDetails);

        let currentDatabaseSearch = {
            currentDatabaseSearch:[]
        };

        await chrome.storage.local.set(currentDatabaseSearch)
    };
});

chrome.storage.local.onChanged.addListener((result)=>{
    console.log(result)
})

const setProjectDetailsMessage = new MessageTemplate("set-project-details", {
    projectDetails: {},
    projectName: ""
})


//Set current project based on selected current project
chrome.runtime.onMessage.addListener(async (request)=>{

    if (request.message === "set-current-project"){

        console.log(request.details.currentProject)
        //Extract project name from message
        let currentProjectName = request.details.currentProject;

        console.log(currentProjectName)

        //Check whether we reset current project

        if(currentProjectName === "default"){
            //Code to reset current project

            let storageCurrentProjectDetails = {"currentProject": {}};
        
            await chrome.storage.local.set(storageCurrentProjectDetails);

            setProjectDetailsMessage.details.projectName = "default";

            console.log(setProjectDetailsMessage)

        }else{

            //Get project details from local storage
            let result = await chrome.storage.local.get([currentProjectName]);

            //Create new current project object    
            let currentProjectDetails = {[currentProjectName]: result[currentProjectName]};

            let storageCurrentProjectDetails = {"currentProject": currentProjectDetails};
            
            //Set new current project details
            await chrome.storage.local.set(storageCurrentProjectDetails);

            //Re retrieve current project to check for bugs
            let newResult = await chrome.storage.local.get(["currentProject"]);

            setProjectDetailsMessage.details.projectDetails = newResult["currentProject"];
            setProjectDetailsMessage.details.projectName = currentProjectName;
        }

        //Set details on popup view
        chrome.runtime.sendMessage(setProjectDetailsMessage);

        //Set content view to set current project

        chrome.tabs.sendMessage(currentID,
            setProjectDetailsMessage);
    };
});

//Listener detecting whether new project created

const newProjectDetailsMessage = new MessageTemplate("add-new-project-details", {
    projectDetails: {},
    projectList: []
})

//Add new project details to local storage
chrome.runtime.onMessage.addListener(async(request)=>{
    if(request.message === "add-project"){
        //Set new project details to local storage

        let checkResult = await chrome.storage.local.get([request.details.projectName])

        if (Object.keys(checkResult).length !== 0){

            console.log("Duplicate identified")
            //Add error message  for window
            return
        };

        newProjectDetailsMessage.details.projectDetails = request.details.projectDetails

        //Add new project to project name list in local storage, returns new list of projects in storage
        let projectList = await addToProjectList(request.details.projectName);

        newProjectDetailsMessage.details.projectList = projectList
        
        //Set new project to local storage, can be accessed elsewhere
        await chrome.storage.local.set(request.details.projectDetails);

        //Prompt action script to add new project details
        chrome.runtime.sendMessage(newProjectDetailsMessage)

        //Prompt content script to add new project details
        chrome.tabs.sendMessage(currentID, newProjectDetailsMessage);
    };
});

//Add tags message 

const updateTagsMessage = new MessageTemplate("update-tags", {
    tagsList: []
});

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request.message === "add-tag"){

        let allProjectsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjects = allProjectsRequest["allProjectDetails"];

    
        allProjects["allTags"].push(request.details.tagName);

        let allProjectDetailsUpdated = {
            allProjectDetails: allProjects
        }

        await chrome.storage.local.set(allProjectDetailsUpdated);

        updateTagsMessage.details.tagsList = allProjects["allTags"];

        chrome.runtime.sendMessage(updateTagsMessage);

        //Prompt content script to add new project details
        chrome.tabs.sendMessage(currentID, updateTagsMessage);

    }
});

//Delete tags message

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request.message === "delete-tag"){

        let allProjectsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjects = allProjectsRequest["allProjectDetails"]; 

        let indexToRemove = allProjects["allTags"].indexOf(request.details.tagName);


        allProjects["allTags"].splice(indexToRemove, 1);

        let allProjectDetailsUpdated = {
            allProjectDetails: allProjects
        }

        await chrome.storage.local.set(allProjectDetailsUpdated);

        updateTagsMessage.details.tagsList = allProjects["allTags"];


        chrome.runtime.sendMessage(updateTagsMessage);

        //Prompt content script to add new project details
        chrome.tabs.sendMessage(currentID, updateTagsMessage);

    }
});

//Delete projects message

const updateProjectDetailsMessage = new MessageTemplate("update-projects", {
    projectList : [],
    removeCurrentProjectTags: false
});

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request.message === "delete-project"){

        console.log(request);

        //Remove from all project details

        let allProjectsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjects = allProjectsRequest["allProjectDetails"]["allProjects"];

        let indexToRemove = allProjects.indexOf(request.details.projectName);

        allProjects.splice(indexToRemove, 1);

        allProjectsRequest["allProjectDetails"]["allProjects"] = allProjects;

        let updatedProjectDetails = {
            allProjectDetails: allProjectsRequest["allProjectDetails"]
        };

        console.log(updatedProjectDetails);

        await chrome.storage.local.set(updatedProjectDetails);

        //Remove project details

        await chrome.storage.local.remove([request.details.projectName]);

        //Check current project

        try{

            let currentProjectRequest = await chrome.storage.local.get(["currentProject"]);

            let currentProjectName = Object.keys(currentProjectRequest["currentProject"]);

            if(currentProjectName[0] === request.details.projectName){

                let currentProjectDetails = {
                    currentProject: null
                };

                await chrome.storage.local.set(currentProjectDetails);

                updateProjectDetailsMessage.details.removeCurrentProjectTags = true;
            };

        }catch(e){
            console.log(e);
            console.log("No current project set")
        }

        //Set project details
        updateProjectDetailsMessage.details.projectList = allProjects;

        chrome.runtime.sendMessage(updateProjectDetailsMessage);

        //Prompt content script to add new project details
        chrome.tabs.sendMessage(currentID, updateProjectDetailsMessage);

        //Delete all entries related to project
        VocabDatabase.removeProject(request.details.projectName)
    }

    //Update current project
})


const updateCurrentProjectTags = new MessageTemplate("update-current-tags", {
    tagsList:[]
})

//Upate current project tags

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request.message === "update-current-tags"){

        //Updating current project

        let currentProjectsRequest = await chrome.storage.local.get(["currentProject"]);

        let [currentProjectName] = Object.keys(currentProjectsRequest["currentProject"])

        let currentProjectDetails = currentProjectsRequest["currentProject"][currentProjectName]

        if (request.details.action === "add"){

            currentProjectDetails["tags"].push(request.details.tagName);

            let updatedCurrentProjectDetails = {[currentProjectName] : currentProjectDetails}

            let updatedCurrentProjectDetailsPush = {
                currentProject: updatedCurrentProjectDetails
            };

            await chrome.storage.local.set(updatedCurrentProjectDetailsPush)

            updateCurrentProjectTags.details.tagsList = currentProjectDetails["tags"]

            chrome.tabs.sendMessage(currentID, updateCurrentProjectTags);
            chrome.runtime.sendMessage(updateCurrentProjectTags);

        } else if (request.details.action = "delete"){

            console.log("hello world")

            let indexToRemove = currentProjectDetails["tags"].indexOf(request.details.tagName);

            currentProjectDetails["tags"].splice(indexToRemove, 1);

            let updatedCurrentProjectDetails = {[currentProjectName] : currentProjectDetails}

            let updatedCurrentProjectDetailsPush = {
                currentProject: updatedCurrentProjectDetails
            };

            await chrome.storage.local.set(updatedCurrentProjectDetailsPush);

            updateCurrentProjectTags.details.tagsList = currentProjectDetails["tags"]

            chrome.tabs.sendMessage(currentID, updateCurrentProjectTags)
            chrome.runtime.sendMessage(updateCurrentProjectTags)
        };

        //updating project with new tag information

        let projectRequest = await chrome.storage.local.get([currentProjectName]);

        let projectDetails = projectRequest[currentProjectName]

        console.log(request)

        if (request.details.action === "add"){

            projectDetails["tags"].push(request.details.tagName);

            let updatedCurrentProjectDetails = {[currentProjectName] : projectDetails}

            await chrome.storage.local.set(updatedCurrentProjectDetails);

        } else if (request.details.action === "delete"){

            console.log("hello world")

            let indexToRemove = projectDetails["tags"].indexOf(request.details.tagName);

            console.log(projectDetails)

            projectDetails["tags"].splice(indexToRemove, 1);

            let updatedCurrentProjectDetails = {[currentProjectName] : projectDetails}

            await chrome.storage.local.set(updatedCurrentProjectDetails)
        };

    }
})



//update current language

const updateCurrentLanguage = new MessageTemplate("update-current-language")

chrome.runtime.onMessage.addListener(async (request)=>{

    if (request.message=== "change-language" && request.details.type === "target"){

        try{
            //Get project details from local storage
            let result = await chrome.storage.local.get(["currentProject"]);

            let currentProject = result["currentProject"];

            let [currentProjectName] = Object.keys(currentProject)

            currentProject[currentProjectName].target_language = request.details.language;

            let storageCurrentProjectDetails = {"currentProject": currentProject};
            
            //Set new current project details
            await chrome.storage.local.set(storageCurrentProjectDetails);

            chrome.runtime.sendMessage(updateCurrentLanguage);

        } catch (e){
            console.log(e);
        }
    } else if (request.message=== "change-language" && request.details.type === "output"){

        try{
            //Get project details from local storage
            let result = await chrome.storage.local.get(["currentProject"]);

            let currentProject = result["currentProject"];

            let [currentProjectName] = Object.keys(currentProject)

            currentProject[currentProjectName].output_language = request.details.language;

            let storageCurrentProjectDetails = {"currentProject": currentProject};
            
            //Set new current project details
            await chrome.storage.local.set(storageCurrentProjectDetails);

            chrome.runtime.sendMessage(updateCurrentLanguage);

        } catch (e){
            console.log(e);
        };
    };
});

//Listen for load events on a tab page

chrome.tabs.onUpdated.addListener(async (updatedTab)=>{

    //Content scripts load when tabs are updated
    await chrome.tabs.sendMessage(updatedTab, {
        load:"load content"
    });
});

//Listen for new text to save in database 

chrome.runtime.onMessage.addListener((request)=>{

    if(request.message === "add-new-text"){

        VocabDatabase.openDatabase();

        let newText = request.details.details;

        VocabDatabase.addToDatabase(newText);
    }

});

//Listen for new database retrieval request

//Send  search results message

let searchResultsMessage = new MessageTemplate("display-results", {
    searchResults:[],
    tags:false
})

chrome.runtime.onMessage.addListener(async (request)=>{

    if(request.message === "fetch-data"){

        console.log(request)

        let searchTerms = request.details.searchTerms;

        if(searchTerms.searchType === "allTags"){

            let resultsList = [];

            for(let tag of searchTerms.tags){

                let results = await VocabDatabase.retrieveFromDatabase(searchTerms.searchType, tag);

                resultsList.push(results);

                console.log(results)

                console.log(resultsList)
            }

            searchResultsMessage.details.searchResults = resultsList
            searchResultsMessage.details.tags = true

            chrome.runtime.sendMessage(searchResultsMessage)

            let [newResultsList] = resultsList

            let currentDatabaseSearch = {
                currentDatabaseSearch: newResultsList
            };

            await chrome.storage.local.set(currentDatabaseSearch)

        } else if (searchTerms.searchType === "allLanguages"){

            let targetResults = await VocabDatabase.retrieveFromDatabase("targetLanguage", searchTerms.searchParameter);

            let outputResults = await VocabDatabase.retrieveFromDatabase("outputLanguage", searchTerms.searchParameter);

            let mergedResults = [];

            //Check first array

            for (let resultObject of targetResults){
                if (!mergedResults.some(object => resultObject.foreign_word === object.foreign_word)){

                    mergedResults.push(resultObject);
                };
            };

            for (let resultObject of outputResults){
                if (!mergedResults.some(object => resultObject.foreign_word === object.foreign_word)){

                    mergedResults.push(resultObject);
                };
            };


            searchResultsMessage.details.searchResults = mergedResults;
            searchResultsMessage.details.tags = false;

            chrome.runtime.sendMessage(searchResultsMessage)

            let currentDatabaseSearch = {
                currentDatabaseSearch: mergedResults
            };

            await chrome.storage.local.set(currentDatabaseSearch)


        } else {

            let results = await VocabDatabase.retrieveFromDatabase(searchTerms.searchType, searchTerms.searchParameter);

            searchResultsMessage.details.searchResults = results;
            searchResultsMessage.details.tags = false

            chrome.runtime.sendMessage(searchResultsMessage);

            let currentDatabaseSearch = {
                currentDatabaseSearch: results
            };

            await chrome.storage.local.set(currentDatabaseSearch)
        };
    };
});

chrome.runtime.onMessage.addListener(async(request)=>{

    if(request.message === "delete-entry"){

        let entryValue = request.details.value;

        VocabDatabase.removeFromDatabase(entryValue);

        //Review exported data

        let currentDatabaseSearchRequest = await chrome.storage.local.get(["currentDatabaseSearch"]);
        
        let currentDatabaseSearch = currentDatabaseSearchRequest["currentDatabaseSearch"];
    }
})


const translationMessage = new MessageTemplate("translation-result", {

    resultDetails: {},
    targetView: ""

});
//Deeply translateButton

chrome.runtime.onMessage.addListener(async (request)=>{

    if(request.message === "translate"){

        //Handle things like

        console.log(request)

        let translationTarget = request.details;

        let translationResponse = await DeeplTranslate.translate(translationTarget);

        //Handle network errors etc

        let translationResults = JSON.parse(translationResponse);

         //Encode message with response text
         translationMessage.details.resultDetails = translationResults;

         //Send translation message to correct view 
         translationMessage.details.targetView = request.details.targetView;

         chrome.runtime.sendMessage(translationMessage);
    };

});



  


/*
const result = fetch(
    "https://api-free.deepl.com/v2/translate", {
        method: "POST",
        mode: "no-cors",
        headers:{
            "Authorization": "Bearer 1f7407a3-4012-c272-4c4f-55d41925baf2:fx",
            "User-Agent": "Chrome/119.0.0.0",
            "Content-Type": "application/json" 
        },
        body: {
            "text":["Hello, world!"],
            "target_lang":"DE"
        }
    }
).then((response)=>{

    console.log(response)
})
*/





