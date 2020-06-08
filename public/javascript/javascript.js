"use strict";

//Marius Sterthaus Matrikel Nr. 451 342// Es wird nur das Mapbox Access Token benötogt
//Token über das Entsprechende input field eintragen. Alternativ Token direkt als string in die var Token eingeben.
// Wenn Token direkt im Code Festgelegt ist muss es zusätzlich noch für die draw.js festgelegt werden.
var Token = sessionStorage.getItem("Token");
/**
 * JSON Objekt welche benötigte Daten Speichert. Hier mit Null initialisiert.
 * @type {{Pointcloud: null, Point: null, BackupPoints: null}}
 */
var MetaJSON = {
    "Point": null,
    "Pointcloud": null,
    "Abfahrten": null,
    "geoCoded": null
}

/**
 * JSON Objekt welche relevante variablen für die karte hält
 * @type {{marker: null, karte: null}}
 */
var Map = {
    "karte": null,
    "marker": null,
    "icon" : L.icon({ //Hebt es farblich hervor. Größenskalierung stimmt noch nicht so ganz
        iconUrl: 'public/graphics/marker-icon-red.png',
        shadowUrl: 'public/graphics/marker-shadow.png',
        iconSize: [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
    }),
    "LayerControl" : null, //Referenziert das LayerControl Objekt
    "availableLines" : [] //Hilfsvariable, Speichert die Momentan Anzeigbaren Linien als LinienID
}
//Hilfsvariable die nach dem ersten vollständigen laden auf false gesetzt wird, Evtl inzwischen unnötig
var finLoad = true;
//Hilfsvariable für die Autocomplete Funktion von Mapbox
var autoCom = false;
//Hilfsvariable für die Direkt Abfrage
var fastMode = false;
//Speichert die Daten vom Server Lokal
var sdata;

//Startpunkt
init();

//Todo: Fixen des Layouts
//Todo: Neu schreiben mit Fokus auf übersichtlichkeit

/**
 * Startet das Skript. Überprüft ob ein Valides Mapbox Token vorliegt.
 * Wenn eins vorliegt wird die seite geladen und die eingabe möglichkeit dafür deaktiviert. Wenn nicht wird eine Fehlermeldung angezeigt.
 */
function init() {
    var resource = "https://api.mapbox.com/tokens/v2?access_token=" + Token;
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    if (data.code == "TokenValid") {
                        document.getElementById('key').hidden = true;
                        getHaltestellen();
                        getData();
                    } else {
                        document.getElementById("notifications").hidden = false;
                        document.getElementById("notifications").innerText = "Invalides MapBox Token";
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
            }
        });
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

function configureSwitch() {
    var selection = document.getElementById("switch");
    for(var i = 0; i < sdata.length; i++){
        var opt = document.createElement("option");
        opt.appendChild(document.createTextNode(sdata[i].coordinates[0]+ ", " + sdata[i].coordinates[1]))
        opt.value = i;
        selection.appendChild(opt);
    }
    selection.onchange = function () {
        var x = parseInt(selection.value)
        if(typeof x == 'number'){
            MetaJSON.Point = { //Erstellen eines JSON Objektes
                "type": "Point",
                "coordinates": [sdata[x].coordinates[0], sdata[x].coordinates[1]]
            }
            setLocationData();

        }

    }
}

/**
 * Initialisiert die karte. Setzt alle haltestellen Marker und einen für die eigene Position
 * @param arr - Array aus der Result Funktion
 */
