"use strict"
const fs = require('fs');
const mongoose = require('mongoose');
const ERRORS = require('errors');
const path = require('path');

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
    useNewUrlParser: true
};

// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");



var serveStatic = require('serve-static')


app.use(serveStatic(path.join(__dirname, 'dist')))

var port = process.env.PORT || 8888
app.listen(port)
console.log('server started ' + port);

app.get("/",function(req,res,next){
    res.writeHead(200);
    res.end("HOME");
});
app.get("/prova",function(req,res){
    console.log("prova");
})
// API LOGIN
app.post("/api/login",function(res,req,next){
    console.log("API LOGIN")
    let username = req.body.user.split('.');
    let password = req.body.pwd;
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
                            res.send({"ris":"errUser"})
                        }
                        else {  
                            if (dbUser.pwd != password){                                
                                console.log("Errore dbpwd");
                                res.send({"ris":"errPwd"})
                            }
                            else {           
                                console.log("Accesso eseguito");               
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
        if (err) console.log(err);
        const DB = client.db('App');
        let data = new Date()
        let QrCode = { data: data, codice: Math.random(100) };
        DB.collection("QRCode").insertOne(QrCode, function(err, res) {
          if (err) throw err;
          console.log("Nuovo QR Inserito");
          client.close();
        });
         
    });
}


/*
QRcode.toString('{"nome":"aaaaa","cognome":"bbbbb"}',{type:'terminal'}, function (err, url) {
    //console.log(url)
  })
*/
app.get("/api/newQRCode",function(req,res,next){
    console.log("NEEE");
    createNewQRCode();
});



app.get("/api/QRCode",function(req,res,next){ 
    //res.sendFile(path.join(__dirname+'/qrcode/qrcode.html'));
    
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
                    
                        var code = QRcode.image(JSON.stringify(data), { type: 'png', ec_level: 'H', size: 10, margin: 0 });
                        res.setHeader('Content-type', 'image/png');
                        code.pipe(res);
                      
                   
                },
              );
            
            }  
         
    });
    
});
app.post("/api/QRCheck",function(req,res,next){
    let QRCode;
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
                   if(data._id == QRCode && data.data == QRCode ){
                       insertLog(QrCode);
                       res.send({"ris":"ok"});
                   }else{
                       res.send({"ris":"err"});
                   }
                },
              );
            
            }  
         
    });
});

function insertLog(data){

}
