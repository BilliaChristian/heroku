"use strict"
const fs = require('fs');
const mongoose = require('mongoose');
const ERRORS = require('errors');

// code 600 - database connection error
ERRORS.create({
    code: 600,
    name: 'DB_CONNECTION',
    defaultMessage: 'An error occured when connecting to database'
});

// code 601 - query execution error
ERRORS.create({
    code: 601,
    name: 'QUERY_EXECUTE',
    defaultMessage: 'An error occured during the query execution'
});
const HTTPS = require('https');

// mongo
const MONGO_CLIENT = require("mongodb").MongoClient;
const STRING_CONNECT = 'mongodb://127.0.0.1:27017';
const PARAMETERS = {
    useNewUrlParser: true,
   // useUnifiedTopology: true
};

// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");



/* ************************************************************ */
const privateKey = fs.readFileSync("keys/private.key", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = {"key":privateKey, "cert":certificate};
// avvio server
const TIMEOUT = 30; // 60 SEC
let pageNotFound;

const http = require('http');
var httpsServer = HTTPS.createServer(credentials,app);
httpsServer.listen(8888, '127.0.0.1', function() {
    console.log("Server running");
});


app.use("/",function(req,res,next){
    res.writeHead(200);
    res.end("HOME");
});

// API LOGIN
app.post("/api/login",function(res,req,next){
    let username = req.body.user.split('.');
    let password;

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            const DB = client.db('app');
                collection.findOne({ "_id.nome": username[0],"_id.cognome": username[1],"_id.codice": username[2],}, function(err, dbUser) {
                    if (err)
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    else {
                        if (dbUser == null){
                            console.log("Errore dbuser");
                            error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {  
                            if (dbUser.password != password){                                
                                console.log("Errore dbpwd");
                                error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                            }
                            else {           
                                console.log("Accesso eseguito")                     
                                res.send({"ris":"ok"});
                            }
                        }
                    }
                    client.close();
                });
            }  
         
    });
});

//API QR
const QRcode = require("qrcode");
function createNewQRCode(){
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err) throw err;
        let dbo = db.db("App");
        let data = new Date()
        let QrCode = { data: data, codice: Math.random(100) };
        dbo.collection("customers").insertOne(QrCode, function(err, res) {
          if (err) throw err;
          console.log("Nuovo QR Inserito");
          db.close();
        });
         
    });
}



QRcode.toString('{"nome":"aaaaa","cognome":"bbbbb"}',{type:'terminal'}, function (err, url) {
    console.log(url)
  })
app.use("api/QRCode",function(req,res,next){

});
app.use("api/QRCheck",function(req,res,next){

});