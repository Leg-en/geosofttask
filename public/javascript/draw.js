//Hier wird ohne jegliche funktionen gearbeitet. Dieses skript wird direkt nach laden ausgeführt und stellt die geforderten Funktionalitäten bereit
var mymap = null;
var marker;
var Token = sessionStorage.getItem("Token")
var sdata;
var  overlay = null;
init()

/**
 * Initialisierungs funktion. Überprüft token und stößt aufbau der seite bzw Karte an
 */
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
                var layers = L.control.layers({
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
                        marker: true,
                        circlemarker: false
                    },
                    edit: {
                        featureGroup: featureGroup
                    }
                }).addTo(mymap);
                //Drawing als Layer hinzufügen
                mymap.on('draw:created', function (e) {

                    featureGroup.addLayer(e.layer);
                });


                //Ergänzt die Karte um einen Fullscreen Button
                mymap.addControl(new L.Control.Fullscreen());
                //Ergänzt Custombuttons
                mymap.addControl( createCustomControl("Exportiere als GeoJSON Text", "Export Text", function () {
                    var data = featureGroup.toGeoJSON();
                    document.getElementById("out").innerHTML = JSON.stringify(data);
                }, 'blue'));
                mymap.addControl(createCustomControl("Downloade GeoJSON", "Download JSON", function () {
                    var data = featureGroup.toGeoJSON();

                    var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

                    var container = document.getElementById("container");
                    $('<a href="data:' + convertedData + '" id="download" download="data.json">download JSON</a>').appendTo('#container');
                    var download = document.getElementById("download");
                    download.click();
                    container.removeChild(download);


                }, 'pink'));
                mymap.addControl(createCustomControl("Speichere Punkt auf Server", "Save to Server", ()=>{
                    var data = featureGroup.toGeoJSON();
                    document.getElementById("out").innerHTML = JSON.stringify(data);

                    //Sendet datein

                    // Sending and receiving data in JSON format using POST method
                    $.ajax({
                        url: "/setdata",
                        type: 'POST',
                        contentType:'application/json',
                        data: JSON.stringify(data),
                        dataType:'json'
                    },  'white');
                    getData();
                }));
                mymap.addControl(createCustomControl("Lokalisiere mit Browser", "Lokalisiere", ()=>{
                    if (navigator.geolocation) { //Überprüft ob geolocation supportet wird
                        navigator.geolocation.getCurrentPosition(function (x) { //Wenn erfolgreich koordinaten ermittelt
                            var data = {
                                "type" : "Point",
                                "coordinates" : [x.coords.longitude, x.coords.latitude]
                            };
                            $.ajax({
                                url: "/setdata",
                                type: 'POST',
                                contentType:'application/json',
                                data: JSON.stringify(data),
                                dataType:'json'
                            });
                            getData();


                        }, function (e) { //Bei fehler Tabelle ausblenden und Fehlermeldung einblenden
                            throw e;
                        });
                    } else {
                        //Falls geolocation nicht supportet, Fehlermeldung einblenden
                        throw "Unkown Error"
                    }
                },  'pink'))

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

/**
 * Ruft die Punkte von der Datenbank ab.
 */
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

/**
 * Löscht punkte aus der datenbank
 */
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
    getData();

}

/**
 * Erstellt den Select für die Auswahl der Punkte
 */
function configureSwitch() {
    var selection = document.getElementById("switch");
    selection.innerHTML = "";
    var opt = document.createElement("option");
    opt.appendChild(document.createTextNode("Mögliche Punkte"));
    opt.value = "";
    selection.appendChild(opt);
    for(var i = 0; i < sdata.length; i++){
        var opt = document.createElement("option");
        opt.appendChild(document.createTextNode(sdata[i].coordinates[0]+ ", " + sdata[i].coordinates[1]))
        opt.value = i;
        selection.appendChild(opt);
    }

    selection.onchange = function () {
        var x = parseInt(selection.value)
        if(typeof x == 'number'){
            mymap.setView([sdata[x].coordinates[1], sdata[x].coordinates[0]]);
            try{
                marker.remove();
            }catch (e) {
                console.log(e)
            }
        }
            marker = L.marker([sdata[x].coordinates[1], sdata[x].coordinates[0]], {icon: L.icon({ //Hebt es farblich hervor. Größenskalierung stimmt noch nicht so ganz
                    iconUrl: 'public/graphics/marker-icon-red.png',
                    shadowUrl: 'public/graphics/marker-shadow.png',
                    iconSize: [25, 41], // size of the icon
                    shadowSize:   [41, 41], // size of the shadow
                    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
                })}).addTo(mymap);
        marker.bindPopup("Meine Position");
        mymap.setZoom(20);


        }
}

/**
 * Geocoding funktionalität über Mapbox. Ergebnis wird direkt an Server gesendet
 */
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
                        url: "/setdata",
                        type: 'POST',
                        contentType:'application/json',
                        data: JSON.stringify(data.features[0].geometry),
                        dataType:'json'
                    });
                    getData();
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
               throw errorMessage
            }
        });
}

/**
 * Hilfsfuntkion die von Gegebenen Parametern eine Custom Control zurückliefert
 * @param title - Titel der Custom Control
 * @param value - Inhalt der Custom Control
 * @param call - Aufruf bei Anklick der Custom Control
 * @param color - Farbe bei mouseover
 * @returns {*} - Gibt Custom Control zurück
 */
function createCustomControl(title, value, call,  color) {
    var customControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('input');
        container.type="button";
        container.title=title;
        container.value = value;

        container.style.backgroundColor = 'white';
        //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        container.style.backgroundSize = "30px 30px";
        container.style.width = '100px';
        container.style.height = '30px';

        container.onmouseover = function(){
            container.style.backgroundColor = color;
            //Nichts
            //Todo: Was sinnvolles ergänzen
        }
        container.onmouseout = ()=>{
            container.style.backgroundColor = 'white';
            //Todo: Ergänzen
        }

        container.onclick = call;
        return container;
    }
});
    return new customControl;
}



