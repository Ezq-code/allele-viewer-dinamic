var allEvents = [];

function fetchEventsFromAPI()
{
   $.ajax({
       url: '/business-gestion/events/',
       type: 'GET',
       dataType: 'json',
       success: (response) => {
           if (response && response.results) {
               allEvents = response.results;
               //this.updateEventsDisplay();
           } else {
               console.error("Invalid response format");
           }
       },
       error: (xhr, status, error) => {
           console.error("Error loading events:", error);
           Swal.fire('Error', 'Could not load events', 'error');
       }
   });
}

function parseEventTimeRange(event) 
{
const start = parseInt(event.start_date);
const end = event.end_date ? parseInt(event.end_date) : start;
return [start, end];
}


function validateEvents(events) {
    return events.filter(event => {
        const valid = event.markers && event.markers.length > 0 &&
            event.markers[0].latitude && event.markers[0].longitude &&
            !isNaN(parseInt(event.start_date));

        if (!valid) {
            console.warn("Invalid event:", event.event_name);
        }
        return valid;
    });
}

function showEventModal(event) {
    document.getElementById('eventName').textContent = event.event_name;
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventReference').textContent = event.reference;

    const galleryContainer = document.getElementById('eventImages');
    galleryContainer.innerHTML = event.event_gallery?.length > 0
        ? event.event_gallery.map(image => `
            <div class="col-md-3 mb-3">
                <img src="${image.image}" class="img-fluid" alt="${image.name}">
            </div>`).join('')
        : '<p>No hay imágenes disponibles</p>';

    $('#eventModal').modal('show');
}

function createEventMarker(feature, latlng) {
    const event = feature.properties.eventData;
    const iconUrl = event.event_icon || event.event_type_info.icon;
    const marker = L.marker(latlng, {
        icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [25, 41],
            shadowSize: [41, 41],
            shadowAnchor: [13, 20]
        })
    });

    marker.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'left',
        offset: [-6, -5],
        className: 'marker-tooltip'
    });

    // marker.bindPopup(feature.properties.popupContent);
    marker.on('click', () => this.showEventModal(event));

    return marker;
}

var listEventsJoin = [];
let eventa = {};
let eventb = {};
let eventc = {};

 function  createGeoJsonData4(events) 
   {
       if (events.length > 0) {
             
            events.forEach(event => {
                    eventb = { 
                        type: 'Feature',
                        properties: {
                            name: event.event_name,
                            //times: this.parseEventTimeRange(event),
                            times: this.parseEventTimeRange(event),
                            //times: [-452,-401,-350,-299,-248, -197,-146],
                            eventData: event,
                            // popupContent: this.createPopupContent(event)
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                parseFloat(event.markers[0].longitude),
                                parseFloat(event.markers[0].latitude)
                            ]
                        }
                    }  
                    listEventsJoin.push(eventb);     
                })
        } 
            return {
                type: 'FeatureCollection',
                features: listEventsJoin 
                } 
   }

   // Función modificada para sincronización