function mapSetup(arr) {
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
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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

    Map.karte = L.map('mapid',{
        layers: [mapbox]
    });

    Map.karte.setView([MetaJSON.Point.coordinates[1], MetaJSON.Point.coordinates[0]], 13);



    //Iteration durch alle Haltestellen für Fancy Marker und Default Marker
    var fancyMarker = L.markerClusterGroup();
    var defaultMarker = L.layerGroup();
    var heat = L.heatLayer([]);
    for (var i = 0; i < arr.length; i++) {
        var marker = L.marker([arr[i][4], arr[i][3]]); //Marker  mit Koordianten setzen
        marker.bindPopup("Haltestellenname: " + arr[i][6] + "<br> Haltestellennummer: " + arr[i][5]); //Marker Popup mit inhalt Füllen
        heat.addLatLng([arr[i][4], arr[i][3]]);
        fancyMarker.addLayer(marker); //Marker zum Markers layer hinzufügen (Von MarkerCluster)
        defaultMarker.addLayer(marker);
    }



    Map.LayerControl = L.control.layers({
        "Mapbox OSM" : mapbox,
        "OpenTopoMap": OpenTopoMap,
        "Decimal" : Decimal,
        "Blueprint" : Blueprint,
        "Sattelite" : Satellit,
        "Darkmode" : dark
    },{
        "Haltestellen Marker" : fancyMarker,
        "Default Marker" : defaultMarker,
        "HeatMap" :  heat
    }).addTo(Map.karte)

    //Funktion sorgt dafür das die Layer Exklusiv zueinander sind
    Map.karte.on('overlayadd', function(eo) {
        if (eo.name === 'Haltestellen Marker') {
            setTimeout(function() {
                Map.karte.removeLayer(defaultMarker)
                Map.karte.removeLayer(heat)
            }, 10);
        } else if (eo.name === 'Default Marker') {
            setTimeout(function() {
                Map.karte.removeLayer(fancyMarker)
                Map.karte.removeLayer(heat)
            }, 10);
        }else if (eo.name === 'HeatMap'){
            setTimeout(function() {
                Map.karte.removeLayer(fancyMarker)
                Map.karte.removeLayer(defaultMarker)
            }, 10);

        }
    });

    //Map.karte.addLayer(fancyMarker); //MarkerCluster zur Karte hinzufügen
    //Platzieren der eigenen Standortes
    Map.marker = L.marker([MetaJSON.Point.coordinates[1], MetaJSON.Point.coordinates[0]], {icon: Map.icon}).addTo(Map.karte);
    Map.marker.bindPopup("Meine Position");
    //Ergänzt die Karte um einen Fullscreen Button
    Map.karte.addControl(new L.Control.Fullscreen());
    finLoad = false;
    //Fügt die möglichkeit hinzu bei dem eingabefeld enter zu drücken
    document.getElementById("geocoding").addEventListener("keydown", enter)
    Map.karte.on('click', function (e) {
        MetaJSON.Point = { //Erstellen eines JSON Objektes
            "type": "Point",
            "coordinates": [e.latlng.lng, e.latlng.lat]
        }
        reverseGeoCoding(e.latlng.lat, e.latlng.lng);
        calculateRes();
    })
}

/**
 * Liest das Geocoding feld aus, setzt den Inhalt als Mapbox Token und stößt alles neu an.
 */
function setKey() {
    Token = document.getElementById("geocoding").value; //Token setzen
    var resource = "https://api.mapbox.com/tokens/v2?access_token=" + Token;
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 500,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    if (data.code == "TokenValid") {
                        try{
                            Map.karte.remove(); //Alte Karte entfernen. Sonst wirft leaflet Exceptions (Oder Errors hier?)
                        }catch (e) {

                        }
                        document.getElementById("geocoding").value = "";
                        finLoad = true; //Variable Zurücksetze
                        sessionStorage.setItem("Token", Token)
                        document.getElementById("notifications").hidden = true;
                        document.getElementById("key").hidden = true;
                        //Alles Neu Abfragen und Erstellen
                        getHaltestellen();
                        getData();
                    } else {
                        document.getElementById("notifications").hidden = false;
                        document.getElementById("notifications").innerText = "Invalides Token";
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
            }
        });
}

/**
 * Reverse Geocoding. Auus koordinaten erhält man durch die Mapbox API eine Addresse
 * @param lat - Latitude
 * @param lng - Longitute
 */
function reverseGeoCoding(lat, lng) {
    var resource = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?" + "access_token=" + Token;
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 500,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    try {
                        document.getElementById("sucalert ").hidden = false;
                        document.getElementById("sucalert ").innerHTML =
                            "<p> " + data.features[0].place_name + " <br> " + lat + ", " + lng;

                        Map.marker.remove();
                        Map.karte.setView([lat, lng]);
                        Map.marker = L.marker([lat, lng], {icon: Map.icon}).addTo(Map.karte);
                        Map.marker.bindPopup("Meine Position");
                        document.getElementById("failalert").hidden = true;
                    } catch (e) {
                        //Falls fehler, zeige es dem Nutzer
                        document.getElementById("failalert").hidden = false;
                        document.getElementById("failalert").innerText = "Unbekannter Fehler!"
                        document.getElementById("sucalert ").hidden = true;
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
            }
        });
}

