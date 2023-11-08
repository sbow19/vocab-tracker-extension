
export function generateTranslation(){

    //Creating outer wrapper element, wherein innerHtml is injected
    const translationPopup = document.createElement("div");

    translationPopup.style.position = "absolute"

    translationPopup.innerHTML(`
    <body>
    <header class="header-banner translation-popup">
        <div>
            <section id="logo-container">
                Hello World!
            </section>
        </div>
    </header>

    <main>
        <div class="body-banner" id="target-text-wrapper">
            <div id="target-text">
                <span> This is where</span>
            </div>
        </div>

        <div class = "body-banner"
        id="translated-text-wrapper">
            <label for="output-text"> Change preferred translation</label>
            <input type="text" id="output-text" value="" placeholder="placeholder"> 
        </div>

        <div class="suggested-translation-wrapper">

            <!-- hover to generate drop down of suggested translations from Deepl, plus contexts-->
            <div class="suggested-translation-text">
                <span 
                class="suggested-translations" id="suggested-translations"> Suggested translations </span>
            </div>
        </div>
    </main>

    <footer class="footer-banner translation-popup">
        <section class="footer-wrapper">
            <ul class="footer-list">
                <li>
                    <button class="vocab-tracker-button" id="translate-button" value="translate"> 
                    Translate
                    </button>
                </li>
                <li>
                    <button class="vocab-tracker-button" id="save-button">
                        Save
                    </button>
                </li>
                <li>
                    <button class="vocab-tracker-button">
                        Change Language
                    </button>
                </li>
            </ul>
        </section>
    </footer>
    `
    );
    
    return translationPopup
};