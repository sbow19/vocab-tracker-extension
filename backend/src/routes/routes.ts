import http from "http";
import url from "url";
import db from "../db/db";
import { logger } from "../logger/logger";

export function decode(req, res) {
  let parsedURL = url.parse(req.url, true);
  let path = parsedURL.pathname;
  // Contains cors mode and BASIC auth key
  let headers = req.headers;

  // GET or POST
  let method = req.method.toLowerCase();

  // In POST methods
  let chunks = [];
  req.on("data", function (chunk) {
    chunks.push(chunk);
  });

  req.on("end", function () {
    // Convert chunks to body
    const buffer = Buffer.concat(chunks); // combine all chunks
    const jsonString = buffer.toString("utf8"); // convert to string
    const body = JSON.parse(jsonString); // parse to JSON

    // Get listener callback
    let route =
      typeof routes[path] !== "undefined" ? routes[path] : routes["/notfound"];

    // Pass data to route
    let data = {
      path: path,
      headers: headers,
      method: method,
      body: body,
      userRow: req.userRow,
      url: req.url,
    };

    // Pass request data to middleware
    route(data, res);
  });
}

const routes = {
  "/translate": async function (data, res: http.ServerResponse) {
    // Fetch some content from Deepl API
    let response;

    // Route logger
    const routeLogger = logger.child({
      appid: data.userRow.id
    })

    // Get text
    const lenOfText = data.body.text.length;

    if (data.userRow.number_of_characters - lenOfText < 0) {
      routeLogger.warn({
        message: "Max number of character usage reached",
      });

      res.setHeader("Content-Type", "application/json");
      res.writeHead(403);
      res.write(
        JSON.stringify({
          success: false,
          message: "No characters left",
        })
      );
      res.end("\n");
      return;
    }

    const fetchOptions = {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [data.body.text],
        source_lang: data.body.source_lang,
        target_lang: data.body.target_lang,
      }),
    };

    try {
      response = await fetch(
        "https://api-free.deepl.com/v2/translate",
        fetchOptions
      );
    } catch (e) {
      response = e;

      routeLogger.error({
        message: "Unable to fetch data from Deepl",
        res: e,
        options: fetchOptions,

      });

      res.setHeader("Content-Type", "text/html");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(500);
      res.write(`${response.status}`);
      res.end("\n");
      return;
    }

    // TEST locatino for updating db
    const date = new Date().getTime();
    db.run(
      "UPDATE operations SET last_operation = ?, number_of_characters = ? WHERE id = ?;",
      [date, data.userRow.number_of_characters - lenOfText, data.userRow.id],
      (err) => {
        if (err) {
          routeLogger.warn({
            message: "Failed to update db"
          })
        }else{
          routeLogger.warn({
            message: "DB update successful"
          })
        }
      }
    );

    if (!response.ok) {
      routeLogger.error({
        message: "Unable to fetch data from Deepl",
        appid: data.userRow.id,
        options: fetchOptions,
        response: {
          status: response.status,
          statusText: response.statusText,
        },
      });
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(500);
      res.write(`${response.status}`);
      res.end("\n");
    } else {
      const resBod = await response.json();
      
      routeLogger.info({
        message: "Data fetched successfully",
        data: resBod,
        options: fetchOptions,
      });

      // Handle db update here and parse result text
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200);
      res.write(JSON.stringify(resBod));
      res.end("\n");
    }
  },
  "/notfound": function (data, res) {
    logger.info({
      message: "Incorrect URL",
      url: data.url,
    });
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(404);
    res.write("<h1>Page not found</h1>");
    res.end("\n");
  },
};

export default routes;
