                                    
                                    // estas funciones se usan para mejorar la forma de mostrar las etiquetas de los objetos                                      
                                        var _round = function (num, len) {
                                            return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
                                        };
                                        var strLatLng = function (latlng) {
                                            return "(" + _round(latlng.lat, 6) + ", " + _round(latlng.lng, 6) + ")";
                                        };
                                        var strLat = function (latlng) {
                                            return _round(latlng.lat, 6);
                                        };
                                        var strLng = function (latlng) {
                                            return _round(latlng.lng, 6);
                                        };
                                        var getstrLatFromLayer = function (layer) {
                                            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                                                return strLat(layer.getLatLng());
                                            }
                                        };
                                        var getstrLngFromLayer = function (layer) {
                                            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                                                return strLng(layer.getLatLng());
                                            }
                                        };
                                        var getPopupContent = function (layer) {
                                            // Marker - add lat/long
                                            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                                                return strLatLng(layer.getLatLng());
                                                // Circle - lat/long, radius
                                            } else if (layer instanceof L.Circle) {
                                                var center = layer.getLatLng(),
                                                    radius = layer.getRadius();
                                                return "Center: " + strLatLng(center) + "<br />"
                                                    + "Radius: " + _round(radius, 2) + " m";
                                                // Rectangle/Polygon - area
                                            } else if (layer instanceof L.Polygon) {
                                                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                                                    area = L.GeometryUtil.geodesicArea(latlngs);
                                                return "Area: " + L.GeometryUtil.readableArea(area, true);
                                                // Polyline - distance
                                            } else if (layer instanceof L.Polyline) {
                                                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                                                    distance = 0;
                                                if (latlngs.length < 2) {
                                                    return "Distance: N/A";
                                                } else {
                                                    for (var i = 0; i < latlngs.length - 1; i++) {
                                                        distance += latlngs[i].distanceTo(latlngs[i + 1]);
                                                    }
                                                    return "Distance: " + _round(distance, 2) + " m";
                                                }
                                            }
                                            return null;
                                        };