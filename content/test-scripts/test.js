class Views {

    constructor(){
            
    }
    //Change the current view;

    
    xPos = null;
    yPos = null;
    currentView = "none";
    
    

    static changeView(newView){
            if (newView === "none"){
                this.currentView.style.display = "none";

            }else{
                this.currentView.style.display = "none";
                this.currentView = newView;
                Views.viewPosition(newView);
                this.currentView.style.display = "flex";
            }
        }

    //Set view on start up to bubble view but without display. Becomes target of ChangeView later
        
    static setView(view){

        this.currentView = view

        };


    static appendView(view){
        let body = document.querySelector("body");
        view.style.display = "none"
        body.appendChild(view);
    }

    static viewPosition(view){

        view.style.position = "absolute"
        view.style.top = `${Views.yPos}px`
        view.style.left = `${Views.xPos}px`

    }

    setElements(keyElements){

        //If user supplies list of elemnents, then this function parses those
        //and assigns to the object those elements by name.

        //Need to add condition checking the length of the keyElements paramter

        if (keyElements){
            let elements = {}

            let elementEntriesList = Object.entries(keyElements)

            for (let entry of elementEntriesList) {
                let [elementName, elementId] = entry;
                elements[elementName] = elementId;
            }

            return  elements

        } else {
            return
            
        }
    }
}

class BubbleView extends Views {

    constructor (baseView, keyElements) {
        super();
        let elements = this.setElements(keyElements)
        this.elements = elements;
        this.view = baseView;

    };
    
};

class TranslationView extends Views {

    constructor (baseView, keyElements) {
        super();
        let elements = this.setElements(keyElements)
        this.elements = elements;
        this.view = baseView;
    };
}


//Popup bubble object

const popupBubbleView = document.createElement("div");

popupBubbleView.innerHTML = `
<section class="popup-bubble-wrapper">
    <div class="popup-bubble-icon-container" title="Translate" >
        <img class="popup-icon" id="popup-bubble">
    </div>
</section>`
;

const popupBubbleObject = new BubbleView(popupBubbleView, 
    {
        mainButton:"popup-bubble"
    });

//Main translation popup object

const translationPopup = document.createElement("div");

translationPopup.innerHTML = `
<div class="extension-wrapper" id="extension-wrapper">

    <main class="content-wrapper" id="content-wrapper">


        <!--Translation popup view-->

        <section class="translation-view-wrapper"
                id="translation-view">

                <div class="translation-input-output-wrapper">

                    <div class="translation-view-title-wrapper">
                        <span class="translation-view-title">Translate!</span>
                    </div>

                    <div class="translation-input-output-wrapper-inner">
                        <div class="translation-input-text-wrapper">
                            <textarea name="" id="" cols="50" rows="3" placeholder="Input language"></textarea>
                        </div>
                        <div class="translation-output-text-wrapper">
                            <textarea name="" id="translation-output" cols="50" rows="3" placeholder="Output language"></textarea>
                        </div>
                    </div>

                </div>


                <div class="translation-parameters-wrapper">
                    <ul class="translation-parameters-list">
                        <li class="translation-parameter-language-wrapper">
                            <div class="translation-parameter-language-title-wrapper">
                                <span class="translation-parameter-language-title">Select Language</span>
                            </div>
                            <div class="translation-parameter-language-set-wrapper">
                                <select name="" id="translation-parameter-language-set">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="de">German</option>
                                </select>
                            </div>
                        </li>
                        <li class="translation-parameter-project-wrapper">
                            <div class="translation-parameter-project-title-wrapper">
                                <span class="translation-parameter-project-title">Select Project</span>
                            </div>
                            <div class="translation-parameter-project-set-wrapper">
                                <select name="" id="translation-parameter-project-set">
                                    <option value="default">Default</option>
                                    <option value="project 1">Project 1</option>
                                    <option value="project 2">Project 2</option>
                                </select>
                            </div>
                        </li>
                        <li class="translation-parameter-tags-wrapper"></li>
                        <li class="translation-parameter-save-wrapper">
                            <button class="vocab-button translation-parameter-save-button" id="translation-save">Save</button>
                        </li>
                    </ul>

                </div>


        </section>


    </main>
</div>`;

const translationPopupObject = new TranslationView(translationPopup, {
    output: "translation-output",
    language: "translation-parameter-language-set",
    project: "translation-parameter-project-set",
    saveButton: "translation-save"
})


//The main htmls need to be added before listeners can be added
document.addEventListener("DOMContentLoaded", ()=>{

        //listener to check for mouse location

        let xPos;
        let yPos; 

        document.addEventListener("mousemove", (event)=>{

            xPos = event.clientX + document.documentElement.scrollLeft;
            yPos = event.clientY + document.documentElement.scrollTop;
        
            Views.xPos = xPos;
            Views.yPos = yPos;
        
        })

        //When the DOM has loaded, the script appends all the views to the current page and sets the current view to the pop up bubble

        Views.appendView(popupBubbleObject.view);
        Views.appendView(translationPopupObject.view);
        Views.setView(popupBubbleObject.view);

        let selectionString;
        let translationViewClicked = false;
        let bubbleViewClicked = false;
        

        document.addEventListener("mouseup", ()=>{

            let selectionObject = window.getSelection();
            selectionString = selectionObject.toString();
            selectionString = selectionString.trim()


            if (selectionString.length > 0 && bubbleViewClicked == false){
                Views.changeView(popupBubbleObject.view);
                bubbleViewClicked = true;
                
            } else if (selectionString.length > 0 && translationViewClicked == false) {
                Views.changeView("none");
                bubbleViewClicked = false;
            } 

        });

        
        document.getElementById(popupBubbleObject["elements"]["mainButton"]).addEventListener("click", ()=>{
            Views.changeView(translationPopupObject.view);

            translationViewClicked = true;
            bubbleViewClicked = false;

        })

        document.getElementById(translationPopupObject["elements"]["saveButton"]).addEventListener("click", ()=>{
            Views.changeView("none")
            translationViewClicked = false;
            console.log(document.getElementById(translationPopupObject["elements"]["output"]).value)
            //Execute database code
        })

        document.addEventListener("dblclick", ()=>{
            Views.changeView("none");
            translationViewClicked = false;
        })
})
