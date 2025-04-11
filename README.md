# Vocab Tracker Extension (Google Chrome only)

![Highlighted text from Globo - src: https://ge.globo.com/ce/futebol/libertadores/noticia/2025/04/11/libertadores-cbf-pedira-vitoria-do-fortaleza-a-conmebol-apos-caos-em-santiago.ghtml](https://raw.githubusercontent.com/sbow19/vocab-tracker-extension/main/Screenshot.png)

Highlight, translate, and save vocabulary on the web as you go.

Save content in projects and add tags for better search flexibility.

Leverage DeepL API to translate text.

The extension is currently being reviewed before being published to the Chrome Web Store.

To use the extension, follow these steps:

1. Clone or download this repository to your local machine.
```bash 
git clone https://github.com/sbow19/vocab-tracker-extension.git 
```
2. Launch Google Chrome browser on your machine.

3. In the Chrome browser, type chrome://extensions/ in the address bar and press Enter.

4. At the top right of the Extensions page, toggle Developer mode to ON.

5. Click the Load unpacked button. In the file picker that appears, navigate to the public folder in the cloned repository and select it.

6. The extension will now be loaded in Chrome and should appear in your toolbar or Extensions page.


## Goals

- Allow users to highlight text on a webpage, get an immediate translation, and save the content
for future reference. 

- Implement a CRUD application with a GUI, allowing user to save, search, and delete content collected
from the web.


## Demo Videos

-[Create a project and tags](https://vimeo.com/1074720576)

-[Translate content as you go](https://vimeo.com/1074720640)

-[Search content and export to JSON](https://vimeo.com/1074720610)


## Project Structure

- I divided the project into a backend directory and frontend directory. 

- The frontend directory holds all the code related to the Chrome 
Extension itself. The frontend is divided further into code related to the action popup, the service worker, and the content scripts.

- The backend is a minimal http server implementation using Node's http module, deployed on Render.
The backend receives requests from extensions to translate snippets of text. The backend does some validation, checks the users id and rate limiting information, and then attempts to retrieve the translation from the DeepL API.


## Technologies

### Frontend/Chrome Extension Portion
- JavaScript, CSS, HTML.
- Chrome and Browser APIs.
- IndexedDB.

### Backend
- TypeScript.
- Node.
- Node http module.
- Deployment via Render.
- SQLite3.
- Winston.


## Next Steps

- Deploy to Chrome Web Store and gather feedback.
- Improve UI and display options. 
- Implement extension in Edge, Firefox, and Safari.