function addGeoJSONLayer(map, data) {

var geoJsonData;
// 1. Función de conversión de años a fechas
const BASE_YEAR = 2025; // Año de referencia (actual)
const yearToDate = (yearsBP) => {
    const date = new Date(`${BASE_YEAR}-01-01T00:00:00Z`);
    date.setFullYear(date.getFullYear() - yearsBP);
    return date;
};

// 2. Configurar TimeDimension con todos los tiempos
const allTimes = data.features
    .flatMap(f => f.properties.times)
    .sort((a,b) => a - b);
    //.map(yearBP => yearToDate(yearBP));


    var timeDimension = L.timeDimension({
    times: allTimes, // Usar array de fechas
    period: "PT1S",
});
 
    // 1. Capa de trayectorias de las migraciones
    var lineLayer = L.timeDimension.layer.geoJson(L.geoJSON(data, {
        filter: f => f.geometry.type === 'LineString',
        style: function(feature) {
            return {
            fillColor: feature.properties.mag,
            color: feature.properties.mag,
            weight: 6
            };
            }
    }), {
        updateTimeDimensionMode: 'intersect',
        addlastPoint: false,
        duration: "PT30M",//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
        //duration: "PT406S",//"PT76M", 
        timeInterval: "PT1S",//"PT1S", //"2019-11-23T12:01:05Z/2019-11-23T13:17:05Z", // Rango exacto//timeInterval: "PT1S",
        getLineId: f => f.properties.name
    });
    
    // 2. Capa de destinos de las migraciones
    var pointLayer = L.timeDimension.layer.geoJson(L.geoJSON(data, {
        filter: f => f.geometry.type === 'Point',
        pointToLayer: (f, latlng) => {
            var marker = L.marker(latlng, {
                icon: L.icon({
                    iconUrl: iconUrlpathDestinationMigrationHomoHeidel,
                    iconSize: [45, 45],
                    shadowSize: [45, 45],
                    shadowAnchor: [17, 23]
                })
            });
            // Bind a popup for click (if you still want it)
            //marker.bindPopup(f.properties.title);
            // Bind a tooltip to show the title permanently
            marker.bindTooltip(f.properties.title, {
                permanent: true,
                direction: 'left',
                offset: [-6, -5],
                className: 'marker-tooltip'
            });
            return marker;
        }
        /*
        pointToLayer: (f, latlng) => L.marker(latlng, {
            icon:
                L.icon({
                    iconUrl: iconUrlpathDestinationMigrationHomoHeidel,
                    iconSize: [45, 45],
                    shadowSize: [45, 45],
                    shadowAnchor: [17, 23]
                })
        }).bindPopup(f.properties.title)
        */
    }), {
      updateTimeDimensionMode: 'intersect',  // Mantiene el objeto visible durante todo el rango
      duration: "PT16M",//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
      timeInterval: "PT11S",//"PT16M",              // Mismo que duration para rango continuo
      addlastPoint: false,                  // Evita saltos al final
      timeField: function(feature) {
        // Convert each time from seconds to milliseconds
        return feature.properties.times.map(t => t * 1000);
      }
    });

    const validEvents = this.validateEvents(allEvents);
    
    geoJsonData = this.createGeoJsonData4(validEvents);

    // Capa de marcadores
    var pointMarkerLayer = L.timeDimension.layer.geoJson(L.geoJSON(geoJsonData, {
        pointToLayer:  this.createEventMarker.bind(this)
    }), {
      updateTimeDimensionMode: 'intersect',  // Mantiene el objeto visible durante todo el rango
      duration: 10000, //"PT1S", // 3000,//"PT16M",  //"PT1S"                // Duración total = Fin - Inicio (76 minutos)
      timeInterval: "PT11S",//"PT16M",              // Mismo que duration para rango continuo
      addlastPoint: false                  // Evita saltos al final
    });


        // 1. Capa de área glaciar
        var areaLayerHielo = L.timeDimension.layer.geoJson(L.geoJSON(data, {
            filter: f => f.properties.id === 100,
              style: function(feature) {
                if (feature.properties.mag === "-1")
                {
                    return {
                        fillColor: "#FFFFFF",
                        fillOpacity: 0.0,
                        color: "#FFFFFF",
                        weight: 2,
                        opacity: 0.0,
                        };
               }
               else
                {
                    return {
                        fillColor: feature.properties.mag,
                        fillOpacity: 0.9,
                        color: feature.properties.mag,
                        weight: 2
                        }
               }
               }
              }), {
                 updateTimeDimensionMode: 'replace',  // Mantiene el objeto visible durante todo el rango
                 duration: timeLineTimeDelayIce,//"PT16M", // Duración total = Fin - Inicio (76 minutos)
                 //timeInterval: "PT11S",//"PT16M", //"2019-11-23T12:01:05Z/2019-11-23T13:17:05Z"//timeInterval: "PT1S" // Mismo que duration para rango continuo
                 addlastPoint: false   // Evita saltos al final
          });

        // 1. Capa de la tierra que emerge
        var areaLayerTierra = L.timeDimension.layer.geoJson(L.geoJSON(data, {
            filter: f => f.properties.id > 999,
              style: function(feature) {
                if (feature.properties.mag === "-1")
                {
                    return {
                        fillColor: "#00FF00",
                        fillOpacity: 0.0,
                        color: "#00FF00",
                        weight: 2,
                        opacity: 0.0,
                        };
               }
               else
                {
                    return {
                        fillColor: feature.properties.mag,
                        fillOpacity: 1,
                        color: feature.properties.mag,
                        //weight: 2
                        }
               }
                }
              }), {
                 updateTimeDimensionMode: 'intersect',  // Mantiene el objeto visible durante todo el rango
                 duration: timeLineTimeDelayLand,//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
                 timeInterval: "PT11S",//"PT16M",              // Mismo que duration para rango continuo
                 addlastPoint: false                  // Evita saltos al final
          });

         // Capa del crecimiento poblacional
          var areaLayerPoblacion = L.timeDimension.layer.geoJson(L.geoJSON(data, {
            filter: f => f.properties.id === 20,
              style: function(feature) {

                const currentTime = map.timeDimension.getCurrentTime();
                const currentMag = getCurrentMag(currentTime, feature.properties.place);

                if (feature.properties.mag === "-1")
                {
                    return {
                        fillColor: GetColorByPopulation(currentMag),
                        fillOpacity: 0.0,
                        color: GetColorByPopulation(currentMag),
                        weight: 2,
                        opacity: 0.0,
                        };
               }
               else
                {
                   return {
                       color: GetColorByPopulation(currentMag),
                       fillOpacity: 0.5,
                       fillColor: GetColorByPopulation(currentMag),
                       weight: 2,
                       opacity: 0.5,
                   }
               }                
             },
             onEachFeature: function (feature, layer) {
                const currentTime1 = map.timeDimension.getCurrentTime();
                const currentMag1 = getCurrentMag(currentTime1, feature.properties.place);
                let nf = new Intl.NumberFormat('en-US');
                if (feature.properties.id == 20) {
                    layer.bindPopup(L.popup({
                        closeOnClick: false,
                        autoClose: false
                    }).setContent(feature.properties.place+", "+currentMag1+" people."));
                    //}).setContent(feature.properties.place+", "+nf.format(currentMag)+" people."));
                }
            },
              }), {
                 updateTimeDimensionMode: 'intersect',  // Mantiene el objeto visible durante todo el rango
                 duration: "PT16M",//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
                 timeInterval: "PT11S",//"PT16M",              // Mismo que duration para rango continuo
                 addlastPoint: false                  // Evita saltos al final
          });


        // 1. Configuración inicial de la capa de eventos (como en tu ejemplo que funciona)
        var eventLayer = L.layerGroup();

// 2. Llamada AJAX modificada para TimeDimension
        $.ajax({
            type: 'GET',
            url: '/business-gestion/events/',
            error: function () {
                Swal.fire({
                    icon: "error",
                    title: "No se pudieron cargar los datos.",
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            dataType: 'json',
            success: function (response) {
                var data = response.results;

                // Limpiar la capa antes de añadir nuevos eventos
                eventLayer.clearLayers();

                data.forEach(function (event) {
                    var nameLoad = event.event_name;
                    var descriptionLoad = event.description;
                    var referenceLoad = event.reference;
                    var iconUrlCurrentMarkerLoad = event.event_icon || event.event_type_info.icon;
                    var galleryLoad = event.event_gallery;

                    // Procesar cada marcador del evento
                    event.markers.forEach(function (marker) {
                        var latitudeLoad = marker.latitude;
                        var longitudeLoad = marker.longitude;

                        // Crear el marcador
                        var markerObj = L.marker([latitudeLoad, longitudeLoad], {
                            icon: L.icon({
                                iconUrl: iconUrlCurrentMarkerLoad,
                                iconSize: [25, 41],
                                shadowSize: [41, 41],
                                shadowAnchor: [13, 20]
                            }),
                            riseOnHover: true
                        });

                        // Configurar el evento click para el modal
                        markerObj.on('click', function () {
                            document.getElementById('eventName').innerHTML = nameLoad;
                            document.getElementById('eventDescription').innerHTML = descriptionLoad;
                            document.getElementById('eventReference').innerHTML = referenceLoad;

                            var eventImagesDiv = document.getElementById('eventImages');
                            eventImagesDiv.innerHTML = '';

                            if (galleryLoad && galleryLoad.length > 0) {
                                galleryLoad.forEach(function (image) {
                                    var cardHtml = `
                                <div class="card m-2" style="width: 100px;">
                                    <a href="${image.image}" data-lightbox="event-gallery" data-title="${image.name}">
                                        <img src="${image.image}" class="card-img-top" alt="${image.name}" style="width: 100%; height: auto;">
                                    </a>
                                </div>
                            `;
                                    eventImagesDiv.innerHTML += cardHtml;
                                });
                            } else {
                                eventImagesDiv.innerHTML = '<p>There are no images available for this event.</p>';
                            }

                            $('#eventModal').modal('show');
                        });

                        // Añadir el marcador a la capa
                        eventLayer.addLayer(markerObj);
                    });
                });

                // Si necesitas manejar el tiempo, puedes usar esto:
                if (data.length > 0 && data[0].start_date) {
                    // Configurar el control de tiempo si es necesario
                    // timeDimension.setCurrentTime(new Date(data[0].start_date));
                }
            }
        });
       
       areaLayerTierra.addTo(map);
       areaLayerPoblacion.addTo(map);
       areaLayerHielo.addTo(map);
       lineLayer.addTo(map);
       pointLayer.addTo(map);
       pointMarkerLayer.addTo(map);
    
     // creación de las capas bases y adición al control de capas del mapa
    const baseLayers = {
        'Countries': osmcountriesLayers,
        'Satelital': satelitalLayer,
        'Ocean': oceanLayer
    };
    
    const overlays = {
        'Migration Trace Route': lineLayer,
        'Migration Points': pointLayer,
        'Glacials': areaLayerHielo,
        'Population by Region': areaLayerPoblacion,
        'Land Emerge': areaLayerTierra,
        'Marker Layer': markerLayer
    };
    
    var layerControl = L.control.layers(baseLayers, overlays, {
        position: 'topleft' // Set control position
      }
      ).addTo(map);     
}


    document.getElementById('timeRangeMigraions').addEventListener('click', function(e) {

                                            const opcionClick = e.target;
                                            if (opcionClick.tagName === 'OPTION') {
                                              const estaSeleccionada = opcionClick.selected;
                                              var selectedValue = opcionClick.value;
                                            }

                                            sessionStorage.setItem('timeRange', selectedValue); 


                                            timeRange = selectedValue;
                                            //document.getElementById("timeRange").value  =  selectedValue;

                                            var aPosition = selectedValue.indexOf("/");
                                            var aBegin = selectedValue.substring(0,aPosition);
                                            var anEnd = selectedValue.substring(aPosition+1);
                                            timeOld = aBegin;
                                            timeAnt = aBegin - 10000;
    
                                            sessionStorage.setItem('beginIntervalsesion', parseInt(aBegin));
                                            sessionStorage.setItem('endIntervalsesion', parseInt(anEnd));  
                                            sessionStorage.setItem('durationSesion', parseInt(anEnd)-parseInt(aBegin));

                                            if (selectedValue == "-15000/2025"){
                                                sessionStorage.setItem('timedelayice', 'PT5S');
                                                sessionStorage.setItem('timedelayland', 'PT5S');
                                            }
                                            else
                                            if (selectedValue == "-69000/-15000"){
                                                sessionStorage.setItem('timedelayice', 'PT9S');
                                                sessionStorage.setItem('timedelayland', 'PT9S');
                                            } 
                                            else
                                            if (selectedValue == "-130000/-115000"){
                                                sessionStorage.setItem('timedelayice', 'PT2S');
                                                sessionStorage.setItem('timedelayland', 'PT4S');
                                            }                                             
                                            else
                                            {
                                                sessionStorage.setItem('timedelayice', 'PT5S');
                                                sessionStorage.setItem('timedelayland', 'PT5S');
                                            } 

                                            // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                                            setTimeout(function () {
                                                location.reload()
                                            }, 500);

                                          });

                                          document.getElementById('legend').addEventListener('click', function() {
                                            $('#legendModal').modal('show');
                                        });


                                        document.getElementById('btreload').addEventListener('click', function() {
                                            
                                          
                                            var aTimeRange = document.getElementById("timeRange");
                                            aTimeRange.value = timeRange;
                                            var aRegionTimeLine = document.getElementById("regionTimeLine");
                                            sessionStorage.setItem('timeRange', aTimeRange.value);
                                            sessionStorage.setItem('region', aRegionTimeLine.value);
                                            
                                            var aPosition = aTimeRange.value.indexOf("/");
                                            var aBegin = aTimeRange.value.substring(0,aPosition);
                                            var anEnd = aTimeRange.value.substring(aPosition+1);
                                            timeOld = aBegin;
                                            timeAnt = aBegin - 10000;
    
                                            sessionStorage.setItem('beginIntervalsesion', parseInt(aBegin));
                                            sessionStorage.setItem('endIntervalsesion', parseInt(anEnd));  
                                            sessionStorage.setItem('durationSesion', parseInt(anEnd)-parseInt(aBegin));
                                         

                                        if (aRegionTimeLine.value == "All the World"){ 

                                          sessionStorage.setItem('lat', '5');
                                          sessionStorage.setItem('long', '155');  
                                          sessionStorage.setItem('zoom', '2.1');    

                                        }
                                        else
                                        if (aRegionTimeLine.value == "Africa"){
                                          sessionStorage.setItem('lat', '-3');
                                          sessionStorage.setItem('long', '15');  
                                          sessionStorage.setItem('zoom', '4');   
                                        }                             
                                        else
                                        if (aRegionTimeLine.value == "Western Asia"){
                                          sessionStorage.setItem('lat', '47');
                                          sessionStorage.setItem('long', '60');  
                                          sessionStorage.setItem('zoom', '4');    
                                        }
                                        else
                                        if (aRegionTimeLine.value == "Eastern Asia"){
                                            sessionStorage.setItem('lat', '47');
                                            sessionStorage.setItem('long', '130');  
                                            sessionStorage.setItem('zoom', '4');      
                                        }
                                        else
                                        if (aRegionTimeLine.value == "Europe"){   
                                            sessionStorage.setItem('lat', '49');
                                            sessionStorage.setItem('long', '15');  
                                            sessionStorage.setItem('zoom', '4');    
                                        }
                                        else
                                        if (aRegionTimeLine.value == "Oceania"){
                                            sessionStorage.setItem('lat', '-20');
                                            sessionStorage.setItem('long', '140');  
                                            sessionStorage.setItem('zoom', '4');                                               
                                        }
                                        else
                                        if (aRegionTimeLine.value == "North America"){
                                            sessionStorage.setItem('lat', '50');
                                            sessionStorage.setItem('long', '265');  
                                            sessionStorage.setItem('zoom', '4');   
                                        }
                                        else
                                        if (aRegionTimeLine.value == "Latin America & Carib"){
                                            sessionStorage.setItem('lat', '-20');
                                            sessionStorage.setItem('long', '360');  
                                            sessionStorage.setItem('zoom', '4');                                                
                                        }
                                        else{
                                            sessionStorage.setItem('lat', '22');
                                            sessionStorage.setItem('long', '155');  
                                            sessionStorage.setItem('zoom', '2.1');                                             
                                        }                                        

                                            // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                                            setTimeout(function () {
                                                location.reload()
                                            }, 500);

                                        });

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", function(xhr) {
    const data = JSON.parse(xhr.currentTarget.response);
    
    // Validar tiempos y geometrías

    migrationlist = [];
    migrationlist.length = 0;
 
    data.features.forEach(feature => {
      
        feature.properties.times = feature.properties.times.map(t => 
            parseInt(t) // Convertir a números
        );

       if (feature.properties.id === 10 || feature.properties.id === 12 || feature.properties.id === 13.0)
       {  
        let amigration =    
          {
            "atime": feature.properties.timefinal,
            "atitle": feature.properties.title
          }
         migrationlist.push(amigration)
       }
    });
    
