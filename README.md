# Vocab Tracker Extension

Highlight, translate, and save vocabulary on the web as you go along.

Save content in projects and give content tags for better search flexibility.

Leverage DeepL API to translate text.

The extension is now available for free on the Chrome Web Store for trialing. 


## Goals

- Allow users to highlight text on a webpage, get an immediate translation, and save the content
for future reference. 
- Implement a CRUD application with a GUI, allowing user to save, search, and delete content collected
from the web


## Demo Videos

## Project Structure

- I divided the project into a backend directory and frontend directory. 

- The frontend directory holds all the code related to the Chrome 
Extension itself. The frontend is divided further into code related to the action popup, the service worker, and the content scripts.

- The backend is a minimal http server implementation using Node's http module, deployed on Render.
The backend receives requests from extensions to translate short snippets of text. The extension then does some validation, checks the users id and rate limiting information (stored in minimal SQLite database), and then attempts to retrieve the translation from the DeepL API.


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
- Winston

## Next Steps

- Deploy to Chrome Web Store

