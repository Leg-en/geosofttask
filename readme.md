# Geosoft I 

Geosoftware Task 5 

## Server Lokal mittels Node Starten

2. Server Dependencies Installieren <br>
A) Befehl: ```npm install```
                                                         
3. Server Starten <br>
A) Befehl: ```npm start```


## Server mittels Docker Composer Starten
1. Dockerimage von diesem Repository und MongoDB Downloaden <br>
A) Befehl ```docker pull legen26/geosofttask``` <br>
B) Befehl ```docker pull mongo```
2. Dockercomposer downloaden oder Repository clonen
3. Docker Composer Starten
A) Befehl in dem verzeichnise in dem die docker-compose.yml liegt ```docker-compose up```

## Laufzeit
Während der  Laufzeit kann der Server via lokal via localhost bzw localhost:80 aufgerufen werden. <br>
Der Server kann einfach mit Str+c Terminiert werden. Nach beenden sollte Ebenso der Datenbank server Terminiert werden.
Der Server erlaubt Zugriffe aus dem Netzwerk.