
//Add context menu
chrome.contextMenus.create({
    contexts: ["selection"],
    title: "Vocab Tracker: save selected text",
    visible: true,
    id: "contextMenu"
});


chrome.runtime.onMessage.addListener(
    function(request){
        if (request.changePopup === "change"){

            changePopup();

        };
    }
)

function changePopup(){
    chrome.action.setPopup(
        {
            popup:"popup/alt_popups/traduc_popup.html"
        }
    )
}
