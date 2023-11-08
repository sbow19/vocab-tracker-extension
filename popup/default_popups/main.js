//change view based on button click

const viewsList = {
    main_menu_view: $("#main_menu_view"),
    statistics_view: $("#statistics_view"),
    translation_view: $("#translation_view")
};

class viewChooser {

    constructor(viewsList){
        this.viewsList = viewsList;
        this.currentView = null;
        console.log(this.viewsList)
    }

    loadView(buttonViewValue){
        this.currentView.css("display", "none");
        this.currentView = this.viewsList[buttonViewValue];
        this.currentView.css("display", "block");
    };

    loadInitialView(){
        this.currentView = this.viewsList["main_menu_view"];
        console.log(this.currentView)
        this.currentView.css("display", "block");
    }
};

//instantiate viewChooserObject
const viewChooserObject = new viewChooser(viewsList);

//Loads main menu on the first click

$(document).on("DOMContentLoaded", ()=>{
    viewChooserObject.loadInitialView();
});

//event listeners on buttons
const testButtonTrans = $("#test_button_trans");
const testButtonStats  = $("#test_button_stats");
const send = $("#send");
let popupViewValue;

testButtonTrans.on("click", (event)=>{
    popupViewValue = event.target.value;
    viewChooserObject.loadView(popupViewValue);
});

testButtonStats.on("click", (event)=>{
    popupViewValue = event.target.value;
    viewChooserObject.loadView(popupViewValue);
});


send.on("click", (event)=>{
    popupViewValue = event.target.value;
    viewChooserObject.loadView(popupViewValue);
});








