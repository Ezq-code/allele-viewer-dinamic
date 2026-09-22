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

// Función modificada para sincronización
function addGeoJSONLayer(map, data) {

var geoJsonData;
// 1. Función de conversión de años a fechas
const BASE_YEAR = 2026; // Año de referencia (actual)
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
        duration: "PT30M",//"PT1S",//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
        //duration: "PT406S",//"PT76M", 
        timeInterval: "PT11S",//"PT1S", //"2019-11-23T12:01:05Z/2019-11-23T13:17:05Z", // Rango exacto//timeInterval: "PT1S",
        timeField: function(feature) {
            return feature.properties.times.map(t => yearToDate(t));
        },        
        getLineId: f => f.properties.name
    });
    
    
        // 2. Capa de destinos de las migraciones
        var pointLayerAllele = L.timeDimension.layer.geoJson(L.geoJSON(data, {
            filter: f => f.geometry.type === 'Point' && f.properties.id === 66,
            pointToLayer: (f, latlng) => {
                var marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: iconUrlpathDestinationMigrationAllele,
                        iconSize: [20, 20],
                        shadowSize: [20, 20],
                        shadowAnchor: [10, 11]
                    })
                });
                marker.bindTooltip(f.properties.title, {
                    permanent: true,
                    direction: 'left',
                    offset: [-6, -5],
                    className: 'marker-tooltip'
                });
                return marker;
            }
        }), {
          updateTimeDimensionMode: 'intersect',  // Mantiene el objeto visible durante todo el rango
          duration: "PT1S",//"PT16M",                  // Duración total = Fin - Inicio (76 minutos)
          timeInterval: "PT11S",//"PT16M",              // Mismo que duration para rango continuo
          addlastPoint: false,                  // Evita saltos al final
          timeField: function(feature) {
            // Convert each time from seconds to milliseconds
            return feature.properties.times.map(t => t * 1000);
          }
        });

    const validEvents = this.validateEvents(allEvents);
    
    //geoJsonData = this.createGeoJsonData4(validEvents);
       
       // areaLayerTierra.addTo(map);
       //areaLayerPoblacion.addTo(map);
       //areaLayerHielo.addTo(map);
       lineLayer.addTo(map);
       //pointLayer.addTo(map);
       //pointMarkerLayer.addTo(map);
       pointLayerAllele.addTo(map);
    
     // creación de las capas bases y adición al control de capas del mapa
    const baseLayers = {
        'Countries': osmcountriesLayers,
        'Satelital': satelitalLayer,
        'Ocean': oceanLayer
    };
    
    const overlays = {
        'Migration Trace Route': lineLayer,
        /*
        'Migration Points': pointLayer,
        'Glacials': areaLayerHielo,
        'Population by Region': areaLayerPoblacion,
        'Land Emerge': areaLayerTierra,
        'Marker Layer': markerLayer,
        */
        'Migration Allele': pointLayerAllele
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
                                                sessionStorage.setItem('timedelayice', 'PT9S');
                                                sessionStorage.setItem('timedelayland', 'PT9S');
                                            } 

                                            // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                                            setTimeout(function () {
                                                location.reload()
                                            }, 500);

                                          });


                                        document.getElementById('btreload').addEventListener('click', function() {
                                            
                                          
                                            var aTimeRange = document.getElementById("timeRange");
                                            aTimeRange.value = timeRange;
                                            //var aRegionTimeLine = document.getElementById("regionTimeLine");
                                            sessionStorage.setItem('timeRange', aTimeRange.value);
                                            //sessionStorage.setItem('region', aRegionTimeLine.value);
                                            
                                            var aPosition = aTimeRange.value.indexOf("/");
                                            var aBegin = aTimeRange.value.substring(0,aPosition);
                                            var anEnd = aTimeRange.value.substring(aPosition+1);
                                            timeOld = aBegin;
                                            timeAnt = aBegin - 10000;
    
                                            sessionStorage.setItem('beginIntervalsesion', parseInt(aBegin));
                                            sessionStorage.setItem('endIntervalsesion', parseInt(anEnd));  
                                            sessionStorage.setItem('durationSesion', parseInt(anEnd)-parseInt(aBegin));

                                            sessionStorage.setItem('lat', '5');
                                            sessionStorage.setItem('long', '155');  
                                            sessionStorage.setItem('zoom', '2.1');    
                                         
                                    
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

    if (currentTime == -18000000)
    {
     var player = timeDimensionControl._player || map.timeDimension.getPlayer(); // Acceso al reproductor
     player.setTransitionTime(400);
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
   else
   if (timeRange == "-18000000/-2000"){
       oReq.open('GET', timelinetimedimensiontimeline_Alleles);
  }

//oReq.open('GET', timelinetimedimension);
oReq.send();