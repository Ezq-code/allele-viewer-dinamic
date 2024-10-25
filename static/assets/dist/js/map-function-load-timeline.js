                                        //For Update TimeLine Description in the right panel
					function updateList(timeline) {

                                            if (timeline.time < -130000) {
                                                map.setView(new L.LatLng(10, 120), 2);
                                            }
                                            else if ((timeline.time >= -130000) && (timeline.time <= -61051)) {
                                                map.setView(new L.LatLng(-3, 20), 3);
                                            } else if (timeline.time > -61051) {
                                                map.setView(new L.LatLng(10, 120), 2);
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


                                        // eqfeed_callback is called once the migration geojsonp file below loads
					function eqfeed_callback(data) {

                                            var getInterval = function (quake) {
                                                if ((quake.properties.id == 100) || (quake.properties.id == 160) || (quake.properties.id == 220) || (quake.properties.id == 280) || (quake.properties.id == 340) || (quake.properties.id == 400) || (quake.properties.id == 480) || (quake.properties.id == 560) || (quake.properties.id == 640) || (quake.properties.id == 700) || (quake.properties.id == 750) || ((quake.properties.id >= 1000) && (quake.properties.id <= 4500))) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                    };
                                                }
                                            };

                                            var getShortInterval = function (quake) {

                                                if ((quake.properties.id == 10) || ((quake.properties.id >= 1) && (quake.properties.id <= 9.9))) {
                                                    return {
                                                        start: quake.properties.timefinal,
                                                        end: quake.properties.time
                                                    };
                                                }
                                            };

                                            var timelineControl = L.timelineSliderControl({
                                                duration: 315000,
                                            });

                                            var migrationTraceRoute = L.timeline(data, {
                                                getInterval: getInterval,
                                                style: function (feature) {
                                                    if ((feature.properties.id == 100) || (feature.properties.id == 160) || (feature.properties.id == 220) || (feature.properties.id == 280) || (feature.properties.id == 340) || (feature.properties.id == 400) || (feature.properties.id == 480) || (feature.properties.id == 560) || (feature.properties.id == 640) || (feature.properties.id == 700) || (feature.properties.id == 750)) {
                                                        return {
                                                            color: '#FFFFFF',
                                                            fillColor: '#FFFFFF',
                                                            fillOpacity: 0.9,
                                                            weight: 2,
                                                            opacity: 1,
                                                        }
                                                    }
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

                                                    if ((data.properties.id == 100) || (data.properties.id == 160) || (data.properties.id == 220) || (data.properties.id == 280) || (data.properties.id == 340) || (data.properties.id == 400) || (data.properties.id == 480) || (data.properties.id == 560) || (data.properties.id == 640) || (data.properties.id == 700) || (data.properties.id == 750) || (data.properties.id == 1000) || (data.properties.id == 1100) || (data.properties.id == 1200) || (data.properties.id == 1300) || (data.properties.id == 1400)) {
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


                                            var migrationPoints = L.timeline(data, {
                                                getInterval: getShortInterval,
                                                style: function (feature) {
                                                    if ((feature.properties.id >= 1) && (feature.properties.id <= 9.9)) {

                                                        return {
                                                            color: "#171717",
                                                            fillColor: "#171717",
                                                            fillOpacity: 1,
                                                            weight: 6,
                                                            opacity: 1,
                                                        }
                                                    }
                                                },
                                                pointToLayer: function (data, latlng) {
                                                    if (data.properties.id == 10) {
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
                                                    data = response;
                                                    data.forEach(function (marker) {
                                                        var descriptionLoad = marker.description;
                                                        var latitudeLoad = marker.latitude;
                                                        var longitudeLoad = marker.longitude;
                                                        var typeEventLoad = marker.event_type.event_id;
                                                        var iconUrlCurrentMarkerLoad = marker.event_type.event_icon_url;
                                                        var starttime = marker.start_date;
                                                        var endtime = marker.end_date;
                                                        var astart_format = marker.start_format;
                                                        var aend_format = marker.end_format;
                                                        if ((astart_format == "Beforepresent") || (astart_format == "Beforechrist")) {
                                                            starttime = -1 * starttime;
                                                        }
                                                        if ((aend_format == "Beforepresent") || (aend_format == "Beforechrist")) {
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

                                            AlleleGeographicZonesLayer = new L.featureGroup().addTo(map);

                                            timelineControl.addTo(map);
                                            timelineControl.addTimelines(migrationTraceRoute, migrationPoints);
                                            migrationTraceRoute.addTo(map);
                                            migrationPoints.addTo(map);

                                            const baseLayers = {
                                                'Countries': osmcountriesLayers,
                                                'Satelital': satelitalLayer,
                                                'Ocean': oceanLayer
                                            };

                                            const overlays = {
                                                'Land Last Glacial Maximum': LandLGMShapefile,
                                                'Migration Trace Route': migrationTraceRoute,
                                                'Migration Points': migrationPoints,
                                                'Marker Layer': markerLayer,
                                                'Allele Geographic Zones': AlleleGeographicZonesLayer
                                            };

                                            var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

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
                                                    data = response;
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

                                            //map.addLayer(LandLGMShapefile);
                                            migrationTraceRoute.on("change", function (e) {
                                                updateList(e.target);
                                            });
                                            migrationPoints.on("change", function (e) {
                                                updateList(e.target);
                                            });

                                            updateList(migrationTraceRoute);
                                        }