var campoTextoDescripcion = document.getElementById("descripcion");
var textDescripcion = document.getElementById("descripcion");
var campoTextoreference = document.getElementById("reference");
var textreference = document.getElementById("reference");
var datefechaini = document.getElementById("fechaini");
var datefechafin = document.getElementById("fechafin");
var selectEventTypeFirtModal = document.getElementById("tipoeventofirtmodal");
var selectEventType = document.getElementById("tipoevento");
var option = document.createElement("option");
var option1 = document.createElement("option");
option.text = "-- Select an option --";
option.value = -1;
option1.text = "-- Select an option --";
option1.value = -1;
selectEventType.add(option1);
selectEventTypeFirtModal.add(option);
var idEditMarker = 0;

//Get marker to map
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
            var iconUrlCurrentMarkerLoad = "";
            if (typeEventLoad != -1) {
                $.ajax({
                    type: 'GET',
                    url: '/business-gestion/events/get/' + typeEventLoad + '/',
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
                        iconUrlCurrentMarkerLoad = data.event_icon;
                        var markerIcon = L.icon({
                            iconUrl: iconUrlCurrentMarkerLoad,
                            iconSize: [25, 41],
                            shadowSize: [41, 41],
                            shadowAnchor: [13, 20]
                        });
                        var markerFromDB = L.marker([latitudeLoad, longitudeLoad], {icon: markerIcon});//.addTo(map);
                        var popup = markerFromDB.bindPopup(descriptionLoad);
                        markerLayer.addLayer(markerFromDB);
                    }
                });
            }
        });
    }
});

//Get event types and add to combobox
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
        data = response;
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

map.addControl(drawControl);

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

document.getElementById("tipoeventofirtmodal").addEventListener("change", function () {

    var ideventtype = document.getElementById("tipoeventofirtmodal").value;

    if (ideventtype != -1) {
        $.ajax({
            type: 'GET',
            url: '/business-gestion/events/get/' + ideventtype + '/',
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
                iconUrlCurrentMarker = data.event_icon;
            }
        });
    } else {
        //iconUrlCurrentMarker = "{% static 'assets/dist/Leaflet/marker_black.png' %}";
        iconUrlCurrentMarker = iconUrlpath;
    }
});

// VALIDACION DEL SELECT EVENT TYPE
$(document).ready(function () {
    // Agregar regla personalizada para validar que el valor no sea -1
    $.validator.addMethod("notEqual", function (value, element, param) {
        return this.optional(element) || value != param;
    }, "Please select a valid option.");

    $('#event-type-form').validate({
        rules: {
            tipoeventofirtmodal: {
                required: true,
                notEqual: -1 // Usar la regla personalizada
            }
        },
        messages: {
            tipoeventofirtmodal: {
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