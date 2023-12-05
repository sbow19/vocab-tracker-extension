export class VocabDatabase{
    //No constructor needed
    constructor(){}

    //Static variables
    static{
        this.database = null
    };
    
    static openDatabase(){

        return new Promise((resolve, reject)=>{

            let db;

            const request = indexedDB.open("VocabTrackerDatabase", 1);

            request.onerror = (event)=>{

                console.error("indexeddb failed to start");
                reject(event)

            }

            request.onupgradeneeded = (event) =>{
                
                db = event.target.result;

                //Create the object store only one per profiel at this stage, as
                //This should be manageable

                if(!db.objectStoreNames.contains("vocab_default")){

                    const objectStore = db.createObjectStore("vocab_default",  {


                        //Keys set to increasing values.
                        keyPath: "foreign_word"
                    
                    });

                    //The object store will contain key-value pairs, whereby the value
                    //is some object with various properties.
                    //The properties for each object is indexed by the below


                    //Create index to search by project number
                    objectStore.createIndex("project", "project", {unique:false});

                    //Create index to search by target language
                    objectStore.createIndex("target_language", "target_language", {unique:false});

                    //Create index to search by output language
                    objectStore.createIndex("output_language", "output_language", {unique:false});

                    //Create index on tags
                    objectStore.createIndex("tags", "tags", {
                        unique:false,
                        multiEntry: true
                    });

                    //Create index on translated word
                    objectStore.createIndex("translated_word", "translated_word", {unique:false});

                    //Create object on url
                    objectStore.createIndex("source_url", "source_url", {unique:false});

                    //Create index on base_url
                    objectStore.createIndex("base_url", "base_url", {unique:false});

                    //create index on everything

                    //Verify that the transaction was completed
                    objectStore.transaction.oncomplete = (event) =>{
                        console.log("object store created");
                        
                    };
                };
            };

            request.onsuccess = (event)=>{
                VocabDatabase.database = event.target.result;
                console.log("object store loaded")

                resolve("Database opened successfully");
                //add error handler here
            };
        })
    };

    static #makeTransaction(mode){

        return new Promise(async (resolve, reject)=>{

            await VocabDatabase.openDatabase()

            let tx = VocabDatabase.database.transaction("vocab_default", `${mode}`)

            tx.oncomplete = (ev)=>{

                console.log(ev)

            };

            tx.onerror = (err) =>{

                console.warn(err)

            };

            resolve(tx);
        })

    }

    static async addToDatabase(newTranslation){

        let tx = await VocabDatabase.#makeTransaction("readwrite");

        let store = tx.objectStore("vocab_default");

        let request = store.add(newTranslation);
    };

    static async removeFromDatabase(entryValue){
        return new Promise(async (resolve, reject)=>{

            let tx = await VocabDatabase.#makeTransaction("readwrite");

            let store = tx.objectStore("vocab_default");

            let request = store.delete(entryValue);

            request.onsuccess = (ev)=>{
                resolve(ev.target.result)
                console.log(ev.target.result)

            }

            request.onerror = (err)=>{

                reject(err)
                console.log(err)

            }
        })

    };


    static retrieveFromDatabase(searchType, searchParameters){
        return new Promise(async (resolve, reject)=>{

            console.log(searchType)

            let tx = await VocabDatabase.#makeTransaction("readonly");

            let store = tx.objectStore("vocab_default");

            if(searchType === "allProjects"){

                let range = IDBKeyRange.only(searchParameters)

                let index = store.index("project")

                let request = index.getAll(range)

                request.onsuccess = (ev)=>{

                    console.log(request.result)

                    resolve(request.result)
                };

                request.onerror = (err)=>{
                    console.log(err);
                    reject(err)
                };
            };

            if(searchType === "allURLs"){

                let range = IDBKeyRange.only(searchParameters)

                let index = store.index("url")

                let request = index.getAll(range)

                request.onsuccess = (ev)=>{

                    console.log(request.result)

                    resolve(request.result)  
                };

                request.onerror = (err)=>{
                    console.log(err);
                    reject(err)
                };
            };

            if(searchType === "targetLanguage"){

                let range = IDBKeyRange.only(searchParameters);

                let index = store.index("target_language");

                let request = index.getAll(range)

                request.onsuccess = (ev)=>{

                    console.log(request.result)

                    resolve(request.result)
                };

                request.onerror = (err)=>{
                    console.log(err);
                    reject(err)
                };
            };

            if(searchType === "outputLanguage"){

                let range = IDBKeyRange.only(searchParameters);

                let index = store.index("output_language");

                let request = index.getAll(range)

                request.onsuccess = (ev)=>{

                    console.log(request.result)

                    resolve(request.result)
                };

                request.onerror = (err)=>{
                    console.log(err);
                    reject(err)
                };

            };

            if(searchType === "allTags"){

                console.log(searchParameters);

                let index = store.index("tags")

                let range = IDBKeyRange.only(searchParameters)

                let request = index.getAll(range)

                request.onsuccess = (ev)=>{

                    console.log(ev.target.result)

                    resolve(ev.target.result)
                };
            };
        });
    };

    static clearSearch(){};

    static async removeProject(projectName){

        let request = await VocabDatabase.#getIndexValues(projectName)

        for (let entry of request){

            let result = await VocabDatabase.removeFromDatabase(entry.foreign_word);

            console.log(result);

        }

        console.log(request)

    };

    static async #getIndexValues(projectName){
        return new Promise(async(resolve, reject)=>{

            let tx = await VocabDatabase.#makeTransaction("readwrite");

            let store = tx.objectStore("vocab_default");

            let index = store.index("project")

            let range = IDBKeyRange.only(projectName);

            let request = index.getAll(range);

            
            request.onsuccess = (ev)=>{

                resolve(request.result)
            };

            request.onerror =(err)=>{

                reject(err)
            }
        })

    }

    static exportSearch(){};

}

