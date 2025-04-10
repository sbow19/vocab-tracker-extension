import http from 'http'
import process from 'process'
import db from "./db/db"
import { decode } from './routes/routes';
import { logger } from './logger/logger';

// According to Render docs, a server must bind to a port at 0.0.0.0
// API_KEY, PORT, and HOST envs are here
import 'dotenv/config'


// Routes
const server = http.createServer();
server.listen(process.env.PORT, process.env.MYHOST, ()=>{
    // logger.log("info", `LIstening to ${process.env.PORT}`)
})

/**
 *  Main router callback. Handles initial processing of request. 
 */
server.on("request", (req, res)=>{
    
    // Contains cors mode and BASIC auth key
    let headers = req.headers
    logger.log("info", headers)

    // GET or POST
    let method = req.method.toLowerCase();
    if(method !== "post"){
        res.setHeader("Content-Type", "application/json")
        res.writeHead(404)
        res.write(JSON.stringify({
            success: false,
            message: "Invalid HTTP method. Must be POST"
        }))
        res.end("\n")
        return
    }

    // Parse header
    const auth = headers.authorization;

    let appid

    try{
        const base64Credentials = auth.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        [appid] = credentials.split(':');
    }catch(e){
        
        logger.warn({
            message: "Unable to parse header",
            auth: auth
        })

        res.setHeader("Content-Type", "application/json")
        res.writeHead(404)
        res.write(JSON.stringify({
            success: false,
            message: "Could not parse header"
        }))
        res.end("\n")
        return

    }

    // Check SQL db for key
    db.get("SELECT * FROM operations WHERE id = ?;", [appid], function(err, row){
        if(row){
            // Check rate throttle
            const oldDate = row.last_operation
            const date = new Date().getTime()

            // 5 seconds delay per translation
            if((date - oldDate) < 5000){

                logger.warn({
                    appid: appid,
                    timeLeft: (date-oldDate),
                })

                res.setHeader("Content-Type", "application/json")
                res.writeHead(429)
                res.write(JSON.stringify({
                    success: false,
                    message: "Rate limited"
                }))
                res.end("\n")
                return
            }

            // Check usage

            req.userRow = row
            
            decode(req, res)


        }else {
            const date = new Date().getTime()

            db.run("INSERT INTO operations (id, last_operation, number_of_characters) VALUES (?, ?, ?);", [appid,  date, process.env.CHARSMAX], function(err){
               
                req.userRow = {
                    id: appid,
                    lastOperation: date,
                    number_of_characters: process.env.CHARSMAX
                }

                logger.info({
                    appid: appid,
                    message: "New user created"
                })

                decode(req, res)
            })
        }

    });



})

