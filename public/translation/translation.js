export class DeeplTranslate {
  //No constructor necessary

  constructor() {}

  static #changeLanguageValue(target_lang, output_lang) {
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
      German: "DE",
    };

    let target_language_converted = languageObject[`${target_lang}`];
    let output_language_converted = languageObject[`${output_lang}`];

    return [target_language_converted, output_language_converted];
  }

  static translate(searchTerms) {
    return new Promise(async (resolve, reject) => {
      let [target_language, output_language] = this.#changeLanguageValue(
        searchTerms.targetLanguage,
        searchTerms.outputLanguage
      );

      // Get api key
      const { appid } = await chrome.storage.local.get(["appid"]);

      if (!appid) {
        reject({
          success: false,
          message: "No app id, generating...",
        });
        try {
          // Key for access to backend services
          const newIdKey = crypto.randomUUID();
          await chrome.storage.local.set({
            appid: newIdKey,
          });
        } catch (e) {
          console.log("Could not generate id key");
        } finally {
          return;
        }
      }

      let requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${appid}:vocab`),
        },
        body: JSON.stringify({
          source_lang: target_language,
          target_lang: output_language,
          text: searchTerms.targetText,
        }),
        signal: AbortSignal.timeout(2500),
      };

      // Ping backend server
      try {
        let apiResponse = await fetch(
          // "https://vocab-tracker-extension.onrender.com/translate",
          "http://localhost:3000/translate",

          requestOptions
        );

        const res = await apiResponse.text()
        console.log(res)
        console.log(apiResponse)

        if (!apiResponse.ok) {
          reject({ success: false });
          return;
        }
        let response = await apiResponse.json();

        //return translation which was nested in the retured response object
        resolve(response.translations[0]);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}
