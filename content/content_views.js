//Translation popup bubble

const popupBubble = document.createElement("div");

popupBubble.innerHTML(`
<section class="popup-bubble-wrapper">
    <div class="popup-bubble-icon-container" title="Translate">
        <img src="../assets/translation-icon.png" class="popup-icon">
    </div>
</section>`
);

//Main translation popup

const translationPopup = document.createElement("div");

translationPopup.innerHTML(`
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
</div>`);