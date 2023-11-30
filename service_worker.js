

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

        let db;

        const request = indexedDB.open("VocabTrackerDatabase", 1);

        request.onerror = (event)=>{

            console.error("indexeddb failed to start");

        }

        request.onupgradeneeded = (event) =>{
            
            db = event.target.result;

            //Create the object store only one per profiel at this stage, as
            //This should be manageable

            const objectStore = db.createObjectStore("vocab_default",  {


                //Keys set to increasing values.
                autoIncrement: true
            
            });


            //The object store will contain key-value pairs, whereby the value
            //is some object with various properties.
            //The properties for each object is indexed by the below


            //Create index to search by project number

            objectStore.createIndex("project", "project");

            //Create index to search by language

            objectStore.createIndex("language", "language");

            //Create index on tags
            objectStore.createIndex("tags", "tags");

            //Create index on foreign word
            objectStore.createIndex("foreign_word", "foreign_word", {
                unique: true
            });

            //Create index on translated word
            objectStore.createIndex("translated_word", "translated_word");

            //Create object on url
            objectStore.createIndex("url", "url");

            //Verify that the transaction was completed
            objectStore.transaction.oncomplete = (event) =>{

                console.log("object store created");

            }
        }

        request.onsuccess = (event)=>{

            db = event.target.result;

            console.log("object store loaded")

            //add error handler here
        }
    }
});

chrome.runtime.onInstalled.addListener(async(details)=>{

    if(details.reason === "install"){

        let allProjectDetails = 
        {  allProjectDetails: {
                allProjects: [],
                allLanguages: ["Spanish", "English", "German"],
                allURLs: [],
                allTags: []
            }
        };

        await chrome.storage.local.set(allProjectDetails);
    };
});

chrome.storage.local.onChanged.addListener((result)=>{
    console.log(result)
})

/*Listen to delete project

chrome.runtime.onMessage.addListener((request)=>{


    chrome.tabs.query()
})

*/

//Listen to when content scripts are loaded to ensure


/* Listen to search from other views so we can search and
store database search temporarily*/


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

        if(currentProjectName === "`default`"){
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
chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
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

        console.log(request)

        //Remove from all project details

        let allProjectsRequest = await chrome.storage.local.get(["allProjectDetails"]);

        let allProjects = allProjectsRequest["allProjectDetails"]["allProjects"];

        indexToRemove = allProjects.indexOf(request.details.projectName);

        allProjects.splice(indexToRemove, 1);

        allProjectsRequest["allProjectDetails"]["allProjects"] = allProjects;

        let updatedProjectDetails = {
            allProjectDetails: allProjectsRequest["allProjectDetails"]
        };

        console.log(updatedProjectDetails)

        await chrome.storage.local.set(updatedProjectDetails);

        //Remove project details

        await chrome.storage.local.remove([request.details.projectName]);

        //Check current project

        try{

            let currentProjectRequest = await chrome.storage.local.get(["currentProject"]);

            let currentProjectName = Object.keys(currentProjectRequest["currentProject"]);

            if(currentProjectName[0] === request.details.projectName){

                let currentProjectdetails = {
                    currentProject: null
                };

                await chrome.storage.local.set(currentProjectdetails);

                updateProjectDetailsMessage.details.removeCurrentProjectTags = true
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

            chrome.tabs.sendMessage(currentID, updateCurrentProjectTags)

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



//Listen for load events on a tab page

chrome.tabs.onUpdated.addListener(async (updatedTab)=>{

    //Content scripts load when tabs are updated
    await chrome.tabs.sendMessage(updatedTab, {
        load:"load content"
    });
});