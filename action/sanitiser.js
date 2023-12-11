export class Sanitiser{

    constructor(){};

    //Add logic here to check initial values like length, and whether there are unpermitted characters. Returns boolean

    static checkTranslationInput(inputString){


        let cleanInputString = inputString.trim();

        console.log(cleanInputString.length)

        if(cleanInputString.length <= 200){

            return true

        } else if (cleanInputString.length > 200){

            return false
        }
    };

    //Logic to alter for CSV output where text 
    static async cleanCSVOutputText(){

    };


}