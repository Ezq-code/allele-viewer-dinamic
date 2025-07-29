var listEventsJoin = [];
let eventa = {};
let eventb = {};
let eventc = {};
var geoJsonData;

class EventTimeFilter {
    constructor(map, timeDimension, timeRange) {
        // Validación de parámetros
        if (!map) throw new Error("Map instance is required");

        this.map = map;
        this.timeDimension = timeDimension || null;
        this.timeRange = timeRange || '-15000/2025';
        this.allEvents = [];
        this.currentMarkers = [];

        // Configuración de capas
        this.eventLayer = L.layerGroup().addTo(this.map);
        this.geoJsonLayer = null;
        this.timeDimensionLayer = null;

        // Inicialización
      //////  this.initialize();
    }

    

    // ========== MÉTODOS DE INICIALIZACIÓN ==========
    initialize() {
        this.setupEventLayer();

        if (this.timeDimension) {
            this.setupTimeDimension();
        }

        this.loadEvents();
        this.setupEventListeners();
    }

    setupEventLayer() {
        this.eventLayer = L.layerGroup().addTo(this.map);
        this.currentMarkers = [];
    }

    setupTimeDimension() {
        console.log("Setting up TimeDimension...");
//geoJsonData
        this.geoJsonLayer = L.geoJSON(null, {
            //filter: f => f.properties.name != "do-not-show",
          pointToLayer:  function(feature, latlng) {
            if (feature.properties.name != "do-not-show")
            {
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
                
                    marker.on('click', () => this.showEventModal(event));
            
                    return marker;
             }

             if (feature.properties.name == "do-not-show")
             {
                     const event = feature.properties.eventData;
                     const iconUrl = event.event_icon || event.event_type_info.icon;
         
                     const marker = L.marker(latlng, {
                         icon: L.icon({
                             iconUrl: iconUrl,
                             iconSize: [20, 20],
                             shadowSize: [20, 20],
                             shadowAnchor: [120, 20]
                         })
                     });
                 
                     marker.on('click', () => this.showEventModal(event));
             
                     return marker;
              }

          //  pointToLayer: 
          //    this.createEventMarker.bind(this)
         }
        });

        this.timeDimensionLayer = L.timeDimension.layer.geoJson(this.geoJsonLayer, {
            updateTimeDimensionMode: 'intersect',
            addlastPoint: false,
            duration: 'PT1S',
            timeInterval: 'PT1S'
        }).addTo(this.map);

        this.timeDimension.on('timeload', (e) => {
            console.log("Current time:", e.time);
        });
    }

    setupEventListeners() {
        this.setupTimeRangeListener();
    }

    // ========== MANEJO DE EVENTOS ==========
    loadEvents() {
        console.log("Loading events...");

        // Primero prueba con datos estáticos
        this.loadStaticEvents();

        // Luego carga los eventos reales
        this.fetchEventsFromAPI();
    }

    loadStaticEvents() {
        const staticEvents = [
            {
                event_name: "Test Event 1",
                start_date: "-10000",
                end_date: "-9000",
                markers: [{latitude: 40, longitude: 0}],
                event_icon: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png"
            },
            {
                event_name: "Test Event 2",
                start_date: "1800",
                end_date: "1900",
                markers: [{latitude: 0, longitude: 0}],
                event_icon: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png"
            }
        ];

        this.allEvents = staticEvents;
        this.updateEventsDisplay();
    }

