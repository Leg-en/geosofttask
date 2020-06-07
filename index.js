const bodyParser = require('body-parser')
const express = require('express');
const mongodb = require('mongodb');
const port=80;

const app = express();

var busdata;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Bibliotheken Verfügbar machen
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet-fullscreen', express.static(__dirname + '/node_modules/leaflet-fullscreen/dist'));
app.use('/leaflet.markercluster', express.static(__dirname + '/node_modules/leaflet.markercluster/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/leaflet-draw', express.static(__dirname + '/node_modules/leaflet-draw/dist'));
/**
 * function which creates a Connection to MongoDB. Retries every 3 seconds if noc connection could be established.
 */
async function connectMongoDB() {
    try {
        //connect to database server
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
        //connect do database "itemdn"
        app.locals.db = await app.locals.dbConnection.db("pointdataset");
        console.log("Using db: " + app.locals.db.databaseName);
    }
    catch (error) {
        console.dir(error)
        setTimeout(connectMongoDb, 3000)
    }
}

app.listen(port,"0.0.0.0",
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


