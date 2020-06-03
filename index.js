const bodyParser = require('body-parser')
const express = require('express');
const mongodb = require('mongodb');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const port=80;

const app = express();

var busdata;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/**
 * function which creates a Connection to MongoDB. Retries every 3 seconds if noc connection could be established.
 */
async function connectMongoDB() {
    try {
        //connect to database server
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });
        //connect do database "itemdn"
        app.locals.db = await app.locals.dbConnection.db("pointdataset");
        console.log("Using db: " + app.locals.db.databaseName);
    }
    catch (error) {
        console.dir(error)
        setTimeout(connectMongoDb, 3000)
    }
}

app.listen(port,
    () => console.log(`Example app listening at http://localhost:${port}`)
)
//Start connecting
connectMongoDB()

app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
});
app.get('/draw', (req,res) => {
    res.sendFile(__dirname + '/draw.html')
});

app.get('/gdata', (req,res) => {
    app.locals.db.collection("usercollection").find({}).toArray(((mongoError, result) => {
        if (mongoError) throw mongoError;
        res.json(result)

    }))
});

app.post('/del', (req,res) => {
    res.send({ status: 'SUCCESS' });
    var id = req.body. id;
    app.locals.db.collection("usercollection").deleteOne({
        "_id" : new mongodb.ObjectID(id)
    }, (error,  result) => {
        if (error) throw  error

    })
});
/**
 * Anfrage an den Server mit den Busdaten. Wird gespeichert und für anfragen wieder raus gegeben.
 * Ist bestimmt nicht wirklich sinnvoll. Aber beim Programmieren der Seite hat sich  gezeigt das der Server mti den Busdaten gelgentlich nicht mehr Antwortet. Also speichere ich hier die daten zwischen.
 * In einer Produktiv umgebung müsste man es noch gelgentlich Aktualisieren. Jedoch reicht das hier für unsere Zwecke
 */
app.get('/busdata', (req, res) => {
if(busdata != null){
    res.json(busdata)
}else{
    var resource = "https://rest.busradar.conterra.de/prod/haltestellen";
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    res.json(data);
                    busdata = data;
                }},
            error : function () {
                res.send({status: 'ERROR'})
            }
        });
}
})

app.post('/setdata', (req,res) => {
    console.dir(req.body)
    if(req.body.type == "Point"){
        app.locals.db.collection('usercollection').insertOne(req.body);
        res.send({ status: 'SUCCESS' });
    }else if(req.body.type == 'FeatureCollection'){
        for (var i = 0; i < req.body.features.length; i++){
            app.locals.db.collection('usercollection').insertOne(req.body.features[i].geometry)
        }
        res.send({ status: 'SUCCESS' });
    }
    //Würde gerne ne Fehlermeldung senden. Aber keine ahnung was der richtige Status ist
    //Todo: Status Meldung erstellen für fehler

})


