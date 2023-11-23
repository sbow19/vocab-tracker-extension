/* Listener which creates the initial IndexedDB on first install. Deletes same
when uninstalled.
*/


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

/*Listen to delete project

chrome.runtime.onMessage.addListener((request)=>{


    chrome.tabs.query()
})

*/


/* Listen to search from other views so we can search and
store database search temporarily*/



//Listener that obtains current tab ID in any given moment.

let currentTabID;

chrome.tabs.onActivated.addListener((activeInfo)=>{
    currentTabID = activeInfo.tabId;
    console.log(currentTabID);
});


//Listen for load events on a tab page

chrome.tabs.onUpdated.addListener(async (updatedTab)=>{

    console.log(updatedTab)

    await chrome.tabs.sendMessage(updatedTab, {
        load:"load content"
    })

});