/**
 * Setzt die Geschwindigkeit für die API anfragen. Entweder nach jedem Tastendruck oder immer bei drücken auf Enter!
 */
function setSpeed() {
    fastMode = !fastMode;
    if (!fastMode) {
        document.getElementById("geocoding").addEventListener("keydown", enter)
        document.getElementById("geocoding").removeEventListener("keydown", geocoding)
        document.getElementById("warning").hidden = true;
    } else {
        document.getElementById("geocoding").removeEventListener("keydown", enter)
        document.getElementById("geocoding").addEventListener("keydown", geocoding)
        document.getElementById("warning").hidden = false;


    }

}

//Mir gefällt diese Lösung nicht ich weiß aber auch keine Bessere!
/**
 * Stellt eine Hilfsfunktion dar. Überprüft ob die gewählte Taste 'Enter' ist.
 */
function enter(event) {
    if (event.key == "Enter") {
        geocoding();
    }
}

/**
 * Hilfsfunktion welche die autoCom variable negiert.
 */
function autoComplete() {
    autoCom = !autoCom;
}

/**
 * Hier läuft das Geocoding über Mapbox. Die Anfrage wird gestellt, und bei einer antwort wird diese gespeichert und es wird eine neuberechnung der Tabelle begonnen.
 * Hab  das gleiche Versucht mit Ajax umzusetzen. Bin aber gescheitert.
 * @param adress - Eingabe des Nutzers
 */
function geocoding() {
    var adress = $("#geocoding").val();
    if (autoCom) {
        var resource = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + adress + ".json?" + "autocomplete=true" + "language=de" + "&access_token=" + Token;
    } else {
        var resource = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + adress + ".json?" + "autocomplete=false" + "language=de" + "&access_token=" + Token;
    }


    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 500,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    MetaJSON.geoCoded = data;
                    MetaJSON.Point = MetaJSON.geoCoded.features[0].geometry;//Speichern
                    calculateRes();//Neu Kalkulieren
                    try {
                        document.getElementById("sucalert ").hidden = false;
                        document.getElementById("sucalert ").innerHTML =
                            "<p> " + MetaJSON.geoCoded.features[0].place_name + " <br> " + MetaJSON.geoCoded.features[0].geometry.coordinates[0] + " " + MetaJSON.geoCoded.features[0].geometry.coordinates[1]

                        Map.marker.remove();
                        Map.karte.setView([MetaJSON.geoCoded.features[0].geometry.coordinates[1], MetaJSON.geoCoded.features[0].geometry.coordinates[0]]);
                        Map.marker = L.marker([MetaJSON.geoCoded.features[0].geometry.coordinates[1], MetaJSON.geoCoded.features[0].geometry.coordinates[0]], {icon: Map.icon}).addTo(Map.karte);
                        Map.marker.bindPopup("Meine Position");
                        document.getElementById("failalert").hidden = true;
                        Map.karte.setZoom(20);
                    } catch (e) {
                        //Falls fehler, zeige es dem Nutzer
                        document.getElementById("failalert").hidden = false;
                        document.getElementById("failalert").innerText = "Unbekannter Fehler!"
                        document.getElementById("sucalert ").hidden = true;
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
                document.getElementById("failalert").hidden = false;
                document.getElementById("failalert").innerText = "Unbekannter Fehler!"
                document.getElementById("sucalert ").hidden = true;
            }
        });
}

/**
 * Kalkuliert die Distanz zwischen zwei punkten.
 * @param lon1 Longitude für Punkt 1
 * @param lat1 Latitude für Punkt 1
 * @param lon2 Longitude für Punkt 2
 * @param lat2 Latitude für Punkt 2
 * @returns {number}  Returnt die Distanz
 */
