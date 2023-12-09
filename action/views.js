//Class to store state of views

export class View{

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
        current.setDisplay("none")
    
        View.currentView = newView
        newView.setDisplay("flex");
        
    }

    setDisplay(value){
        this.view.style.display = value;
    };

}