// funciones para gestionar los eventos de la adición de los marcadores
var buttonSaveMarker = document.getElementById("BtnSaveMarker");

// evento que se dispara cuando se da clic en el menú de dibujar el marcador y muestra el modal para seleccionar el tipo de evento
map.on(L.Draw.Event.DRAWSTART, function (event) {

    markCreated = true;
    if (markCreated == true) {
        markerLayer.addTo(map);
        selectEventTypeFirtModal.value = -1
        var campoTextoLat = document.getElementById("latitudid");
        var campoTextoLong = document.getElementById("longitudid");
        //var campoTextoNombreEvento = document.getElementById("event_name");
        //var campoTextoDescripcion = document.getElementById("descripcion");
        //var campoTextoreference = document.getElementById("reference");        
        campoTextoLat.value = '';
        campoTextoLong.value = '';
        //campoTextoNombreEvento.value = '';
        //campoTextoDescripcion.value = '';
        //campoTextoreference.value = '';        
        $(modalEvent).modal('show');
    }
});

// evento que se dispara cuando se termina de pintar el marcador para si la bandera
// de "markCreated" está en verdadero ocultar el modal del tipo de evento
map.on('draw:drawstop', function (e) {
    if (markCreated == true) {
        modalEvent.style.display = "none";
    }
});

// evento que se dispara cuando se pinta el marcador en el mapa, aquí se obtiene latitud y longitud 
// y se establece el ícono del marcador y se muestra el modal para introducir todos los datos de marcador
map.on(L.Draw.Event.CREATED, function (event) {

    if ((markCreated == true) && (selectEventTypeFirtModal.value != -1)) {
        selectEventType.value = selectEventTypeFirtModal.value;
        modalEvent.style.display = "none";
        document.getElementById("evento").disabled = true;
        //document.getElementById("descripcion").disabled = false;
        //document.getElementById("reference").disabled = false;        
        //document.getElementById("fechaini").disabled = false;
        //document.getElementById("fechafin").disabled = false;
        $(modal).modal('show');
        buttonSaveMarker.style.display = "block";

        var layer = event.layer;
        layer.bindPopup(" ");

        layer.options.icon.options.iconUrl = iconUrlCurrentMarker;

        var lat = getstrLatFromLayer(layer);
        var lng = getstrLngFromLayer(layer);

        markerLayer.addLayer(layer);
        layerMarkerCreate = layer;
        markSave = true;

        //iconUrlCurrentMarker = "{% static 'assets/dist/Leaflet/marker_black.png' %}";
        iconUrlCurrentMarker = iconUrlpath;
        var MyCustomMarkerCustom = L.Icon.extend({
            options: {
                shadowUrl: null,
                iconSize: [25, 41],
                iconAnchor: [12.5, 37],
                iconUrl: iconUrlCurrentMarker
            }
        });
        drawControl.setDrawingOptions({
            marker: {
                icon: new MyCustomMarkerCustom()
            }
        });

        var campoTextoLat = document.getElementById("latitudid");
        var campoTextoLong = document.getElementById("longitudid");
        campoTextoLat.value = lat;
        campoTextoLong.value = lng;
    } else {
        markCreated = false;
        Swal.fire({
            icon: "error",
            title: "Por favor, llene el tipo de evento.",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(function () {
            location.reload();
        }, 500);
    }
});

// validación del modal para crear marcador
$(document).ready(function () {
    // Agregar regla personalizada para validar enteros (incluyendo negativos)
    $.validator.addMethod("integer", function (value, element) {
        return this.optional(element) || /^-?\d+$/.test(value);
    }, "Please enter a valid integer.");

    $('#modal-form').validate({
        rules: {
          /*  pause_time: {
                required: true,
                integer: true // Usa la nueva regla personalizada
            },
            fechaini: {
                required: true,
                integer: true // Usa la nueva regla personalizada
            },
            fechafin: {
                required: true,
                integer: true // Usa la nueva regla personalizada
            },
            descripcion: {
                required: true
            } */
        },
        messages: {
        /*    pause_time: {
                required: "Please enter a pause time",
                integer: "Please enter an integer for the pause time"
            },
            fechaini: {
                required: "Please enter a start date",
                integer: "Please enter an integer for the start date"
            },
            fechafin: {
                required: "Please enter an end date",
                integer: "Please enter an integer for the end date"
            },
            descripcion: {
                required: "Please enter a description"
            } */
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
            // Aquí es donde se maneja el envío AJAX
            //var pause_time = document.getElementById("pause_time").value;
            //var fi = document.getElementById("fechaini").value;
            //var ff = document.getElementById("fechafin").value;
            //var nameEvent = document.getElementById("event_name").value;
            //var desc = document.getElementById("descripcion").value;
            //var ref = document.getElementById("reference").value;
            var event = document.getElementById("evento").value;

            if (markSave == true) {
                if ((event != -1)) { //&& (fi != "") && (ff != "") && (desc != "")
                    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
                    var formData = new FormData();
                    formData.append('latitude', document.getElementById("latitudid").value);
                    formData.append('longitude', document.getElementById("longitudid").value);
                    formData.append('event', event);
                    /*
                    formData.append('event_name', nameEvent);
                    formData.append('event_icon', null);
                    formData.append('pause_time', pause_time);
                    formData.append('description', desc);                    
                    formData.append('start_date', fi);
                    formData.append('end_date', ff);
                    formData.append('reference', ref);
                    formData.append('event_type', tipoEvent);
                    formData.append('start_format', document.getElementById("selectDateTypeBegin").value);
                    formData.append('end_format', document.getElementById("selectDateTypeEnd").value);
                    */
                    $.ajax({
                        url: '/business-gestion/markers/',
                        method: 'POST',
                        data: formData,
                        contentType: false, // Muy importante para FormData
                        processData: false, // Muy importante para FormData
                        headers: {
                            'X-CSRFToken': csrftoken
                        },
                        success: function (response) {
                            layerMarkerCreate._popup._content = event;
                        },
                        error: function (xhr, status, error) {
                            console.log("Error: " + error);
                        }
                    });

                    // se muestra una alerta donde se especifica que se está actualizando la línea del tiempo
                    Swal.fire({
                        title: 'Updating TimeLine...',
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    // se manda a recargar toda la página para actualizar la línea del tiempo con los cambios en los marcadores
                    setTimeout(function () {
                        location.reload();
                    }, 500);

                    markSave = false;
                    markCreated = false;
                    modal.style.display = "none";
                    map.removeLayer(markerLayer);
                }
            }
        }
    });

    function toggleSaveButton() {
        let isValid = true;
        $('#modal-form input').each(function () {
            if (!$('#modal-form').validate().element(this)) {
                isValid = false;
            }
        });
        $('#BtnSaveMarker').prop('disabled', !isValid);
    }

    // Inicializa el estado del botón
    toggleSaveButton();

    // Maneja el evento input de los campos del formulario
    $('#modal-form input').on('input change', function () {
        toggleSaveButton(); // Actualiza el estado del botón después de validar
    });

    // Maneja el evento click del botón Save
    $('#BtnSaveMarker').on('click', function () {
        if ($('#modal-form').valid()) {
            $('#modal-form').submit(); // Esto invocará submitHandler
        }
    });
});