    fetchEventsFromAPI() {
        $.ajax({
            url: '/business-gestion/events/',
            type: 'GET',
            dataType: 'json',
            success: (response) => {
                if (response && response.results) {
                    this.allEvents = response.results;
                    console.log("Events loaded:", this.allEvents.length);
                    this.updateEventsDisplay();
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

    // ========== MANEJO DE DATOS ==========
    updateEventsDisplay() {
        if (this.timeDimension) {
            this.updateTimeDimensionLayer();
        } else {
            this.filterEventsByTimeRange();
        }
    }

    updateTimeDimensionLayer() {
        const validEvents = this.validateEvents(this.allEvents);
        //var geoJsonData1 = this.createGeoJsonData(validEvents);
        //var geoJsonData2 = this.createGeoJsonData2(validEvents);
        //var geoJsonData3 = this.createGeoJsonData3(validEvents);

        //var geoJsonData = {geoJsonData1,geoJsonData2,geoJsonData3};
       // var geoJsonData = {createGeoJsonData(validEvents), createGeoJsonData2(validEvents), createGeoJsonData3(validEvents)};
        
       // var geoJsonData = Object.assign({},geoJsonData1,geoJsonData2);

        geoJsonData = this.createGeoJsonData4(validEvents);

        try {
            this.geoJsonLayer.clearLayers();
            this.geoJsonLayer.addData(geoJsonData);
            console.log("TimeDimension layer updated");
        } catch (error) {
            console.error("Error updating layer:", error);
        }
    }

    validateEvents(events) {
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


/*
    createGeoJsonData(events) {
        return {
            type: 'FeatureCollection',
            features: events.map(event => (
                {
                type: 'Feature',
                properties: {
                    name: event.event_name,
                    times: this.parseEventTimeRange(event),
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
                ))
            };
        }
        */

                    listEventsJoin = [];
                    //listEventsJoin.length = 0;
                    
                    createGeoJsonData4(events) {
                   if (events.length > 0) {
                         events.forEach(event => {
                            {
                              eventa = {  
                                type: 'Feature',
                                properties: {
                                    name: "do-not-show",
                                   // times: [-15000, event.start_date-1],
                                  
                                    times: [    -15000,-14949,-14898,-14847,-14796,-14745,-14694,-14643,-14592,-14541,-14490,-14439,-14388,-14337,-14286,-14235,-14184,-14133,-14082,-14031,-13980,-13929,-13878,-13827,-13776,
                                        -13725,-13674,-13623,-13572,-13521,-13470,-13419,-13368,-13317,-13266,-13215,-13164,-13113,-13062,-13011,-12960,-12909,-12858,-12807,-12756,-12705,-12654,-12603,-12552,-12501,
                                        -12450,-12399,-12348,-12297,-12246,-12195,-12144,-12093,-12042,-11991,-11940,-11889,-11838,-11787,-11736,-11685,-11634,-11583,-11532,-11481,-11430,-11379,-11328,-11277,-11226,
                                        -11175,-11124,-11073,-11022,-10971,-10920,-10869,-10818,-10767,-10716,-10665,-10614,-10563,-10512,-10461,-10410,-10359,-10308,-10257,-10206,-10155,-10104,-10053,-10002,    
                                        -10000,-9949,-9898,-9847,-9796,-9745,-9694,-9643,-9592,-9541,-9490,-9439,-9388,-9337,-9286,-9235,-9184,-9133,-9082,-9031,-8980,-8929,-8878,-8827,-8776,-8725,-8674,-8623,-8572,
                                        -8521,-8470,-8419,-8368,-8317,-8266,-8215,-8164,-8113,-8062,-8011, 
                                        -8000,-7949,-7898,-7847,-7796,-7745,-7694,-7643,-7592,-7541,-7490,-7439,-7388,-7337,-7286,-7235,-7184,-7133,-7082,-7031,-6980,-6929,-6878,-6827,-6776,
                                        -6725,-6674,-6623,-6572,-6521,-6470,-6419,-6368,-6317,-6266,-6215,-6164,-6113,-6062,-6011,-5960,-5909,-5858,-5807,-5756,-5705,-5654,-5603,-5552,-5501,-5450,-5399,-5348,-5297,
                                        -5246,-5195,-5144,-5093,-5042,
                                        -4991,-4940,-4889,-4838,-4787,-4736,-4685,-4634,-4583,-4532,-4481,-4430,-4379,-4328,-4277,-4226,-4175,-4124,-4073,-4022,-3971,
                                        -3920,-3869,-3818,-3767,-3716,-3665,-3614,-3563,-3512,-3461,-3410,-3359,-3308,-3257,-3206,-3155,-3104,-3053,-3002,-2951,-2900,-2849,-2798,-2747,-2696,-2645,-2594,-2543,
                                        -2492,-2441,-2390,-2339,-2288,-2237,-2186,-2135,-2084,-2033,-1982,-1931,-1880,-1829,-1778,-1727,-1676,-1625,-1574,-1523,-1472,-1421,-1370,-1319,-1268,-1217,-1166,-1115,
                                        -1064,-1013,-962,-911,-860,-809,-758,-707,-656,-605,-554,-503],
                                    
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
                            };
                            
                            } 
                            listEventsJoin.push(eventa); 
                        });

                         
                        events.forEach(event => {
                                eventb = { 
                                    type: 'Feature',
                                    properties: {
                                        name: event.event_name,
                                        //times: this.parseEventTimeRange(event),
                                        //times: this.parseEventTimeRange(event),
                                        times: [-452,-401,-350,-299,-248, -197,-146],
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
                            });

                            events.forEach(event => {
                                eventc = {     
                                    type: 'Feature',
                                    properties: {
                                        name: "do-not-show",
                                        times: [event.end_date+1, 2025],
                                      
                                        times: [-95,-44,0,
                                            1,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,
                                            460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730,740,750,760,770,780,790,800,810,820,830,840,850,                                            
                                            860,870,880,890,900,910,920,930,940,950,960,970,980,990,1000,1010,1020,1030,1040,1050,1060,1070,1080,1090,1100,1110,1120,1130,1140,1150,1160,1170,1180,1190,1200,1210,
                                            1220,1230,1240,1250,1260,1270,1280,1290,1300,1310,1320,1330,1340,1350,1360,1370,1380,1390,1400,1410,1420,1430,1440,1450,1460,1470,1480,1490,1500,1510,1520,1530,1540,
                                            1550,1560,1570,1580,1590,1600,1610,1620,1630,1640,1650,1660,1670,1680,1690,1700, 
                                            1710,1720,1730,1740,1750,1760,1770,1780,1790,1800,1810,1820,1830,1840,1850,1860,1864,
                                            1870,1880,1890,1900,1910,1920,1930,1937,
                                            1940,1950,1960,1970,1980,1985,
                                            1986,1990,2000,2010,
                                            2011,2020,2025],
                                            
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
                                listEventsJoin.push(eventc);      
                            });
                            
                    } 
                        return {
                            type: 'FeatureCollection',
                            features: listEventsJoin 
                            } 

                           
                        };
                    

                    

    // ========== FILTRADO POR TIEMPO ==========
    setupTimeRangeListener() {
        const timeRangeSelect = document.getElementById('timeRangeMigraions');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.handleTimeRangeChange(e.target.value);
            });

            // Set initial value
            timeRangeSelect.value = this.timeRange;
        }
    }

    handleTimeRangeChange(newRange) {
        if (!newRange || typeof newRange !== 'string') {
            console.error("Invalid time range:", newRange);
            return;
        }

        this.timeRange = newRange;
        sessionStorage.setItem('timeRange', newRange);

        if (this.timeDimension) {
            location.reload(); // Recarga para TimeDimension
        } else {
            this.filterEventsByTimeRange();
        }
    }

    filterEventsByTimeRange() {
        const [startRange, endRange] = this.parseTimeRange(this.timeRange);

        if (isNaN(startRange) || isNaN(endRange)) {
            console.error("Invalid time range:", this.timeRange);
            return;
        }

        this.clearMarkers();

        const visibleEvents = this.allEvents.filter(event => {
            const [eventStart, eventEnd] = this.parseEventTimeRange(event);
            return this.isInTimeRange(eventStart, eventEnd, startRange, endRange);
        });

        visibleEvents.forEach(event => this.addEventToLayer(event));
        this.adjustMapView();
    }

    parseTimeRange(timeRange) {
        if (!timeRange) return [NaN, NaN];

        const parts = timeRange.toString().split('/');
        if (parts.length !== 2) return [NaN, NaN];

        return parts.map(part => {
            const num = parseInt(part);
            return isNaN(num) ? NaN : num;
        });
    }

    parseEventTimeRange(event) {
        const start = parseInt(event.start_date);
        const end = event.end_date ? parseInt(event.end_date) : start;
        return [start, end];
    }

    isInTimeRange(eventStart, eventEnd, rangeStart, rangeEnd) {
        const actualStart = Math.min(rangeStart, rangeEnd);
        const actualEnd = Math.max(rangeStart, rangeEnd);
        return (eventStart <= actualEnd) && (eventEnd >= actualStart);
    }

    // ========== MANEJO DE MARCADORES ==========
    createEventMarker(feature, latlng) {
        const event = feature.properties.eventData;
        const iconUrl = event.event_icon || event.event_type_info.icon;


//if (feature.properties.name != "do-not-show") {
        const marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [25, 41],
                shadowSize: [41, 41],
                shadowAnchor: [13, 20]
            })
        });
   // }
  /*  else
{
        const marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [1, 1],
                shadowSize: [1, 1],
                shadowAnchor: [1, 1]
            })
        });
    }
    */

        // marker.bindPopup(feature.properties.popupContent);
        marker.on('click', () => this.showEventModal(event));

        return marker;
    }


    createEventMarkerNull(feature, latlng) {
        const event = feature.properties.eventData;
        const iconUrl = event.event_icon || event.event_type_info.icon;


//if (feature.properties.name != "do-not-show") {
        const marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [1, 1],
                shadowSize: [1, 1],
                shadowAnchor: [1, 1]
            })
        });
   // }
  /*  else
{
        const marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [1, 1],
                shadowSize: [1, 1],
                shadowAnchor: [1, 1]
            })
        });
    }
    */

        // marker.bindPopup(feature.properties.popupContent);
        marker.on('click', () => this.showEventModal(event));

        return marker;
    }

