"use strict"
const fs = require('fs');
const mongoose = require('mongoose');
const ERRORS = require('errors');
const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
var serveStatic = require('serve-static');

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
const STRING_CONNECT = "mongodb+srv://Admin:Padellino69@cluster0-iz04p.mongodb.net/test?retryWrites=true&w=majority";
const PARAMETERS = {
    useNewUrlParser: true,
     useUnifiedTopology: true
};



//Server launch
const app = express();
const corsOptions = {
    origin: true,
    credentials: true
  }

app.use(serveStatic(path.join(__dirname, 'dist')))

var port = process.env.PORT || 8888
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.listen(port)
console.log('server started ' + port);


app.get("/",function(req,res,next){
    res.writeHead(200);
    res.end("HOME");
});

app.post("/api/test",function(res,req,next){
        res.contentType("application/json");  
        res.send({"ris":"PROVA"});
});

// API LOGIN
app.post("/api/login",function(req,res,next){
    //console.log(req);
    console.log(req.body.user);
    let username = req.body.user.split('.');
    let password = req.body.pwd;
    console.log(username[0]+"+"+username[1]+"+"+username[2])
    console.log(username);
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err){
            res.send({"ris":"err"})
        }
        else {
            const DB = client.db('App');
            let collection = DB.collection('User');
                collection.findOne({ "_id.nome": username[0],"_id.cognome": username[1],"_id.codice": parseInt(username[2])}, function(err, dbUser) {
                    if (err){
                        res.send({"ris":"err"})}
                    else {
                        if (dbUser == null){
                            console.log("Errore dbuser");
                            res.contentType("application/json");  
                            res.send({"ris":"errUser"})
                        }
                        else {  
                            if (dbUser.pwd != password){                                
                                console.log("Errore dbpwd");
                                res.contentType("application/json");  
                                res.send({"ris":"errPwd"})
                            }
                            else {           
                                console.log("Accesso eseguito");
                                res.contentType("application/json");                 
                                res.send({"ris":"ok","rank":dbUser.rank});
                            }
                        }
                    }
                    client.close();
                });
            }      
    });
});

//API QR
const QRcode = require("qr-image");
function createNewQRCode(){
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err) throw err;
        const DB = client.db('App');
        let data = new Date();
        let QrCode = { data: data, codice: Math.random(100) };
        DB.collection("QRCode").insertOne(QrCode, function(err, res) {
          if (err) throw err;
          console.log("Nuovo QR Inserito");
          client.close();
        });
    });
}

app.get("/api/newQRCode",function(req,res,next){
    createNewQRCode();
});

app.get("/api/QRCode",function(req,res,next){     
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err){
            res.send({"ris":"err"})
        }
        else {
            const DB = client.db('App');
            let collection = DB.collection('QRCode');
            collection.findOne(
                {},
                { sort: { _id: -1 } },
                (err, data) => {
                         var QRCode = require('qrcode');
                         console.log(JSON.stringify(data));
                         QRCode.toDataURL(JSON.stringify(data), function (err, url) {
                            res.end("<!DOCTYPE html/><html><head><title>QRCode</title></head><body><img witdh='25%' height='25%' src='" + url + "'/></body></html>");
                          });  
                     });          
            }          
    });    
});

app.post("/api/QRCheck",function(req,res,next){
    console.log("QRUS pre: "+req.body.id);
    console.log("DataUS pre: "+req.body.codice);
    console.log("Impiegato pre: "+req.body.user);
    let QRCodeId = req.body.id;
    let QRCodeCodice = req.body.codice;
    let idImpiegato = req.body.user;
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err){
            res.send({"ris":"err"})
        }
        else {
            const DB = client.db('App');
            let collection = DB.collection('QRCode');
            collection.findOne(
                {},
                { sort: { _id: -1 } },
                (err, data) => {
                    console.log("QRDB: "+data._id);
                    console.log("QRUS: " + QRCodeId );
                    console.log("DataDB: " + data.codice);
                    console.log("DataUS: " + QRCodeCodice);
                   if(data._id == QRCodeId && data.codice == QRCodeCodice ){
                       console.log("PreInsert");
                       insertLog(QRCodeId,idImpiegato);

                       res.contentType("application/json");                
                       res.send({"ris":"ok"});
                   }else{
                       console.log("Errore data");
                       res.contentType("application/json");  
                       res.send({"ris":"err"});
                   }
                },
              );
            
            }  
         
    });
        
});

function insertLog(QRCodeId,idImpiegato){
    console.log("Funzione");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err){
            console.log(err);
        }
        else {
            let oraLog = new Date();
            const DB = client.db('App');
            let collection = DB.collection('Log');
            collection.insertOne({"oraLog":oraLog,"idImpiegato":idImpiegato,"idQRcode":QRCodeId},function(err) {
                if (err) console.log(err);
                else
                    console.log("Nuovo LogInserito");
                client.close();
        });
    }
});
}


//API Calendario

app.post("/api/calendario", function(req,res){
    let idImpiegato = req.body.idImpiegato;
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        if (err){
            res.send({"ris":"err"});
        }
        else {
            const DB = client.db('App');
            let collection = DB.collection('QRCode');
            collection.find(
                {"idImpiegato": idImpiegato},
                (err, data) => {
                    if (err) res.send({"ris":"err"});
                      else{
                        res.send(JSON.stringify(data));
                      }
                   
                },
              );
            
            }          
    });
});
