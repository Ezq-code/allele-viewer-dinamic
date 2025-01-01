                    // función para actualizar el panel derecho a medida que corre la línea del tiempo.
                    // también se modifica el zoom y posición del mapa según los diferentes años de la línea del tiempo.
                    const date = new Date();
                    var year = date.getFullYear();
                    
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
                                        }

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

                                            // duración de la línea del tiempo en general
                                            var timelineControl = L.timelineSliderControl({
                                                duration: 315000,
                                            });

                                            // línea del tiempo y simbología para las trayectorias de las migraciones
                                            var migrationTraceRoute = L.timeline(data, {
                                                getInterval: getInterval,
                                                style: function (feature) {
                                                    if ((feature.properties.id >= 1) && (feature.properties.id <= 9)) {
                                                        return {
                                                            color: "#555555",//"#171717",
                                                            fillColor: "#555555",//"#171717",
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
                                            var migrationPoints = L.timeline(data, {
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
                                                        }).setContent(data.properties.place));
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
                                                        var latitudeLoad = marker.latitude;
                                                        var longitudeLoad = marker.longitude;
                                                        var typeEventLoad = marker.event_type_data.event_id;
                                                        var iconUrlCurrentMarkerLoad = marker.event_type_data.event_icon_url;
                                                        var starttime = marker.start_date;
                                                        var endtime = marker.end_date;
                                                        var astart_format = marker.start_format;
                                                        var aend_format = marker.end_format;
                                                        if ((astart_format == "Before Present (YBP)") || (astart_format == "Before Christ (BC)")) {
                                                            starttime = -1 * starttime;
                                                        }
                                                        if ((aend_format == "Before Present (YBP)") || (aend_format == "Before Christ (BC)")) {
                                                            endtime = -1 * endtime;
                                                        }
                                                        aFeature = {
                                                            type: "Feature",
                                                            properties: {
                                                                description: descriptionLoad,
                                                                event_type_id: typeEventLoad,
                                                                iconUrlEvent: iconUrlCurrentMarkerLoad,
                                                                start: starttime,
                                                                end: endtime,
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

                                                            return L.marker(latlng, {
                                                                icon:

                                                                    L.icon({
                                                                        iconUrl: features.properties.iconUrlEvent,
                                                                        iconSize: [25, 41],
                                                                        shadowSize: [41, 41],
                                                                        shadowAnchor: [13, 20]
                                                                    })
                                                            }).bindPopup(features.properties.description);
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
                                            timelineControl.addTo(map);
                                            timelineControl.addTimelines(migrationTraceRoute, timelineIce, timelineLandEmerge, migrationPoints); 
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
                                                'Allele Geographic Zones': AlleleGeographicZonesLayer
                                            };

                                            var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

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

                                            // llamada a la función que actualiza el panel de derecho en evento "change" de los timelines y también se llama al final
                                            //map.addLayer(LandLGMShapefile);
                                            migrationTraceRoute.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            migrationPoints.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            polygonDestinationTimeline.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            updateList(migrationTraceRoute);
                                        }