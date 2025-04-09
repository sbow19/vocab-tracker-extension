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
        tx.commit();
      };

      getAllRequest.onerror = (ev) => {
        reject(ev.target.error);
        tx.abort();
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

      let projectToSet;

      if (project === "default") {
        projectToSet = {
          id: "default",
          name: "default",
          default_target_language: "Spanish",
          default_output_language: "Spanish",
          tags: "[]",
          entries: "{}",
        };
      } else {
        projectToSet = project;
      }

      const setRequest = store.put(projectToSet, 0);

      setRequest.onsuccess = (ev) => {
        const result = ev.target.result;

        resolve(result);
      };

      setRequest.onerror = (ev) => {
        reject(ev.target.error);
      };
    });
  }

  static updateCurrentProject(project) {
    return new Promise(async (resolve, reject) => {
      await VocabDatabase.openDatabase();

      const tx = VocabDatabase.database.transaction(
        ["currentProject", "projects"],
        "readwrite"
      );

      const currentProjectStore = tx.objectStore("currentProject");
      const projectsStore = tx.objectStore("projects");

      const setRequest = currentProjectStore.put(project, 0);

      setRequest.onsuccess = (ev) => {
        // Update currnt project in projectModels
        const putModelRequest = projectsStore.put(project);

        putModelRequest.onsuccess = (ev) => {
          resolve(ev);
          tx.commit();
          return;
        };

        putModelRequest.onerror = () => {
          reject(false);
          tx.abort();
          return;
        };
      };

      setRequest.onerror = (ev) => {
        reject(ev.target.error);
        tx.abort();
        return;
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
            ["projects", "currentProject"],
            "readwrite"
          );
          const projectsStore = tx.objectStore("projects");
          const currentProjectStore = tx.objectStore("currentProject");

          // Get project by id
          const getProjectRequest = projectsStore.get(data.projectId);

          getProjectRequest.onsuccess = (ev) => {
            // Project object
            const result = ev.target.result;
            const entries = JSON.parse(result.entries);
            entries[data.id] = data;
            result.entries = JSON.stringify(entries);

            // Overwrite the current
            const addRequest = projectsStore.put(result);

            addRequest.onsuccess = (ev) => {
              const getCurrentProjectRequest = currentProjectStore.get(0);

              getCurrentProjectRequest.onsuccess = (ev) => {
                const result = ev.target.result;

                if (result.id !== data.projectId) {
                  resolve(true);
                  tx.commit();
                  return;
                }

                const entries = JSON.parse(result.entries);
                entries[data.id] = data;
                result.entries = JSON.stringify(entries);

                const currentProjectPutRequest = currentProjectStore.put(result, 0);

                currentProjectPutRequest.onsuccess = ()=>{
                  resolve(true)
                  tx.commit()
                  return
                }
                currentProjectPutRequest.onerror = ()=>{
                  reject(false)
                  tx.abort()
                  return
                }
              };

              getCurrentProjectRequest.onerror = () => {
                tx.abort();
                reject(false);
                return;
              };
            };
            addRequest.onerror = (ev) => {
              reject(ev);
              tx.abort();
              return;
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
                  tx.commit();
                  return;
                }

                const deleteCRequest = currentProjectStore.delete(0);
                deleteCRequest.onsuccess = (e) => {
                  resolve(e);
                  tx.commit();
                };
                deleteCRequest.onerror = (e) => {
                  reject(e);
                  tx.abort();
                };
              };

              currentProjectRequest.onerror = (ev) => {
                reject(ev);
                tx.abort();
              };
            };

            deleteRequest.onerror = (ev) => {
              reject(ev);
              tx.abort();
            };
          }
          break;
        case "tag":
          // Remove tags from all projects and current project
          {
            const tx = VocabDatabase.database.transaction(
              ["tags", "projects", "currentProject"],
              "readwrite"
            );

            const projectsStore = tx.objectStore("projects");
            const tagsStore = tx.objectStore("tags");
            const currentProjectStore = tx.objectStore("currentProject");

            // Delete tag by key
            const deleteTagRequest = tagsStore.delete(data);

            deleteTagRequest.onsuccess = (ev) => {
              //Start current project check
              const currentProjectRequest = currentProjectStore.get(0);

              currentProjectRequest.onsuccess = (ev) => {
                const result = ev.target.result;
                if (result) {
                  // remove tag from currentProject and replace
                  const parsedTags = JSON.parse(result.tags);
                  const filtered = parsedTags.filter((tag) => {
                    if (tag.id === data) return false;
                    return true;
                  });
                  result.tags = JSON.stringify(filtered);
                }
                const replaceRequest = currentProjectStore.put(result, 0);

                replaceRequest.onsuccess = (e) => {
                  //Start current project check
                  const allProjectsRequest = projectsStore.getAll();

                  allProjectsRequest.onsuccess = (ev) => {
                    const projectArray = ev.target.result;
                    let i = 0;
                    putNext();

                    // Recursively cycle through list, calling the next iteration after a success
                    function putNext() {
                      if (i < projectArray.length) {
                        // Set single project
                        const parsedTags = JSON.parse(projectArray[i].tags);

                        projectArray[i].tags = JSON.stringify(
                          parsedTags.filter((singleTag) => {
                            if (singleTag.id === data) return false;
                            return true;
                          })
                        );
                        const newPutRequest = projectsStore.put(
                          projectArray[i]
                        );

                        newPutRequest.onsuccess = putNext;
                        newPutRequest.onerror = (e) => {
                          reject(e);
                          tx.abort();
                          return;
                        };

                        i += 1;
                      } else {
                        resolve(true);
                        tx.commit();
                        return;
                      }
                    }
                  };

                  allProjectsRequest.onerror = (e) => {
                    reject(e);
                    tx.abort();
                  };
                };
                replaceRequest.onerror = (e) => {
                  reject(e);
                  tx.abort();
                };
              };

              currentProjectRequest.onerror = (ev) => {
                reject(ev);
                tx.abort();
              };
            };

            deleteTagRequest.onerror = (ev) => {
              reject(ev);
              tx.abort();
              return;
            };

            // Delete tag from current, if exists
          }
          break;
        case "entry":
          {
            const tx = VocabDatabase.database.transaction(
              ["projects", "currentProject"],
              "readwrite"
            );

            const projectsStore = tx.objectStore("projects");
            const currentProjectStore = tx.objectStore("currentProject");

            // Find entry by project id
            const projectStoreGetRequest = projectsStore.get(data.projectId);

            projectStoreGetRequest.onsuccess = (ev) => {
              const result = ev.target.result;
              const entries = JSON.parse(result.entries);
              delete entries[data.id];
              result.entries = JSON.stringify(entries);

              const projectPutRequest = projectsStore.put(result);

              projectPutRequest.onsuccess = (ev) => {
                const currentStoreRequest = currentProjectStore.get(0);

                currentStoreRequest.onsuccess = (e) => {
                  const currentProject = e.target.result;

                  if (currentProject.id !== data.projectId) {
                    resolve(e);
                    tx.commit();
                    return;
                  }

                  const currentProjectEntries = JSON.parse(
                    currentProject.entries
                  );
                  delete currentProjectEntries[data.id];
                  currentProject.entries = JSON.stringify(
                    currentProjectEntries
                  );

                  const currentStorePut =
                    currentProjectStore.put(currentProject);
                  currentStorePut.onsuccess = (ev) => {
                    resolve(ev);
                    tx.commit();
                    return;
                  };
                  currentStorePut.onerror = (ev) => {
                    reject(ev);
                    tx.abort();
                    return;
                  };
                };

                currentStoreRequest.onerror = (e) => {
                  reject(ev);
                  tx.abort();
                };
              };

              projectPutRequest.onerror = (ev) => {
                tx.abort();
                reject(ev);
                return;
              };
            };

            projectStoreGetRequest.onerror = (ev) => {
              reject(ev);
              tx.abort();
            };
          }
          break;
        default:
          reject(false);
          break;
      }
    });
  }
}
