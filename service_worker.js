//Listener which creates the initial IndexedDB on first installment. 

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