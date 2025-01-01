// Funcion para restablecer el formulario a su estado inicial
function resetEventForm() {
    document.getElementById('add-event-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-event').on('hidden.bs.modal', function (e) {
    resetEventForm();
});

// Agregar una función para enviar el formulario
function submitEventForm() {
    var form = document.getElementById('add-event-form');
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    if (form.checkValidity()) {
        var formData = new FormData(form);

        $.ajax({
            url: '/business-gestion/events/',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
            'X-CSRFToken': csrftoken
            },
            success: function (data) {
                console.log(data);
                Swal.fire({
                    icon: "success",
                    title: "Event created successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                // Limpiar los campos del formulario
                resetEventForm();
                // Recargar la página después de 0.5 segundos
                setTimeout(function () {
                    location.reload();
                }, 500);

            },
            error: function (xhr, status, error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was a problem saving the event. Please try again.',
                    timer: 1500
                });
                resetEventForm();
            }
        });

        // Cerrar la ventana modal después de enviar el formulario
        $('#modal-add-event').modal('hide');
        resetEventForm();
    } else {
        // Mostrar un mensaje de error personalizado
        var errorMessage = 'Please complete all required fields.';
        var invalidFields = form.querySelectorAll(':invalid');
        if (invalidFields.length > 0) {
            errorMessage += '\nCampos faltantes:';
            invalidFields.forEach(function (field) {
                errorMessage += '\n- ' + field.name;
            });
        }
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            timer: 1500
        });
    }
}


// Funcion para editar un evento
function editEvent(id, event_name, event_icon_url, event_icon_file) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    var event_id = id;
    var formData = new FormData();
    formData.append('event_name', event_name);
    if (event_icon_file) {
        formData.append('event_icon', event_icon_file);
    }
    // Si no se seleccionó un nuevo icono, se envía la URL del icono actual
    formData.append('event_icon_url', event_icon_url);
    $.ajax({
        url: '/business-gestion/events/' + event_id + '/',
        type: 'PATCH',
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-edit-event').modal('hide');
            Swal.fire({
                icon: "success",
                title: "Successfully edited event",
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(function () {
                location.reload();
            }, 500);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// Cuando un usuario hace clic en el botón de edición,
// se extraen los datos correspondientes y se muestran en un modal
// para que el usuario pueda modificarlos
$(document).ready(function () {
    // Botón de editar en la lista de eventos
    $(document).on('click', '.btn-edit', function () {
        // Obtener los datos del evento seleccionado
        var event_id = $(this).data('event-id');
        var event_name = $(this).data('event-name');
        var event_icon = $(this).data('event-icon');
        // Guarda event_id como dato del modal
        var modalId = '#modal-edit-event-' + event_id; // Asegúrate de que el ID sea correcto
        $(modalId + ' #event-name').val(''); // Limpiar el campo del nombre del evento
        $(modalId + ' #event-icon-preview').attr('src', ''); // Limpiar la vista previa del icono
        $(modalId + ' #event-icon-url').val(''); // Limpiar el campo de la URL del icono
        $(modalId + ' #event-icon').val(''); // Limpiar el input file

        $(modalId + ' #event-name').val(event_name);
        $(modalId + ' #event-icon-preview').attr('src', event_icon);
        $(modalId + ' #event-icon-url').val(event_icon);

        $(modalId).modal('show');
    });
    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-event', function () {
        var id = $(this).data('event-id');
        var modalId = '#modal-edit-event-' + id;
        var event_name = $(modalId).find('#event-name').val();
        var event_icon_file = $(modalId).find('#event-icon')[0].files[0];
        var event_icon_url = $(modalId).find('#event-icon-url').val();
        editEvent(id, event_name, event_icon_url, event_icon_file);
    });
});


// Funcion para eliminar un evento
function deleteEvent(event_id) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    $.ajax({
        url: '/business-gestion/events/' + event_id + '/',
        type: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-delete-event').modal('hide'); // Ocultar la ventana modal después de la elminacion
            Swal.fire({
                icon: "success",
                title: "Event successfully removed",
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(function () {
                location.reload();
            }, 500);

        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
    $('#modal-delete-event').modal('hide');
}


//Al abrir el modal, captura el ID del elemento a eliminar y, al confirmar
// llama a una función para llevar a cabo la eliminación.
$(document).ready(function () {
    let eventId;

    // Captura el ID del marcador cuando se abre el modal
    $('#modal-delete-event').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget); // Botón que activó el modal
        eventId = button.data('id'); // Extrae la información del atributo data-id
    });

    // Llama a la función deleteMark al hacer clic en el botón de eliminar
    $('#confirm-delete-event').on('click', function () {
        deleteEvent(eventId);
    });
});
