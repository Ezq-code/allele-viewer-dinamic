
if (timeRange == "-12000/2025")
{

                    // función para actualizar el panel derecho a medida que corre la línea del tiempo.
                    // también se modifica el zoom y posición del mapa según los diferentes años de la línea del tiempo.
                    const date = new Date();
                    var year = date.getFullYear();
                    var timeMarkerArray = [];
                    var pauseMarkerArray = [];
                    var timeLinePosition = parseInt(sessionStorage.getItem('beginIntervalsesion'));
                    var inicialPosition = parseInt(sessionStorage.getItem('beginIntervalsesion'));
                    var pauseTimeline = false;
                    var delayTimePauseTimeLine = 3000;
                    var finaPosition = parseInt(sessionStorage.getItem('endIntervalsesion'));

                    function playTimeLine() {
                        timelineControl.play();
                        pauseTimeline = false;
                    }

                    const triggerTimer = () => {
                      var aDelay = Math.trunc(parseInt(sessionStorage.getItem('durationSesion'))/1000)-1; //317;
                      if (finaPosition - timeLinePosition - 2 > aDelay ) {
                        if (timeMarkerArray.length > 0){ 
                         if (pauseTimeline == false) {
                            var find = false;
                            //var aDelay = Math.trunc(parseInt(sessionStorage.getItem('durationSesion'))/1000)-1; //317;
                            if ((timeLinePosition > 0) && (finaPosition - timeLinePosition <= aDelay )){
                                aDelay = finaPosition - timeLinePosition;   
                            }
                            var i = timeLinePosition - aDelay;   
                            while ((!find) && ( i <= timeLinePosition + aDelay )) {
                               if (timeMarkerArray.indexOf(i) !== -1){  
                                   var anIndex = timeMarkerArray.indexOf(i);  
                                   delayTimePauseTimeLine = pauseMarkerArray[anIndex];        
                                   find = true;
                               }
                               i++;
                           }
                           if (find){
                             timelineControl.pause();
                             timelineControl.setTime(i);
                             pauseTimeline = true;
                             setTimeout(playTimeLine, delayTimePauseTimeLine);
                           }
                         }
                        }
                        setTimeout(triggerTimer, 5);
                       }
                    };
                                          
					function updateList(timeline) {
                                          
                                          /*  if (timeline.time < -130000) {
                                                map.setView(new L.LatLng(10, 120), 2);
                                            }
                                            else if ((timeline.time >= -130000) && (timeline.time <= -61051)) {
                                                map.setView(new L.LatLng(-3, 20), 3);
                                            } else if (timeline.time > -61051) {
                                                map.setView(new L.LatLng(10, 120), 2);
                                            } */
                                           
                                            if (timeline.time == year) {
                                                markerLayer.addTo(map);
                                            }
                                            else {
                                                markerLayer.remove();
                                            }

                                            var displayed = timeline.getLayers();
                                            var list = document.getElementById("displayed-list");
                                            list.innerHTML = "";
                                            displayed.forEach(function (quake) {

                                                var li = document.createElement("li");
                                                if (quake.feature.properties.title != null) {
                                                    li.innerHTML = quake.feature.properties.title;
                                                    list.appendChild(li);
                                                }
                                            });
                                            timeLinePosition = timeline.time;
                                            //migrationPoblationRegion.bringToBack();
                                        }
                                            
                                            var localbeginIntervalsesion = parseInt(sessionStorage.getItem('beginIntervalsesion'));
                                            var localendIntervalsesion = parseInt(sessionStorage.getItem('endIntervalsesion'));
                                            var localdurationSesion = parseInt(sessionStorage.getItem('durationSesion'));

                                            if ((localdurationSesion > 500000) && (localdurationSesion < 2000000)) {localdurationSesion = 40000}
                                            
                                            // duración de la línea del tiempo en general
                                            var timelineControl = L.timelineSliderControl({                                
                                             duration: localdurationSesion, //sessionStorage.getItem('durationSesion'), //315000, //55000
                                             steps: 1000,//1000(Math.abs(localbeginIntervalsesion)-Math.abs(localendIntervalsesion))/315,//1000, //175
                                             start: localbeginIntervalsesion, //sessionStorage.getItem('beginIntervalsesion'), //-315000,
                                             end: localendIntervalsesion //sessionStorage.getItem('endIntervalsesion') //2025
                                          });  
                                            
                                          var migrationPoblationRegion;
                                          var migrationPoints;

                    // eqfeed_callback es llamado una vez que el archivo geojsonp(contiene la vectorización del hielo, la tierra que emerge
                    // y las trayectorias de la migraciones) se carga. También se cargan los marcadores y los destinos de las migraciones
                    // a partir de llamadas ajax.
					function eqfeed_callback(data) {

                                            // intervalos de tiempo para las trayectorias de las migraciones
                                            var getInterval = function (quake) {
                                                if  (( quake.properties.id >= 1) && (quake.properties.id <= 9)) 
                                                {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: year
                                                    };
                                                }
                                                else
                                                if   (( quake.properties.id >= 11.1) && (quake.properties.id <= 11.29))    
                                                {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                    };
                                                }
                                                else
                                                if   (( quake.properties.id >= 12.1) && (quake.properties.id <= 12.99))    
                                                {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                    };
                                                }                                                                                                
                                            };
                                            
                                            var getIntervalIce = function (quake) {
                                                if (quake.properties.id == 100 ) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                        };
                                                }
                                            };

                                            var getIntervalLandEmerge = function (quake) {
                                                if ((quake.properties.id >= 1000) && (quake.properties.id <= 4500)) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                        };                                                  
                                                }
                                            };

                                            // intervalos de tiempo para los destinos de las migraciones
                                            var getShortInterval = function (quake) {

                                                if ((quake.properties.id == 10)  || (quake.properties.id == 11)) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: year
                                                        };
                                                }
                                                else
                                                if (quake.properties.id == 12) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                        };
                                                }
                                                else
                                                if (quake.properties.id == 13) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                        };
                                                }                                                                                                 
                                            };

                                           // intervalos de tiempo para las poblaciones y las regiones
                                           var getPoblationRegionInterval = function (quake) {

                                            if (quake.properties.id == 20) {
                                                return {
                                                    start: quake.properties.timefinal,
                                                    end: quake.properties.time
                                                    };
                                          }
                                         };

                                            // línea del tiempo y simbología para las trayectorias de las migraciones
                                            var migrationTraceRoute = L.timeline(data, {
                                                getInterval: getInterval,
                                                style: function (feature) {
                                                    if ((feature.properties.id >= 1) && (feature.properties.id <= 9))
                                                     {
                                                        return {
                                                            color: "#f6500c",//"#e1245a",//"#ffd700",//"#171717", "ffd700", "#051074",
                                                            fillColor: "#f6500c",//"#e1245a",//"#ffd700",//"#171717", eac102, "#051074",
                                                            fillOpacity: 1,
                                                            weight: 3,
                                                            opacity: 1,
                                                        }
                                                    }
                                                    else
                                                    if  ((feature.properties.id >= 11.1) && (feature.properties.id <= 11.29))
                                                     {
                                                        return {
                                                            color: "#F03687",//"#e1245a",//"#ffd700",//"#171717", "ffd700", "#051074",
                                                            fillColor: "#F03687",//"#e1245a",//"#ffd700",//"#171717", eac102, "#051074",
                                                            fillOpacity: 1,
                                                            weight: 3,
                                                            opacity: 1,
                                                        }
                                                    }
                                                    else
                                                    if  ((feature.properties.id >= 12.1) && (feature.properties.id <= 12.99))
                                                     {
                                                        return {
                                                            color: "#00aae4",//"#e1245a",//"#ffd700",//"#171717", "ffd700", "#051074",
                                                            fillColor: "#00aae4",//"#e1245a",//"#ffd700",//"#171717", eac102, "#051074",
                                                            fillOpacity: 1,
                                                            weight: 3,
                                                            opacity: 1,
                                                        }
                                                    }                                                    
                                                },
                                                pointToLayer: function (data, latlng) {

                                                    if (data.properties.id == 100) {
                                                        return L.polyline(latlngs, {
                                                            color: 'red'
                                                        });
                                                    } else
                                                      if
                                                     (data.properties.id == 10) {
                                                        return L.circleMarker(latlng, {
                                                            radius: data.properties.mag,
                                                            color: "#050400",
                                                            fillColor: "#f5d843",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }).bindPopup(L.popup({
                                                            closeOnClick: false,
                                                            autoClose: false
                                                        }).setContent(data.properties.place));
                                                    }
                                                },
                                            });

                                            // línea del tiempo y simbología para los vectores del hielo
                                            var timelineIce = L.timeline(data, {
                                                getInterval: getIntervalIce,
                                                style: function (feature) {
                                                    if (feature.properties.id == 100) {
                                                        return {
                                                            color: '#FFFFFF',
                                                            fillColor: '#FFFFFF',
                                                            fillOpacity: 0.9,
                                                            weight: 2,
                                                            opacity: 1,
                                                        }
                                                    }
                                                },
                                                pointToLayer: function (data, latlng) {

                                                    if (data.properties.id == 100) {
                                                        return L.polyline(latlngs, {
                                                            color: 'red'
                                                        });
                                                    } else if (data.properties.id == 10) {
                                                        return L.circleMarker(latlng, {
                                                            radius: data.properties.mag,
                                                            color: "#050400",
                                                            fillColor: "#f5d843",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }).bindPopup(L.popup({
                                                            closeOnClick: false,
                                                            autoClose: false
                                                        }).setContent(data.properties.place));
                                                    }
                                                },
                                            });

                                            // línea del tiempo para la tierra que emerge
                                            var timelineLandEmerge = L.timeline(data, {
                                                getInterval: getIntervalLandEmerge,
                                                style: function (feature) {
                                                    if ((feature.properties.id >= 1000) && (feature.properties.id <= 4500)) { 
                                                        return {
                                                            color: feature.properties.mag,
                                                            fillColor: feature.properties.mag,
                                                            fillOpacity: 1,
                                                            weight: 2,
                                                            opacity: 1,
                                                        }
                                                    }
                                                },
                                                pointToLayer: function (data, latlng) {

                                                    if (data.properties.id == 100) {
                                                        return L.polyline(latlngs, {
                                                            color: 'red'
                                                        });
                                                    } else if (data.properties.id == 10) {
                                                        return L.circleMarker(latlng, {
                                                            radius: data.properties.mag,
                                                            color: "#050400",
                                                            fillColor: "#f5d843",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }).bindPopup(L.popup({
                                                            closeOnClick: false,
                                                            autoClose: false
                                                        }).setContent(data.properties.place));
                                                    }
                                                },
                                            });

                                            // línea del tiempo y simbología para los destinos de las migraciones
                                            migrationPoints = L.timeline(data, {
                                                getInterval: getShortInterval,
                                                style: function (feature) {
                                                    if (feature.properties.id == 10) {
                                                        return {

                                                            radius: 10, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }
                                                    }
                                                    else
                                                    if (feature.properties.id == 11) {
                                                        return {

                                                            radius: 6, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }
                                                    }
                                                    else
                                                    if (feature.properties.id == 12) {
                                                        return {

                                                            radius: 6, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }
                                                    }
                                                    else
                                                    if (feature.properties.id == 13) {
                                                        return {

                                                            radius: 6, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                        }
                                                    }                                                    
                                                },
                                                pointToLayer: function (data, latlng) {
                                                   
                                                    if ((data.properties.id == 10) || (data.properties.id == 11))  {

                                                        return L.marker(latlng, {
                                                            icon:
                                                                L.icon({
                                                                    iconUrl: iconUrlpathDestinationMigration,
                                                                    iconSize: [44, 42],
                                                                    shadowSize: [41, 41],
                                                                    shadowAnchor: [13, 20]
                                                                })
                                                        }).bindPopup(data.properties.title);
                                                    }
                                                    else
                                                    if  (data.properties.id == 12) {

                                                        return L.marker(latlng, {
                                                            icon:
                                                                L.icon({
                                                                    iconUrl: iconUrlpathDestinationMigrationHomoHeidel,
                                                                    iconSize: [44, 42],
                                                                    shadowSize: [41, 41],
                                                                    shadowAnchor: [13, 20]
                                                                })
                                                        }).bindPopup(data.properties.title);
                                                    }
                                                    else
                                                    if  (data.properties.id == 13) {

                                                        return L.marker(latlng, {
                                                            icon:
                                                                L.icon({
                                                                    iconUrl: iconUrlpathDestinationMigrationHomoHerectus,
                                                                    iconSize: [44, 42],
                                                                    shadowSize: [41, 41],
                                                                    shadowAnchor: [13, 20]
                                                                })
                                                        }).bindPopup(data.properties.title);
                                                    }                                                    
                                                },
                                            });
                                            
                                            // línea del tiempo y simbología para las poblaciones
                                             migrationPoblationRegion = L.timeline(data, {
                                                getInterval: getPoblationRegionInterval,
                                                style: function (feature) {
                                                    if (feature.properties.id == 20) {
                                                        return {
                                                            color: GetColorByPopulation(feature.properties.mag), //"#E6EEFF", //"#000000",
                                                            fillColor: GetColorByPopulation(feature.properties.mag),//"#E6EEFF",//"#000000",
                                                            fillOpacity: 0.6,
                                                            //weight: 3,
                                                            //opacity: 0.8,
                                                        }
                                                    }
                                                },
                                                onEachFeature: function (feature, layer) {
                                                    let nf = new Intl.NumberFormat('en-US');
                                                    if (feature.properties.id == 20) {
                                                        layer.bindPopup(L.popup({
                                                            closeOnClick: false,
                                                            autoClose: false
                                                        }).setContent(feature.properties.place+", "+nf.format(feature.properties.mag)+" people."));
                                                    }
                                                },
                                            });

                                            // llamada ajax para cargar los marcadores, su simbología, su línea del tiempo y adición al mapa  
                                            var polygonTimeline;
                                            var polygons;
                                            var aFeatures = [];
                                            var aFeaturesAll = [];
                                            var aFeatureAll = [];
                                            var aFeature;
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
                                                    var data;
                                                    data = response.results;
                                                    data.forEach(function (event) {
                                                        var nameLoad = event.event_name;
                                                        var descriptionLoad = event.description;
                                                        var referenceLoad = event.reference;
                                                        var typeEventLoad = event.event_type_info.id;
                                                        if (event.event_icon == null)
                                                         {var iconUrlCurrentMarkerLoad = event.event_type_info.icon;}
                                                        else
                                                         {var iconUrlCurrentMarkerLoad = event.event_icon;}
                                                         var starttime = event.start_date;
                                                        var endtime = event.end_date;
                                                        var aPauseMarker = event.pause_time;
                                                        var aPauseEvent = event.event_type_info.pause_time;
                                                        var galleryLoad = event.event_gallery;

                                                        timeMarkerArray.push(starttime);
                                                        if (aPauseMarker == 0){
                                                            aPauseMarker = aPauseEvent;
                                                        }
                                                        
                                                        pauseMarkerArray.push(aPauseMarker);
                                                        
                                                        var markerList = event.markers;
                                                        markerList.forEach(function (marker) {
                                                         var latitudeLoad = marker.latitude;
                                                         var longitudeLoad = marker.longitude;

                                                         aFeature = {
                                                            type: "Feature",
                                                            properties: {
                                                                event_name: nameLoad,
                                                                description: descriptionLoad,
                                                                reference: referenceLoad,
                                                                event_type_id: typeEventLoad,
                                                                iconUrlEvent: iconUrlCurrentMarkerLoad,
                                                                start: starttime,
                                                                end: endtime,
                                                                gallery: galleryLoad
                                                            },
                                                            geometry: {
                                                                type: "Point",
                                                                coordinates:
                                                                    [longitudeLoad, latitudeLoad],
                                                            },
                                                        };
                                                        aFeatures.push(aFeature);
                                                        polygons = {
                                                            type: "FeatureCollection",
                                                            features: aFeatures,
                                                        };
                                                    });
                                                    });

                                                    var getpoligonInterval = function (polygons) {
                                                        return {
                                                            start: polygons.properties.start,
                                                            end: polygons.properties.end,
                                                        };                                                      

                                                    };
                                                    var polygonTimeline = L.timeline(polygons, {
                                                        getInterval: getpoligonInterval,
                                                        pointToLayer: function (features, latlng) {
                                                            // Crear el marcador sin bindPopup
                                                            var marker = L.marker(latlng, {
                                                                icon: L.icon({
                                                                    iconUrl: features.properties.iconUrlEvent,
                                                                    iconSize: [25, 41],
                                                                    shadowSize: [41, 41],
                                                                    shadowAnchor: [13, 20]
                                                                })
                                                            });

                                                            // Agregar el evento de clic al marcador
                                                            marker.on('click', function () {
                                                                // Mostrar la galería de imágenes en el modal
                                                                var eventImagesDiv = document.getElementById('eventImages');
                                                                eventImagesDiv.innerHTML = '';
                                                                // Mostrar la descripción y otra información en el modal
                                                                document.getElementById('eventName').innerHTML = features.properties.event_name;
                                                                document.getElementById('eventDescription').innerHTML = features.properties.description; // aqui enviamos la description
                                                                document.getElementById('eventReference').innerHTML = features.properties.reference; // aqui enviamos la referencia
                                                                // Aquí usamos la galería que agregamos en las propiedades
                                                                if (features.properties.gallery && features.properties.gallery.length > 0) {
                                                                    features.properties.gallery.forEach(function (image) {
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

                                                                $('#eventModal').modal('show'); // Mostrar el modal
                                                            });

                                                            // Devolver el marcador
                                                            return marker;
                                                        }
                                                    });
                                                    timelineControl.addTimelines(polygonTimeline);
                                                    polygonTimeline.addTo(map);

                                                }
                                            });
                                            
                                            // capa para los alleles
                                            AlleleGeographicZonesLayer = new L.featureGroup().addTo(map);

                                            // adicion de los timelines al timelineControl, y adición al mapa
                                            migrationPoblationRegion.addTo(map);
                                            timelineControl.addTo(map);
                                            timelineControl.addTimelines(migrationPoblationRegion, migrationTraceRoute, timelineIce, timelineLandEmerge, migrationPoints); 
                                            migrationTraceRoute.addTo(map);
                                            migrationPoints.addTo(map);
                                            timelineIce.addTo(map);
                                            timelineLandEmerge.addTo(map);

                                            // creación de las capas bases y adición al control de capas del mapa
                                            const baseLayers = {
                                                'Countries': osmcountriesLayers,
                                                'Satelital': satelitalLayer,
                                                'Ocean': oceanLayer
                                            };

                                            const overlays = {
                                                //'Land Last Glacial Maximum': LandLGMShapefile,
                                                'Glacials': timelineIce,
                                                'Land Emerge': timelineLandEmerge,
                                                'Migration Trace Route': migrationTraceRoute,
                                                'Migration Points': migrationPoints,
                                                'Marker Layer': markerLayer,
                                                'Population by Region': migrationPoblationRegion,
                                                'Allele Geographic Zones': AlleleGeographicZonesLayer
                                            };

                                            var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

                                            migrationPoblationRegion.setZIndex(3);

                                            migrationPoblationRegion.remove();

                                            // llamada ajax para cargar la visualidad de las capas del mapa
                                            $.ajax({
                                                type: 'GET',
                                                url: '/business-gestion/layers/',
                                                error: function () {
                                                    Swal.fire({
                                                        icon: "error",
                                                        title: "No se pudieron cargar los datos a ver si.",
                                                        showConfirmButton: false,
                                                        timer: 1500
                                                    });
                                                },
                                                dataType: 'json',
                                                success: function (response) {
                                                    var data;
                                                    data = response.results;
                                                    data.forEach(function (aLayer) {
                                                        //if ((aLayer.name == "osmcountriesLayers") && (aLayer.is_visible == false) ) {layerControl.removeLayer(osmcountriesLayers)}
                                                        //if ((aLayer.name == "satelitalLayer") && (aLayer.is_visible == false) ) {layerControl.removeLayer(satelitalLayer)}
                                                        //if ((aLayer.name == "oceanLayer") && (aLayer.is_visible == false) ) {layerControl.removeLayer(oceanLayer)}
                                                        //if ((aLayer.name == "LandLGMShapefile") && (aLayer.is_visible == false) ) {layerControl.removeLayer(LandLGMShapefile)}
                                                        if ((aLayer.name == "migrationTraceRoute") && (aLayer.is_visible == false)) {
                                                            layerControl.removeLayer(migrationTraceRoute)
                                                        }
                                                        if ((aLayer.name == "migrationPoints") && (aLayer.is_visible == false)) {
                                                            layerControl.removeLayer(migrationPoints)
                                                        }
                                                        if ((aLayer.name == "markerLayer") && (aLayer.is_visible == false)) {
                                                            layerControl.removeLayer(markerLayer)
                                                        }
                                                    });
                                                }
                                            });

                                            setTimeout(triggerTimer, 5);

                                            // llamada a la función que actualiza el panel de derecho en evento "change" de los timelines y también se llama al final
                                            //map.addLayer(LandLGMShapefile);
                                            migrationTraceRoute.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            migrationPoints.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            //polygonDestinationTimeline.on("change", function (e) {
                                            //    updateList(e.target);
                                            //});
                                            updateList(migrationTraceRoute);
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
    
                                            sessionStorage.setItem('beginIntervalsesion', parseInt(aBegin));
                                            sessionStorage.setItem('endIntervalsesion', parseInt(anEnd));  
                                            sessionStorage.setItem('durationSesion', parseInt(anEnd)-parseInt(aBegin));

                                            // se muestra una alerta donde se especifica que se está actualizando la línea del tiempo
                                            /*
                                            Swal.fire({
                                                title: 'Updating TimeLine...',
                                                showConfirmButton: false,
                                                willOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });
                                            */
                                            // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                                            setTimeout(function () {
                                                location.reload()
                                            }, 500);

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
    
                                            sessionStorage.setItem('beginIntervalsesion', parseInt(aBegin));
                                            sessionStorage.setItem('endIntervalsesion', parseInt(anEnd));  
                                            sessionStorage.setItem('durationSesion', parseInt(anEnd)-parseInt(aBegin));
                                         


                                        if (aRegionTimeLine.value == "All the World"){ 
                                          sessionStorage.setItem('lat', '10');
                                          sessionStorage.setItem('long', '120');  
                                          sessionStorage.setItem('zoom', '2');    
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
                                            sessionStorage.setItem('lat', '10');
                                            sessionStorage.setItem('long', '120');  
                                            sessionStorage.setItem('zoom', '2');                                             
                                        }                                        

                                            // se muestra una alerta donde se especifica que se está actualizando la línea del tiempo
                                            /*
                                            Swal.fire({
                                                title: 'Updating TimeLine...',
                                                showConfirmButton: false,
                                                willOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });
                                            */
                                            // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                                            setTimeout(function () {
                                                location.reload()
                                            }, 500);

                                        });

}
else
{

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
               //console.log("Events loaded:", allEvents.length);
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
        pointToLayer: (f, latlng) => L.marker(latlng, {
            icon:
                L.icon({
                    iconUrl: iconUrlpathDestinationMigrationHomoHeidel,
                    iconSize: [45, 45],
                    shadowSize: [45, 45],
                    shadowAnchor: [17, 23]
                })
        }).bindPopup(f.properties.title)
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
                if (feature.properties.mag === "-1")
                {
                    return {
                        fillColor: GetColorByPopulation(feature.properties.mag),
                        fillOpacity: 0.0,
                        color: GetColorByPopulation(feature.properties.mag),
                        weight: 2,
                        opacity: 0.0,
                        };
               }
               else
                {
                   return {
                       color: GetColorByPopulation(feature.properties.mag),
                       fillOpacity: 0.5,
                       fillColor: GetColorByPopulation(feature.properties.mag),
                       weight: 2,
                       opacity: 0.5,
                   }
               }                
             },
             onEachFeature: function (feature, layer) {
                let nf = new Intl.NumberFormat('en-US');
                if (feature.properties.id == 20) {
                    layer.bindPopup(L.popup({
                        closeOnClick: false,
                        autoClose: false
                    }).setContent(feature.properties.place+", "+nf.format(feature.properties.mag)+" people."));
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

                                            // se muestra una alerta donde se especifica que se está actualizando la línea del tiempo
                                            /*
                                            Swal.fire({
                                                title: 'Updating TimeLine...',
                                                showConfirmButton: false,
                                                willOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });
                                            */
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
                                          sessionStorage.setItem('lat', '15');
                                          sessionStorage.setItem('long', '215');  
                                          sessionStorage.setItem('zoom', '1.8');    
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

                                            // se muestra una alerta donde se especifica que se está actualizando la línea del tiempo
                                            /*
                                            Swal.fire({
                                                title: 'Updating TimeLine...',
                                                showConfirmButton: false,
                                                willOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });
                                            */
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
        //timeAnt = migrationlist[0].atime;
        while ((!enc) && (i < migrationlist.length )) {
            var li = document.createElement("li");
            li.innerHTML = migrationlist[i].atitle;
            lista.appendChild(li); 
            //if (((Math.abs(migrationlist[i].atime - currentTime)) > (Math.abs(timeAnt - currentTime))) && (Math.abs(migrationlist[i].atime - currentTime) < 300))
            if (migrationlist[i].atime > currentTime) 
            {
             enc = true;
            }
            //timeAnt = migrationlist[i].atime;
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


}