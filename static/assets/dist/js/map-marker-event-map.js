var buttonSaveMarker = document.getElementById("BtnSaveMarker");

map.on(L.Draw.Event.DRAWSTART, function (event) {

    markCreated = true;
    if (markCreated == true) {
        markerLayer.addTo(map);
        selectEventTypeFirtModal.value = -1
        var campoTextoLat = document.getElementById("latitudid");
        var campoTextoLong = document.getElementById("longitudid");
        var campoTextoDescripcion = document.getElementById("descripcion");
        var campoTextoreference = document.getElementById("reference");        
        campoTextoLat.value = '';
        campoTextoLong.value = '';
        campoTextoDescripcion.value = '';
        campoTextoreference.value = '';        
        $(modalEvent).modal('show');
    }
});

map.on('draw:drawstop', function (e) {
    if (markCreated == true) {
        modalEvent.style.display = "none";
    }
});

map.on(L.Draw.Event.CREATED, function (event) {

    if ((markCreated == true) && (selectEventTypeFirtModal.value != -1)) {
        selectEventType.value = selectEventTypeFirtModal.value;
        modalEvent.style.display = "none";
        document.getElementById("tipoevento").disabled = true;
        document.getElementById("descripcion").disabled = false;
        document.getElementById("reference").disabled = false;        
        document.getElementById("fechaini").disabled = false;
        document.getElementById("fechafin").disabled = false;
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

buttonSaveMarker.onclick = function () {

    var fi = document.getElementById("fechaini").value;
    var ff = document.getElementById("fechafin").value;
    var desc = document.getElementById("descripcion").value;
    var ref = document.getElementById("reference").value;    
    var tipoEvent = document.getElementById("tipoevento").value;
    if (markSave == true) {
        if ((tipoEvent != -1) && (fi != "") && (ff != "") && (desc != "")) {
            $.ajax({
                url: '/business-gestion/markers/create/',
                method: 'POST',
                data: {
                    latitude: document.getElementById("latitudid").value,
                    longitude: document.getElementById("longitudid").value,
                    start_date: fi,
                    end_date: ff,
                    start_format: document.getElementById("selectDateTypeBegin").value,
                    end_format: document.getElementById("selectDateTypeEnd").value,
                    description: desc,
                    reference: ref,
                    event_type: tipoEvent
                },
                success: function (response) {
                    layerMarkerCreate._popup._content = desc;
                },
                error: function (xhr, status, error) {
                    console.log("Error: " + error);
                } 
            });

            Swal.fire({
                title: 'Updating TimeLine...',
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
            setTimeout(function () {
                location.reload();
            }, 500);
            
            markSave = false;
            markCreated = false;
            modal.style.display = "none";
            map.removeLayer(markerLayer);
        } 
    }
};

// VALIDACION DEL MODAL PARA CREAR MARCADOR
$(document).ready(function () {
    // Agregar regla personalizada para validar enteros (incluyendo negativos)
    $.validator.addMethod("integer", function (value, element) {
        return this.optional(element) || /^-?\d+$/.test(value);
    }, "Please enter a valid integer.");

    $('#modal-form').validate({
        rules: {
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
            }
        },
        messages: {
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
            form.submit(); // Enviar el formulario aquí
            // Lógica para enviar el formulario
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