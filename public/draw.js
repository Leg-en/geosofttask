//Hier wird ohne jegliche funktionen gearbeitet. Dieses skript wird direkt nach laden ausgeführt und stellt die geforderten Funktionalitäten bereit
var mymap = null;
var Token = sessionStorage.getItem("Token")
var sdata;
init()

function init() {
    var resource = "https://api.mapbox.com/tokens/v2?access_token=" + Token
    var req = new XMLHttpRequest();
    //Abfrage mag redundant wirken, sollte man den Key direkt eingeben ist sie aber gut.
    req.onload = function () {
        if (req.status == "200" && req.readyState == 4) {
            var response = JSON.parse(req.responseText);
            if (response.code == "TokenValid") {
                var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: Token
                })

                var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    maxZoom: 17,
                    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                });
                var Decimal = L.tileLayer('https://api.mapbox.com/styles/v1/{YOUR_USERNAME}/{YOUR_STYLE_ID}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> Style by <a href="https://www.mapbox.com/gallery/#decimal">Tristen Brown</a>',
                    maxZoom: 18,
                    YOUR_USERNAME: 'legen26',
                    YOUR_STYLE_ID: "ckacqf9zv0c111ilo4vip41m4",
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: Token
                })
                var Blueprint= L.tileLayer('https://api.mapbox.com/styles/v1/{YOUR_USERNAME}/{YOUR_STYLE_ID}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> Style by <a href="https://www.mapbox.com/gallery/#blueprint">Amy Lee Walton</a>',
                    maxZoom: 18,
                    YOUR_USERNAME: 'legen26',
                    YOUR_STYLE_ID: "ckacqrp6708et1io0pjy9la5h",
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: Token
                })
                var Satellit= L.tileLayer('https://api.mapbox.com/styles/v1/{YOUR_USERNAME}/{YOUR_STYLE_ID}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> ',
                    maxZoom: 18,
                    YOUR_USERNAME: 'mapbox',
                    YOUR_STYLE_ID: "satellite-streets-v11",
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: Token
                })

                var dark= L.tileLayer('https://api.mapbox.com/styles/v1/{YOUR_USERNAME}/{YOUR_STYLE_ID}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> ',
                    maxZoom: 18,
                    YOUR_USERNAME: 'mapbox',
                    YOUR_STYLE_ID: "dark-v10",
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: Token
                })

                mymap = L.map('mapid',{
                    layers: [mapbox]
                });
                mymap.setView([51.9606649, 7.6261347], 11);
                L.control.layers({
                    "Mapbox OSM" : mapbox,
                    "OpenTopoMap": OpenTopoMap,
                    "Decimal" : Decimal,
                    "Blueprint" : Blueprint,
                    "Sattelite" : Satellit,
                    "Darkmode" : dark
                }).addTo(mymap)





                var featureGroup = L.featureGroup().addTo(mymap);
                //Draw Control hinzufügen
                var drawControl = new L.Control.Draw({
                    draw: {
                        polyline: false,
                        polygon: false,
                        rectangle: false,
                        circle:  false,
                        marker: true
                    },
                    edit: {
                        featureGroup: featureGroup
                    }
                }).addTo(mymap);
                //Drawing als Layer hinzufügen
                mymap.on('draw:created', function (e) {

                    featureGroup.addLayer(e.layer);
                });
                //String Export
                document.getElementById('export').onclick = function (e) {

                    var data = featureGroup.toGeoJSON();
                    document.getElementById("out").innerHTML = JSON.stringify(data);


                }
                //Download Export
                document.getElementById('exportdown').onclick = function (e) {

                    var data = featureGroup.toGeoJSON();


                    var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

                    document.getElementById('exportdown').setAttribute('href', 'data:' + convertedData);
                    document.getElementById('exportdown').setAttribute('download', 'data.geojson');

                }
                document.getElementById("save").onclick = function(){
                    var data = featureGroup.toGeoJSON();
                    document.getElementById("out").innerHTML = JSON.stringify(data);

                    //Sendet datein

                    // Sending and receiving data in JSON format using POST method
//
                    $.ajax({
                        url: "/dataleaf",
                        type: 'POST',
                        contentType:'application/json',
                        data: JSON.stringify(data),
                        dataType:'json'
                    });
                }

                document.getElementById("savelocal").onclick = function(){
                    if (navigator.geolocation) { //Überprüft ob geolocation supportet wird
                        navigator.geolocation.getCurrentPosition(function (x) { //Wenn erfolgreich koordinaten ermittelt
                            var data = {
                                "type" : "Point",
                                "coordinates" : [x.coords.longitude, x.coords.latitude]
                            };
                            $.ajax({
                                url: "/datalocal",
                                type: 'POST',
                                contentType:'application/json',
                                data: JSON.stringify(data),
                                dataType:'json'
                            });


                        }, function (e) { //Bei fehler Tabelle ausblenden und Fehlermeldung einblenden
                           throw e;
                        });
                    } else {
                        //Falls geolocation nicht supportet, Fehlermeldung einblenden
                        throw "Unkown Error"
                }
                }

                //Ergänzt die Karte um einen Fullscreen Button
                mymap.addControl(new L.Control.Fullscreen());
            } else {
                document.getElementById("failalert").hidden = false;
                document.getElementById("failalert").innerText = "Kein API Key! Bitte auf anderer Seite Eingeben";
            }

        }
    }
    req.onerror = function () {
        document.getElementById("failalert").hidden = false;
        document.getElementById("failalert").innerText = "errorcallback: check web-console";
    }
    req.onreadystatechange = function () {
        console.log(req.status);
    }
    req.open("GET", resource, true);
    req.send();
    getData();
}
function getData(){
    var resource = "/gdata";
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 500,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    sdata = data;
                    configureSwitch();
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Error")
            }
        });
}
function del() {
    var selection = document.getElementById("switch");
    if(typeof parseInt(selection.value) == 'number'){
        $.ajax({
            url: "/del",
            type: 'POST',
            contentType:'application/json',
            data: JSON.stringify({
                "id" :  sdata[selection.value]._id
            }),
            dataType:'json'
        });
    }

}

function configureSwitch() {
    var selection = document.getElementById("switch");
    for(var i = 0; i < sdata.length; i++){
        var opt = document.createElement("option");
        opt.appendChild(document.createTextNode(sdata[i].coordinates[0]+ ", " + sdata[i].coordinates[1]))
        opt.value = i;
        selection.appendChild(opt);
    }
}

function geocoding() {
    var adress = $("#geocoding").val();
    var resource = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + adress + ".json?" + "autocomplete=true" + "language=de" + "&access_token=" + Token;



    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 500,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    $.ajax({
                        url: "/datalocal",
                        type: 'POST',
                        contentType:'application/json',
                        data: JSON.stringify(data.features[0].geometry),
                        dataType:'json'
                    });
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
               throw errorMessage
            }
        });
}