data.features.sort((a,b) => 
Math.min(...a.properties.times) - Math.min(...b.properties.times));


setTimeout(function () {
    addGeoJSONLayer(map, data);
}, 3000);

    var lista = document.getElementById("displayed-list");
    lista.innerHTML = "";
    var aMarkAnt = "";
    var aChangeMark = false; 
// Escuchar el evento 'timeloading'
map.timeDimension.on('timeloading', function (e) {
    const currentTime = map.timeDimension.getCurrentTime();

    if (currentTime == -503)
    {
     var player = timeDimensionControl._player || map.timeDimension.getPlayer(); // Acceso al reproductor
     player.setTransitionTime(334);
    }

    if (currentTime == 500)
    {
     var player = timeDimensionControl._player || map.timeDimension.getPlayer(); // Acceso al reproductor
     player.setTransitionTime(400);
    }

    if (currentTime == 1500)
    {
     var player = timeDimensionControl._player || map.timeDimension.getPlayer(); // Acceso al reproductor
     player.setTransitionTime(500);
    }

    if (currentTime == 1800)
    {
     var player = timeDimensionControl._player || map.timeDimension.getPlayer(); // Acceso al reproductor
     player.setTransitionTime(1000);
    }
   
  if ((currentTime != currentTimeAnt) && (currentTime != -26508) && (currentTime != -890400)){  
    
    // Buscar la feature correspondiente al tiempo actual
    const currentFeature = data.features.find
    (feature => (feature.properties.timefinal === currentTime) && (feature.properties.id === 10 || feature.properties.id === 12 || feature.properties.id === 13.0)); //currentDate

    var li = document.createElement("li");
  
    if (currentFeature) {
      if (aMarkAnt != currentFeature.properties.title)
      {
       li.innerHTML = currentFeature.properties.title;
       lista.appendChild(li);
       aMarkAnt = currentFeature.properties.title;
      }      
    }
    else
    if (Math.abs(timeOld - currentTime) > 4500)
    {
        var enc = false;
        var i = 0;
        lista.innerHTML = "";
        li.innerHTML = "";
        while ((!enc) && (i < migrationlist.length )) {
            var li = document.createElement("li");
            li.innerHTML = migrationlist[i].atitle;
            lista.appendChild(li); 
            if (migrationlist[i].atime > currentTime) 
            {
             enc = true;
            }
            i++;
        }   
    };
};
    currentTimeAnt = currentTime;
    timeOld = currentTime;
  });
    
});

if (timeRange == "-15000/2025"){
    oReq.open('GET', timelinetimedimensiontimeline_15000_2025);
    }
    else
    if (timeRange == "-1800000/-804400"){
        oReq.open('GET', timelinetimedimensionHomoHerectus);
    }
    else
    if (timeRange == "-700000/-190539"){
        oReq.open('GET', timelinetimedimensionHomoHeidelBergensis);
    }
    else
    if (timeRange == "-69000/-15000"){
        oReq.open('GET', timelinetimedimensionHomoSapiens);
    }
    else
    if (timeRange == "-130000/-115000"){
        oReq.open('GET', timelinetimedimensiontimeline_130000_115000_HighTemperature);
   }

//oReq.open('GET', timelinetimedimension);
oReq.send();