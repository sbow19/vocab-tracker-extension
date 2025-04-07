export class DeeplTranslate{

    //No constructor necessary

    constructor(){};

    static #changeLanguageValue(target_lang, output_lang){

        let languageObject = {
            Bulgarian: "BG",
            Czech: "CS",
            Danish: "DA",
            Greek: "EL",
            Estonian: "ET",
            Finnish: "FI",
            French: "FR",
            Hungarian: "HU",
            Indonesian: "ID",
            Italian: "IT",
            Japanese: "JA",
            Korean: "KO",
            Lithuanian: "LT",
            Latvian: "LV",
            Norwegian: "NB",
            Dutch: "NL",
            Polish: "PL",
            Portuguese: "PT",
            Romanian: "RO",
            Russian: "RU",
            Slovak: "SK",
            Slovenian: "SL", 
            Swedish: "SV",
            Turkish: "TR",
            Ukrainian: "UK",
            Chinese: "ZH",
            Spanish: "ES",
            English: "EN",
            German: "DE"
        };

        let target_language_converted = languageObject[`${target_lang}`];
        let output_language_converted = languageObject[`${output_lang}`];

        return [target_language_converted, output_language_converted]
    }


    static async translate(searchTerms){

        return new Promise(async(resolve, reject)=>{

            console.log(searchTerms);

            let [target_language, output_language] = this.#changeLanguageValue(searchTerms.targetLanguage, searchTerms.outputLanguage);

            let requestOptions = {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    source_lang: target_language,
                    target_lang: output_language,
                    text: searchTerms.targetText

                })
            };

            console.log(requestOptions)

            try{
                let apiResponse = await fetch('http://149.100.159.55:3000/api', requestOptions);
                
                let response = await apiResponse.json();

                console.log(response)

                //return translation which was nested in the retured response object
                resolve(response.translations[0]);
        
            }catch (error) {
                console.error(error);
                reject(error);
            }
        })
    }
};