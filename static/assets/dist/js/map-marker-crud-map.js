// funciones para gestionar los marcadores en el mapa
var campoTextoNombreEvento = document.getElementById("event_name");
var textNombreEvento = document.getElementById("event_name");
var campoTextoDescripcion = document.getElementById("descripcion");
var textDescripcion = document.getElementById("descripcion");
var campoTextoreference = document.getElementById("reference");
var textreference = document.getElementById("reference");
var datefechaini = document.getElementById("fechaini");
var datefechafin = document.getElementById("fechafin");
var selectEventTypeFirtModal = document.getElementById("eventoModal");
var selectEventType = document.getElementById("evento");
var option = document.createElement("option");
var option1 = document.createElement("option");
option.text = "-- Select an option --";
option.value = -1;
option1.text = "-- Select an option --";
option1.value = -1;
selectEventType.add(option1);
selectEventTypeFirtModal.add(option);
var idEditMarker = 0;

// llamada ajax para cargar los marcadores y adicionarlos en la capa de los marcadores
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

        data.forEach(function (event) {
            var nameLoad = event.event_name;           
            var descriptionLoad = event.description;
            var referenceLoad = event.reference;
            var galleryLoad = event.event_gallery; // Obtener el array de imágenes
            var iconUrlCurrentMarkerLoad = "";

            // Aquí accedemos al evento desde el objeto del marcador.
            if (event.event_type !== -1) {
                iconUrlCurrentMarkerLoad = event.event_type_info.icon; // Se accede directo al icon que devolvemos en la respuesta

                var markerList = event.markers;
                markerList.forEach(function (marker) {
                    var latitudeLoad = marker.latitude;
                    var longitudeLoad = marker.longitude;

                var markerIcon = L.icon({
                    iconUrl: iconUrlCurrentMarkerLoad,
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    shadowAnchor: [13, 20]
                });
                var markerFromDB = L.marker([latitudeLoad, longitudeLoad], {icon: markerIcon});
                // se agrega un evento click al marcador para mostrar la ventana modal
                markerFromDB.on('click', function () {
                    var eventImagesDiv = document.getElementById('eventImages');
                    eventImagesDiv.innerHTML = '';
                    // Mostrar la descripción y otra información en el modal 
                    document.getElementById('eventName').innerHTML = nameLoad; // aqui enviamos el nombre
                    document.getElementById('eventDescription').innerHTML = descriptionLoad; // aqui enviamos la description
                    document.getElementById('eventReference').innerHTML = referenceLoad; // aqui enviamos la referencia
                    // Iterar sobre el array de imágenes y crear las tarjetas
                    if (galleryLoad && galleryLoad.length > 0) {
                        galleryLoad.forEach(function (image) {
                            var cardHtml = `
                            <div class="card m-2" style="width: 100px;">
                            <a href="${image.image}" data-lightbox="event-gallery"
                                    data-title="${image.name}">
                                 <img src="${image.image}" class="card-img-top" alt="${image.name}"
                                          style="width: 100%; height: auto;">
                            </a>
                        </div>
                    `;
                            eventImagesDiv.innerHTML += cardHtml;
                        });
                    } else {
                        // Mostrar mensaje si no hay imágenes
                        eventImagesDiv.innerHTML = '<p>There are no images available for this event.</p>';
                    }

                    $('#eventModal').modal('show'); // Mostrar el modal
                });
                markerLayer.addLayer(markerFromDB);
            });
            }
        });
    }
});

// llamada ajax para obtener los tipos de eventos para adicionarlos al select del modal
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
        data.forEach(function (eventTypeBD) {
            var option = document.createElement("option");
            var option1 = document.createElement("option");
            option.text = eventTypeBD.event_name;
            option.value = eventTypeBD.id;
            option1.text = eventTypeBD.event_name;
            option1.value = eventTypeBD.id;
            selectEventType.add(option);
            selectEventTypeFirtModal.add(option1);
        });
    }
});

var MyCustomMarker = L.Icon.extend({
    options: {
        shadowUrl: null,
        iconSize: [25, 41],
        iconAnchor: [12.5, 37],
        //iconUrl: "{% static 'assets/dist/Leaflet/marker_black.png' %}"
        iconUrl: iconUrlpath
    }
});

L.EditToolbar.Delete.include({
    removeAllLayers: false
});

// menu de configuración para agregar marcador y adicionar al mapa 
var drawControl = new L.Control.Draw({
    draw: {
        polyline: false,
        circle: false,
        polygon: false,
        rectangle: false,
        circlemarker: false,
        marker: {
            icon: new MyCustomMarker()
        }
    }
});

//if (authenticated) {
    map.addControl(drawControl);
//}

var modal = document.getElementById("modalMarker");
var modalEvent = document.getElementById("modalTypeEventMarker");
var buttonCreateMarker = document.getElementById("btnCreateMarker");
var buttonSaveMarker = document.getElementById("BtnSaveMarker");
var buttonClose = document.getElementById("BtnClose");
var span = document.getElementsByClassName("close")[0];

//iconUrlCurrentMarker = "{% static 'assets/dist/Leaflet/marker_black.png' %}";
iconUrlCurrentMarker = iconUrlpath;

var markCreated = false;
var markSave = false;
var markerList = [];

// evento que se dispara al seleccionar el tipo de evento para hacer llamada ajax para obtener el ícono del tipo de evento
document.getElementById("eventoModal").addEventListener("change", function () {

    var ideventtype = document.getElementById("eventoModal").value;

    if (ideventtype != -1) {
        $.ajax({
            type: 'GET',
            url: '/business-gestion/events/' + ideventtype + '/',
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
                iconUrlCurrentMarker = data.event_type_info.icon;
            }
        });
    } else {
        //iconUrlCurrentMarker = "{% static 'assets/dist/Leaflet/marker_black.png' %}";
        iconUrlCurrentMarker = iconUrlpath;
    }
});

// validación del select event type
$(document).ready(function () {
    // Agregar regla personalizada para validar que el valor no sea -1
    $.validator.addMethod("notEqual", function (value, element, param) {
        return this.optional(element) || value != param;
    }, "Please select a valid option.");

    $('#event-type-form').validate({
        rules: {
            eventoModal: {
                required: true,
                notEqual: -1 // Usar la regla personalizada
            }
        },
        messages: {
            eventoModal: {
                required: "Please select an event type",
                notEqual: "Please select a valid event type"
            }
        },
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        },
        submitHandler: function (form) {
            // Este código solo se ejecutará si la validación es exitosa
            $('#modalTypeEventMarker').modal('hide'); // Cierra el modal si la validación es exitosa
        }
    });

    // Manejo del clic en el botón "OK"
    $('#save-event-type').on('click', function () {
        // Validar el formulario al hacer clic en "OK"
        if ($('#event-type-form').valid()) {
            $('#event-type-form').submit(); // Esto activará submitHandler
        }
    });
});
