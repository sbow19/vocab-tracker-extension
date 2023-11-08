import { generateTranslation } from "./modules/translation_popup.js";

// Add main_button content

const body = document.querySelector("body");
const element = document.createElement("div");

//Hover button style
element.style.border = "black solid 1px";
element.style.borderRadius = "10px"
element.style.position = "absolute";
element.style.display = "none";
element.style.backgroundColor = "rgba(255, 255, 255)";
element.style.padding = "3px";
element.style.margin = "auto";
element.style.width = "25px";
element.style.height = "25px"; 

//Creates popup button when text highlighted
function createSelectButton(){

    let selection = document.getSelection();
    let selectionString = selection.toString();

    if (selectionString.trim() === ""){
        element.style.display = "none";
        return
    }else{
        console.log(selectionString);
        //Add function here to send message to the Chrome Extenson
    }

    //Place the button somewhere on the screen.
    element.style.left = `${xPos}px`;
    element.style.top = `${yPos}px`;
    element.style.display = "block";

    body.appendChild(element);
}

//Determines mouse position, values passed to create popup button
let xPos, yPos; 

document.addEventListener("mousemove", (e)=>{
    xPos = e.pageX + 10;
    yPos = e.pageY + 10;
    console.log(`${xPos, yPos}`); 
})

document.addEventListener("mouseup", createSelectButton);

//code to generate pop up transalation box on click
element.addEventListener("click", (event)=>{
    
    //hide button
    element.style.display = "none";

    //display new element in page
    const translationPopup = generateTranslation()

    translationPopup.style.display = "block";
    element.style.left =  event.pageX;
    element.style.top = event.pageY;

});