function distance(lon1, lat1, lon2, lat2) {
    var R = 6371; //Kilometres
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var Δφ = toRadians(lat2 - lat1);
    var Δλ = toRadians(lon2 - lon1);
    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

/**
 * Kalkuliert den Winkel zwischen zwei punkten.
 * @param lon1 Longitude für Punkt 1
 * @param lat1 Latitude für Punkt 1
 * @param lon2 Longitude für Punkt 2
 * @param lat2 Latitude für Punkt 2
 * @returns {*} Return  das Bearing für  die Eingegebenen Koordinaten Paare
 */
function bearing(lon1, lat1, lon2, lat2) {
    var λ1 = toRadians(lon1);
    var λ2 = toRadians(lon2);
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    var x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    var brng = (toDegree(Math.atan2(y, x)) + 360) % 360; //Bringe Ergebnis in ein 360 Grad Format statt -180 bis  180
    return brng;
}

/**
 * Evaluiert die Himmelsrichtung anhand des Winkels (Bearings).
 * @param dir Winkel für Richtung zwischen Punkten
 * @returns {string}  Return den  String  mit der  Assoziierten himmelsrichtung
 */
function cardinaldirection(dir) {
    //Überprüft im Switch statement und Returnt Himmelsrichtung
    switch (true) {
        case (dir < 22.5):
            return 'N'
        case (dir < 67.5):
            return 'NE';
        case (dir < 112.5):
            return 'E'
        case (dir < 157.5):
            return 'SE'
        case (dir < 202.5):
            return 'S'
        case (dir < 247.5):
            return 'SW'
        case (dir < 292.5):
            return 'W'
        case (dir < 337.5):
            return 'NW'
        case (dir > 337.5):
            return 'N'
        default:
            return "Error"
    }
}

/**
 * Wandelt gegebene Radiant zahl zu Grad um
 * @param rad Radiant Zahl
 * @returns {number} Returnt Nummer in Degree
 */
function toDegree(rad) {
    return rad * (180 / Math.PI);
}

/**
 * Wandelt gegebene Grad Zahl in Radiants um.
 * @param deg Grad Zahl
 * @returns {number}  Returnt nummer als  Radian
 */
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Lokalisiert den/die Nutzer*in. Sollte die Lokalisation scheitern so wird ein Default Punkt verwendet
 */
function locate() { //Todo: Code Copy&Paste rauslöschen und Modularisieren
    if (navigator.geolocation) { //Überprüft ob geolocation supportet wird
        navigator.geolocation.getCurrentPosition(function (x) { //Wenn erfolgreich koordinaten ermittelt
            MetaJSON.Point = { //Erstellen eines JSON Objektes
                "type": "Point",
                "coordinates": [x.coords.longitude, x.coords.latitude]
            }
            document.getElementById('localnot').hidden = true;
            setLocationData();


        }, function () { //Bei fehler Tabelle ausblenden und Fehlermeldung einblenden
            document.getElementById('localnot').innerHTML = "<h3>Fehler bei der Standort Lokalisierung, Default Standpunkt wird Verwendet</h3>"
            document.getElementById('localnot').hidden = false;
            MetaJSON.Point = { //Erstellen eines JSON Objektes
                "type": "Point",
                "coordinates": [7.6261347, 51.9606649]
            }
            setLocationData();
        });
    } else {
        //Falls geolocation nicht supportet, Fehlermeldung einblenden
        document.getElementById('localnot').innerHTML = "<h3>Geolocation nicht Supportet, Default Punkt wird Verwendet</h3>"
        document.getElementById('localnot').hidden = false;
        MetaJSON.Point = { //Erstellen eines JSON Objektes
            "type": "Point",
            "coordinates": [7.6261347, 51.9606649]
        }
        setLocationData();
    }
}

/**
 * Lagert die Finale komponente für die Location aus die unabhängig vom gewählten fall ausgeführt wird. Das einfach in die Location Funtkion zu packen außerhalb des if funktionierte nicht
 *
 */
function setLocationData(){
    reverseGeoCoding(MetaJSON.Point.coordinates[1], MetaJSON.Point.coordinates[0]);
    calculateRes()
    Map.karte.setView([MetaJSON.Point.coordinates[1], MetaJSON.Point.coordinates[0]]);
    Map.marker.remove();
    Map.marker = L.marker([MetaJSON.Point.coordinates[1], MetaJSON.Point.coordinates[0]], {icon: Map.icon}).addTo(Map.karte);
    Map.marker.bindPopup("Meine Position");
    Map.karte.setZoom(20);
    $("#output").html("")
}

/**
 * Stellt Arrays zusammen mit  Zieldaten. Diese Arrays werden an die Visualisierungs Funktion geleitet die diese Visualisiert
 */
function calculateRes() {
    if (MetaJSON.Pointcloud != null) { //Überprüft ob die daten überhaupt existieren
        var res = []; //Erstes Ergebnis Array
        for (var i = 0; i < MetaJSON.Pointcloud.features.length; i++) { //Iteriert durch alle Features des Datensatz
            //Runden erzeugt leichte Ungenauigkeiten, ist jedoch noch hinreichend genau
            res[i] = [Math.round(distance(MetaJSON.Point.coordinates[0], MetaJSON.Point.coordinates[1], MetaJSON.Pointcloud.features[i].geometry.coordinates[0], MetaJSON.Pointcloud.features[i].geometry.coordinates[1])*1000)/1000,
                Math.round(bearing(MetaJSON.Point.coordinates[0], MetaJSON.Point.coordinates[1], MetaJSON.Pointcloud.features[i].geometry.coordinates[0], MetaJSON.Pointcloud.features[i].geometry.coordinates[1])),
                cardinaldirection(
                    bearing(MetaJSON.Point.coordinates[0], MetaJSON.Point.coordinates[1], MetaJSON.Pointcloud.features[i].geometry.coordinates[0], MetaJSON.Pointcloud.features[i].geometry.coordinates[1])),
                MetaJSON.Pointcloud.features[i].geometry.coordinates[0], MetaJSON.Pointcloud.features[i].geometry.coordinates[1], MetaJSON.Pointcloud.features[i].properties.nr, MetaJSON.Pointcloud.features[i].properties.lbez];
        }
        //Compare Function dient dazu das Werte verglichen werden und nicht die Strings
        res.sort(function (a, b) { //Sortiert den Datensatz
            return a[0] - b[0];
        });
        getAbfahrten(res[0][5]) //Fragt die Abfahrten von der Nächsten haltestelle ab
        createTable(res, 'tab', ["Distanz (KM)", "Winkel (Grad)", "Richtung", "Längengrad", "Breitengrad", "Nummer", "Name"]); //Stößt die Visualisierung an
        document.getElementById('notifications').innerHTML = ""; //Leert die Notifications div
        document.getElementById('notifications').hidden = true;
        if (finLoad) {
            mapSetup(res);
        }
    } else {
        document.getElementById('tab').innerHTML = "<h1> Fehler ist aufgetreten </h1>" // Zeigt fehlermeldung an falls daten nicht existieren
    }


}


/**
 * Kalkuliert die abfahrtszeit
 */
function calculateAbfahrtszeit(nr) {
    var resAbf = []; //Array Deklaration
    var date; //date Deklaration
    var headabf = document.getElementById('headabf');
    if (MetaJSON.Abfahrten.length != 0) { //Überprüfen ob Abfahrten überhaupt existieren
        for (var j = 0; j < MetaJSON.Abfahrten.length; j++) {
            date = new Date(MetaJSON.Abfahrten[j].tatsaechliche_abfahrtszeit * 1000); //Umrechnen des Unix Timestamps
            resAbf[j] = [date.toTimeString(), date.toDateString(), MetaJSON.Abfahrten[j].linienid,MetaJSON.Abfahrten[j].fahrtbezeichner] //Stelle array zusammen
        }

        headabf.innerText = "Abfahrten für Haltestellen Nummer: " + nr + " "
        document.getElementById('alert').hidden = true;
        createTable(resAbf, 'abf', ['Zeit', "Datum", 'Linie', 'Fahrtbez'])
    } else {
        document.getElementById('abf').innerHTML = ""
        document.getElementById('alert').hidden = false;
        document.getElementById('alert').innerText = "Keine passenden Abfahrten gefunden für Haltestellennummer: " + nr;
        headabf.innerText = "Keine Abfahrten für Nr.: " + nr
    }


}

/**
 * Visualisierungsfunktion für Array Daten
 * @param res - Array das Fertigen datensatz enthält
 * @param div - Zieldiv an dem die Tabelle platziert werden soll
 * @param TableElem - Array mit den Tabellen Überschriften
 */
function createTable(res, div, TableElem) {
    document.getElementById(div).innerHTML = ""; //Um zu verhindern das die Tabellen anfangen doppelt zu erscheinen bei mehrfachem drücken des Buttons
    var table = document.createElement('table'); //Erschaft Tabellen Element
    var thead = document.createElement("thead");
    var tableBody = document.createElement('tbody'); //Erschafft Tabellen body
    //Erschaffen der Kopfzeilen mit Distanz und Richtung
    var row = document.createElement('tr'); //Erschaffen einer neuen zeile
    for (var i in TableElem) {
        var cell = document.createElement('td') //Erschaffen einer neuen zelle
        cell.appendChild(document.createTextNode(TableElem[i])) //Zelle befüllen
        row.appendChild(cell) //Zelle "Anhängen"
    }
    //Todo: Codezeile löschen
    //row.appendChild(cell)
    thead.appendChild(row);
    if(div=='tab'){

        for (var i in res) {
            var row = document.createElement('tr');
            for (var j in res[i]) {
                var cell = document.createElement('td')
                var link = document.createElement('a');
                var val = 'javascript:Map.karte.setView(['+ res[i][4] + ',' + res[i][3] + '], 20)';
                link.setAttribute('href', val);
                link.appendChild(document.createTextNode(res[i][j]));

                cell.appendChild(link)
                row.appendChild(cell)
            }
            tableBody.appendChild(row);
        }
    }else if(div=='abf'){
        for (var i in res) {
            var row = document.createElement('tr');
            for (var j in res[i]) {
                var cell = document.createElement('td')
                var link = document.createElement('a');
                var val = 'javascript:plotBusLine('+ res[i][3] + ')';
                link.setAttribute('href', val);
                link.appendChild(document.createTextNode(res[i][j]));

                cell.appendChild(link)
                row.appendChild(cell)
            }
            tableBody.appendChild(row);
        }
    }else{
        for (var i in res) {
            var row = document.createElement('tr');
            for (var j in res[i]) {
                var cell = document.createElement('td')
                cell.appendChild(document.createTextNode(res[i][j]))
                row.appendChild(cell)
            }
            tableBody.appendChild(row);
        }
    }

    table.appendChild(thead)
    table.appendChild(tableBody); //Tabellen Body anhängen
    table.classList.add("table");
    table.classList.add("table-sm");
    table.classList.add("table-hover")
    table.id = "tableid";
    document.getElementById(div).appendChild(table); //Hängt tabelle an das dafür erstellte Div

}

/**
 * Fügt auf klick des Nutzers die Linie des Buses zur Layer Control hinzu
 * @param bez - Bezeichner für die Fahrt entsprechend der API
 */
function plotBusLine(bez) { //Todo: Implementieren das alle Haltestellen auf der Linie angezeigt werden
    var resource = "https://rest.busradar.conterra.de/prod/fahrten/" + bez;
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    if(Map.availableLines.includes(data.properties.linienid)){ //Sorgt dafür das Linien immer nur ein mal in der Layer Control auftauchen können
                        return;
                    }else{
                        Map.availableLines.push(data.properties.linienid)
                        var Linie = L.geoJSON(data, {
                            "onEachFeature" : function (feature, layer) {
                                layer.bindPopup('Linienid: ' + feature.properties.linienid + '<br>' + 'Richtungstext: ' + feature.properties.richtungstext)
                            }
                        })

                        Map.LayerControl.addOverlay(Linie, 'Linie: ' + data.properties.linienid);
                    }

                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
                alert("fail")
            }
        });


}



/**
 * Ruft die Haltestellen ab
 */
function getHaltestellen() {
    var resource = "https://rest.busradar.conterra.de/prod/haltestellen";
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                MetaJSON.Pointcloud = data;
                        if (finLoad) {
                            locate();
                        }
                }},
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("alert").innerHTML = "API nicht Verfügbar";
            }
        });

}

/**
 * Ruft Abfahrten einer Haltestelle ab und stößt direkt die Kaluklation und damit auch die Visualisierung an
 * @param nr - Haltestellen Nummer
 */
function getAbfahrten(nr) {
    var resource = "https://rest.busradar.conterra.de/prod/haltestellen/" + nr + "/abfahrten?sekunden=300"
    //var req = new XMLHttpRequest();
    $.ajax(resource,   // request url
        {
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){

                    MetaJSON.Abfahrten = data;
                    calculateAbfahrtszeit(nr);
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                document.getElementById("notifications").innerHTML = "errorcallback: check web-console";
            }
        });


}
