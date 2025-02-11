                    // función para actualizar el panel derecho a medida que corre la línea del tiempo.
                    // también se modifica el zoom y posición del mapa según los diferentes años de la línea del tiempo.
                    const date = new Date();
                    var year = date.getFullYear();
                    var timeMarkerArray = [];
                    var pauseMarkerArray = [];
                    var timeLinePosition = 315000;
                    var pauseTimeline = false;
                    var delayTimePauseTimeLine = 3000;
                    
                    function playTimeLine() {
                        timelineControl.play();
                        pauseTimeline = false;
                    }

                    const triggerTimer = () => {
                        if (timeMarkerArray.length > 0){ 
                         if (pauseTimeline == false) {
                            var find = false;
                            var aDelay = 317;
                            if ((timeLinePosition > 0) && (year - timeLinePosition <= aDelay )){
                                aDelay = year - timeLinePosition;   
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
                      };
                                          
					function updateList(timeline) {
                                          
                                            if (timeline.time < -130000) {
                                                map.setView(new L.LatLng(10, 120), 2);
                                            }
                                            else if ((timeline.time >= -130000) && (timeline.time <= -61051)) {
                                                map.setView(new L.LatLng(-3, 20), 3);
                                            } else if (timeline.time > -61051) {
                                                map.setView(new L.LatLng(10, 120), 2);
                                            }
                                           
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
                                            migrationPoblationRegion.bringToBack();
                                        }

                                             // duración de la línea del tiempo en general
                                             var timelineControl = L.timelineSliderControl({
                                                //options: new TimelineSliderControlOptions duration: 315000                                
                                              duration: 315000,
                                              steps: 1000
                                            });    

                                          var migrationPoblationRegion;
                                          var migrationPoints;

                    // eqfeed_callback es llamado una vez que el archivo geojsonp(contiene la vectorización del hielo, la tierra que emerge
                    // y las trayectorias de la migraciones) se carga. También se cargan los marcadores y los destinos de las migraciones
                    // a partir de llamadas ajax.
					function eqfeed_callback(data) {

                                            // intervalos de tiempo para las trayectorias de las migraciones
                                            var getInterval = function (quake) {
                                                if (( quake.properties.id >= 1) && (quake.properties.id <= 9)) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: year
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
                                                        end: year//quake.properties.time
                                                    };
                                                }
                                            };

                                           // intervalos de tiempo para las poblaciones y las regiones
                                           var getPoblationRegionInterval = function (quake) {

                                            if (quake.properties.id == 20) {
                                              return {
                                                  start: quake.properties.timefinal,
                                                  end: quake.properties.time,//quake.properties.time
                                                  duration: 315000
                                              };
                                          }
                                         };

                                            // línea del tiempo y simbología para las trayectorias de las migraciones
                                            var migrationTraceRoute = L.timeline(data, {
                                                getInterval: getInterval,
                                                style: function (feature) {
                                                    if ((feature.properties.id >= 1) && (feature.properties.id <= 9)) {
                                                        return {
                                                            color: "#ffd700",//"#171717", ffd700
                                                            fillColor: "#ffd700",//"#171717", eac102
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
                                                },
                                                pointToLayer: function (data, latlng) {
                                                   
                                                    if ((data.properties.id == 10) || (data.properties.id == 11)) {

                                                        return L.marker(latlng, {
                                                            icon:
                                                                L.icon({
                                                                    iconUrl: iconUrlpathDestinationMigration,
                                                                    iconSize: [44, 42],
                                                                    shadowSize: [41, 41],
                                                                    shadowAnchor: [13, 20]
                                                                })
                                                        }).bindPopup(data.properties.title);
                                                        
                                                       /*
                                                        return L.circleMarker(latlng, {

                                                            radius: 10, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,

                                                        }).bindPopup(L.popup({
                                                            closeOnClick: false,
                                                            autoClose: false
                                                        }).setContent(data.properties.title));
                                                        */
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
                                                url: '/business-gestion/markers/',
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
                                                    data.forEach(function (marker) {
                                                        var descriptionLoad = marker.description;
                                                        var referenceLoad = marker.reference;
                                                        var latitudeLoad = marker.latitude;
                                                        var longitudeLoad = marker.longitude;
                                                        var typeEventLoad = marker.event_type_data.event_id;
                                                        var iconUrlCurrentMarkerLoad = marker.event_type_data.event_icon_url;
                                                        var starttime = marker.start_date;
                                                        var endtime = marker.end_date;
                                                        var astart_format = marker.start_format;
                                                        var aend_format = marker.end_format;
                                                        var aPauseMarker = marker.pause_time;
                                                        var aPauseEvent = marker.event_type_data.event_pause_time;
                                                        var galleryLoad = marker.marker_galleries; // Obtener el array de imágenes
                                                        if ((astart_format == "Before Present (YBP)") || (astart_format == "Before Christ (BC)")) {
                                                            starttime = -1 * starttime;
                                                        }
                                                        if ((aend_format == "Before Present (YBP)") || (aend_format == "Before Christ (BC)")) {
                                                            endtime = -1 * endtime;
                                                        }
                                                        timeMarkerArray.push(starttime);
                                                        if (aPauseMarker == 0){
                                                            aPauseMarker = aPauseEvent;
                                                        }
                                                        pauseMarkerArray.push(aPauseMarker);
                                                        aFeature = {
                                                            type: "Feature",
                                                            properties: {
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

                                                    var getpoligonInterval = function (polygons) {
                                                        return {
                                                            start: polygons.properties.start,
                                                            end: polygons.properties.end,
                                                        }
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

                                            // llamada ajax para cargar los destinos de las migraciones, su simbología, su línea del tiempo y adición al mapa
                                            /*var polygonDestinationTimeline;
                                            var polygons;
                                            var aFeaturesDestination = [];
                                            var aFeaturesAllDestination = [];
                                            var aFeatureAllDestination = [];
                                            var aFeatureDestination;
                                            $.ajax({
                                                type: 'GET',
                                                url: '/business-gestion/features/list',
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
                                                    data = response;
                                                    data.forEach(function (destination) {
                                                        var id = destination.id;
                                                        var idLoad = destination.feature_id;
                                                        var magLoad = destination.mag;
                                                        var placeLoad = destination.place;
                                                        var descriptionLoad = destination.title;
                                                        var latitudeLoad = destination.latitude;
                                                        var longitudeLoad = destination.longitude;
                                                        var starttime = destination.timefinal;
                                                        var endtime = destination.time;
                                                        aFeatureDestination = {
                                                            type: "Feature",
                                                            properties: {
                                                                id: idLoad,
                                                                mag: magLoad,
                                                                place: placeLoad,   
                                                                title: descriptionLoad,
                                                                timefinal: starttime,
                                                                time: endtime,
                                                            },
                                                            geometry: {
                                                                type: "Point",
                                                                coordinates:
                                                                    [longitudeLoad, latitudeLoad],
                                                            },
                                                        };
                                                        aFeaturesDestination.push(aFeatureDestination);
                                                        polygons = {
                                                            type: "FeatureCollection",
                                                            features: aFeaturesDestination,
                                                        };
                                                    });

                                                    var getpoligonIntervalDestintation = function (polygons) {
                                                        return {
                                                            start: polygons.properties.timefinal,
                                                            end: year,//polygons.properties.time,
                                                        }
                                                    };

                                                    var polygonDestinationTimeline = L.timeline(polygons, {
                                                        getInterval: getpoligonIntervalDestintation,
                                                        pointToLayer: function (features, latlng) {
                                                            return L.circleMarker(latlng, {
                                                            radius: 10, //features.properties.mag,
                                                            color: "#050400", //"#000000",
                                                            fillColor: "#f5d843",//"#000000",
                                                            fillOpacity: 0.7,
                                                            weight: 3,
                                                            opacity: 0.8,
                                                            }).bindPopup(L.popup({
                                                             closeOnClick: false,
                                                             autoClose: false
                                                            }).setContent(features.properties.title));
                                                        }
                                                    });
                                                    timelineControl.addTimelines(polygonDestinationTimeline);
                                                    polygonDestinationTimeline.addTo(map);

                                                }
                                            });*/
                                            
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