    addEventToLayer(event) {
        // Función mejorada para obtener el icono
        const getIconUrl = (event) => {
            // 1. Prioridad al icono directo del evento
            if (event.event_icon) return event.event_icon;

            // 2. Intentar obtener del event_type_info
            if (event.event_type_info && event.event_type_info.icon) {
                return event.event_type_info.icon;
            }

            // 3. Icono por defecto
            return event.event_type_info.icon || event.event_icon;
        };

        const iconUrl = getIconUrl(event);

        event.markers.forEach(marker => {
            const lat = parseFloat(marker.latitude);
            const lng = parseFloat(marker.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                console.error("Invalid coordinates for event:", event.event_name);
                return;
            }

            const eventMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: iconUrl,
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    shadowAnchor: [13, 20]
                }),
                riseOnHover: true
            });

            // eventMarker.bindPopup(this.createPopupContent(event));
            eventMarker.on('click', () => this.showEventModal(event));

            this.eventLayer.addLayer(eventMarker);
            this.currentMarkers.push(eventMarker);
        });
    }

    clearMarkers() {
        this.currentMarkers.forEach(marker => this.eventLayer.removeLayer(marker));
        this.currentMarkers = [];
    }

    adjustMapView() {
        if (this.currentMarkers.length > 0) {
            const group = new L.featureGroup(this.currentMarkers);
            this.map.fitBounds(group.getBounds());
        }
    }

    // ========== UI HELPERS ==========
    createPopupContent(event) {
        return `<b>${event.event_name}</b><br>
               Start: ${event.start_date}<br>
               End: ${event.end_date || 'N/A'}`;
    }


    showEventModal(event) {
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
}