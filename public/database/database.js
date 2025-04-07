export class VocabDatabase {
  constructor() {}

  //Static variables
  static database = null;

  static openDatabase() {
    return new Promise((resolve, reject) => {
      let db;
      const request = indexedDB.open("VocabTrackerDatabase", 1);

      request.onerror = (event) => {
        console.error("indexeddb failed to start");
        reject(event);
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;

        /**
         * Project shape:
         *  id: string
         *  name: string (unique)
         *  default_target_language: string
         * default_output_language: string
         *  entries: EntryModel
         *
         * Entry Model Shape
         *  id: string
         *  target_language: string
         *  target_text: string
         *  output_language: string
         *  output-text: string
         *  url: string
         *  tags: TagsModel
         */
        const projectsStore = db.createObjectStore("projects", {
          keyPath: "id",
        });

        projectsStore.createIndex("name", "name", {
          unique: true,
        });

        /**
         * Tag  store object shape:
         *  d: string
         *  name: string (unique)
         */
        const tagsStore = db.createObjectStore("tags", {
          keyPath: "id",
        });

        tagsStore.createIndex("name", "name", {
          unique: true,
        });

        /**
         *  CurrentProject data shape:
         *      id: string
         *      name: string (unqiue)
         *      target_language: string
         *      output_language: string
         */
        db.createObjectStore("currentProject", {
          autoIncrement: true,
        });
      };

      request.onsuccess = (event) => {
        // Database object available throughout lifetime of action
        VocabDatabase.database = event.target.result;

        resolve("Database opened successfully");
      };
    });
  }

  static async addToDatabase(newTranslation) {
    // let tx = await VocabDatabase.#makeTransaction("readwrite");

    let store = tx.objectStore("vocab_default");

    let request = store.add(newTranslation);
  }

  static async removeFromDatabase(entryValue) {
    return new Promise(async (resolve, reject) => {
      // let tx = await VocabDatabase.#makeTransaction("readwrite");

      let store = tx.objectStore("vocab_default");

      let request = store.delete(entryValue);

      request.onsuccess = (ev) => {
        resolve(ev.target.result);
        console.log(ev.target.result);
      };

      request.onerror = (err) => {
        reject(err);
        console.log(err);
      };
    });
  }

  static retrieveFromDatabase(searchType, searchParameters) {
    return new Promise(async (resolve, reject) => {
      // let tx = await VocabDatabase.#makeTransaction("readonly");

      let store = tx.objectStore("vocab_default");

      if (searchType === "allProjects") {
        let range = IDBKeyRange.only(searchParameters);

        let index = store.index("project");

        let request = index.getAll(range);

        request.onsuccess = (ev) => {
          console.log(request.result);

          resolve(request.result);
        };

        request.onerror = (err) => {
          console.log(err);
          reject(err);
        };
      }

      if (searchType === "allURLs") {
        let range = IDBKeyRange.only(searchParameters);

        let index = store.index("url");

        let request = index.getAll(range);

        request.onsuccess = (ev) => {
          console.log(request.result);

          resolve(request.result);
        };

        request.onerror = (err) => {
          console.log(err);
          reject(err);
        };
      }

      if (searchType === "targetLanguage") {
        let range = IDBKeyRange.only(searchParameters);

        let index = store.index("target_language");

        let request = index.getAll(range);

        request.onsuccess = (ev) => {
          console.log(request.result);

          resolve(request.result);
        };

        request.onerror = (err) => {
          console.log(err);
          reject(err);
        };
      }

      if (searchType === "outputLanguage") {
        let range = IDBKeyRange.only(searchParameters);

        let index = store.index("output_language");

        let request = index.getAll(range);

        request.onsuccess = (ev) => {
          console.log(request.result);

          resolve(request.result);
        };

        request.onerror = (err) => {
          console.log(err);
          reject(err);
        };
      }

      if (searchType === "allTags") {
        console.log(searchParameters);

        let index = store.index("tags");

        let range = IDBKeyRange.only(searchParameters);

        let request = index.getAll(range);

        request.onsuccess = (ev) => {
          console.log(ev.target.result);

          resolve(ev.target.result);
        };
      }
    });
  }

  static async removeProject(projectName) {
    let request = await VocabDatabase.#getIndexValues(projectName);
    for (let entry of request) {
      let result = await VocabDatabase.removeFromDatabase(entry.foreign_word);
    }
  }

  static async #getIndexValues(projectName) {
    return new Promise(async (resolve, reject) => {
      let store = tx.objectStore("vocab_default");

      let index = store.index("project");

      let range = IDBKeyRange.only(projectName);

      let request = index.getAll(range);

      request.onsuccess = (ev) => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        reject(err);
      };
    });
  }

  static exportSearch() {}

  /**
   *
   * @param {"tags" | "projects" | "currentProject"} dataType Fetch all entries of desired content
   */
  static getAll(dataType) {
    return new Promise(async (resolve, reject) => {
      await VocabDatabase.openDatabase();

      const tx = VocabDatabase.database.transaction(dataType, "readonly");

      const store = tx.objectStore(dataType);

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = (ev) => {
        const result = ev.target.result;

        resolve(result);
      };

      getAllRequest.onerror = (ev) => {
        reject(ev.target.error);
      };
    });
  }

  static setCurrentProject(project) {
    return new Promise(async (resolve, reject) => {
      await VocabDatabase.openDatabase();

      const tx = VocabDatabase.database.transaction(
        "currentProject",
        "readwrite"
      );

      const store = tx.objectStore("currentProject");

      const setRequest = store.put(project, 0);

      setRequest.onsuccess = (ev) => {
        const result = ev.target.result;

        resolve(result);
      };

      setRequest.onerror = (ev) => {
        reject(ev.target.error);
      };
    });
  }

  static addItem(dataType, data) {
    return new Promise(async (resolve, reject) => {
      await VocabDatabase.openDatabase();

      switch (dataType) {
        case "add-project": {
          const tx = VocabDatabase.database.transaction(
            "projects",
            "readwrite"
          );
          const projectStore = tx.objectStore("projects");

          const addRequest = projectStore.add(data);

          addRequest.onsuccess = (ev) => {
            resolve(ev.target);
          };

          addRequest.onerror = (ev) => {
            reject(ev.target);
          };

          break;
        }
        case "add-tag": {
          const tx = VocabDatabase.database.transaction("tags", "readwrite");
          const tagsStore = tx.objectStore("tags");

          const addRequest = tagsStore.add(data);

          addRequest.onsuccess = (ev) => {
            resolve(ev.target);
          };

          addRequest.onerror = (ev) => {
            reject(ev.target);
          };
          break;
        }
        case "add-entry": {
          const tx = VocabDatabase.database.transaction(
            "projects",
            "readwrite"
          );
          const projectsStore = tx.objectStore("projects");

          // Get project by id
          const getProjectRequest = projectsStore.get(data.projectId);

          getProjectRequest.onsuccess = (ev) => {
            // Project object
            const result = ev.target.result;

            result["entries"][data.id] = data;

            // Overwrite the current
            const addRequest = projectsStore.put(result);

            addRequest.onsuccess = (ev) => {
              resolve(ev);
            };
            addRequest.onerror = (ev) => {
              reject(ev);
            };
          };

          getProjectRequest.onerror = (ev) => {
            reject(ev.target);
          };
          break;
        }
      }
    });
  }

  static deleteItem(dataType, data) {
    return new Promise(async (resolve, reject) => {
      await VocabDatabase.openDatabase();

      switch (dataType) {
        case "project":
          {
            const tx = VocabDatabase.database.transaction(
              ["projects", "currentProject"],
              "readwrite"
            );

            const store = tx.objectStore("projects");
            const currentProjectStore = tx.objectStore("currentProject");

            // Delete project by key
            const deleteRequest = store.delete(data);

            deleteRequest.onsuccess = (ev) => {
              //Start current project check
              const currentProjectRequest = currentProjectStore.get(0);

              currentProjectRequest.onsuccess = (ev) => {
                const result = ev.target.result;

                if (result.id !== data) {
                  resolve(ev);
                  tx.commit()
                  return;
                }

                const deleteCRequest = currentProjectStore.delete(0);
                deleteCRequest.onsuccess = (e) => {
                  resolve(e);
                  tx.commit()
                };
                deleteCRequest.onerror = (e) => {
                  reject(e);
                  tx.abort()
                };
              };

              currentProjectRequest.onerror = (ev) => {
                reject(ev);
                tx.abort()
              };
            };

            deleteRequest.onerror = (ev) => {
              reject(ev);
              tx.abort()
            };
          }
          break;
      }
    });
  }
}
