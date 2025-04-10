import { logger } from "../logger/logger";

const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("vocab");

// Create the table if it does not exist
db.run(
  `
    CREATE TABLE IF NOT EXISTS operations (
        id TEXT PRIMARY KEY UNIQUE,
        last_operation INTEGER,
        number_of_characters INTEGER
    );
  `,
  (err) => {
    if (err) {
      logger.error(`Error creating table:, ${err.message}`);
    } else {
      logger.info("Table created successfully or already exists.");

      // Create the trigger to update last_operation on row update
      db.run(
        `
      CREATE TRIGGER IF NOT EXISTS update_last_operation
      AFTER UPDATE ON operations
      FOR EACH ROW
      BEGIN
          UPDATE operations
          SET last_operation = CURRENT_TIMESTAMP
          WHERE id = OLD.id;
      END;
    `,
        (err) => {
          if (err) {
            logger.error(`Error creating trigger:, ${err.message}`);
          } else {
            logger.info("Trigger created successfully or already exists.");
          }
        }
      );
    }
  }
);



export default db;
