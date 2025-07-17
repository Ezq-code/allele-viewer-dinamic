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
        this.initialize();
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

        this.geoJsonLayer = L.geoJSON(null, {
            pointToLayer: this.createEventMarker.bind(this)
        });

        this.timeDimensionLayer = L.timeDimension.layer.geoJson(this.geoJsonLayer, {
            updateTimeDimensionMode: 'accumulate',
            addlastPoint: false,
            duration: 'PT5S',
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
        // Luego carga los eventos reales
        this.fetchEventsFromAPI();
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
        const geoJsonData = this.createGeoJsonData(validEvents);

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

    createGeoJsonData(events) {
        return {
            type: 'FeatureCollection',
            features: events.map(event => ({
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
            }))
        };
    }

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
                <div class="card m-2" style="width: 100px;">
                    <a href="${image.image}" data-lightbox="event-gallery" data-title="${image.name}">
                        <img src="${image.image}" class="card-img-top" alt="${image.name}" loading="lazy">
                    </a>
                </div>`).join('')
            : '<p>There are no images available for this event.</p>';

        $('#eventModal').modal('show');
    }
}