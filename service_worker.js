

//General functions

async function addToProjectList(newProjectName){

    let detailsList = await chrome.storage.local.get(["allProjectDetails"]);

    let newAllProjectDetails = detailsList["allProjectDetails"]

    newAllProjectDetails["allProjects"].push(newProjectName);

    let allProjectDetails = {
        allProjectDetails: newAllProjectDetails
    }

    await chrome.storage.local.set(allProjectDetails);
};




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
                allLanguages: [],
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
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{

    if (request.message === "set-current-project"){

        //Extract project name from message
        let currentProjectName = request.details.currentProject;
        
        //Get project details from local storage
        let result = await chrome.storage.local.get([currentProjectName]);
            
        let currentProjectDetails = {[currentProjectName]: result[currentProjectName]};

        let storageCurrentProjectDetails = {"currentProject": currentProjectDetails};

        await chrome.storage.local.remove("currentProject");
        
        await chrome.storage.local.set(storageCurrentProjectDetails);

        let newResult = await chrome.storage.local.get(["currentProject"]);

        setProjectDetailsMessage.details.projectDetails = newResult["currentProject"];
        setProjectDetailsMessage.details.projectName = currentProjectName;

        //Set details on popup view
        chrome.runtime.sendMessage(setProjectDetailsMessage);

        //Set content view to set current project

        console.log(currentID)
        chrome.tabs.sendMessage(currentID,
            setProjectDetailsMessage);
    };
});

//Listener detecting whether new project created


const newProjectDetailsMessage = new MessageTemplate("add-new-project-details", {
    projectDetails: {}
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
        }

        newProjectDetailsMessage.details.projectDetails = request.details.projectDetails

        //Prompt action script to add new project details
        chrome.runtime.sendMessage(newProjectDetailsMessage)

        //Prompt content script to add new project details
        chrome.tabs.sendMessage(currentID,
            newProjectDetailsMessage);

        await addToProjectList(request.details.projectName);
        
        await chrome.storage.local.set(request.details.projectDetails);
    };
});


//Listen for load events on a tab page

chrome.tabs.onUpdated.addListener(async (updatedTab)=>{

    //Content scripts load when tabs are updated
    await chrome.tabs.sendMessage(updatedTab, {
        load:"load content"
    });
});

let currentID;

chrome.tabs.onActivated.addListener((result)=>{
    currentID = result.tabId;

})
