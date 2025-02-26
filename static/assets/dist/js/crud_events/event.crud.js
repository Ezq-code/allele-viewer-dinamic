function resetEventForm() {
    document.getElementById('add-event-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-event').on('hidden.bs.modal', function (e) {
    resetEventForm();
});

function submitEventForm() {
    var form = document.getElementById('add-event-form');
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF

    if (form.checkValidity()) {
        var formData = new FormData(form);

        $.ajax({
            url: '/business-gestion/events/', // Asegúrate de que esta URL sea la correcta para tu API
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
                    title: "Event added successfully",
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
                    text: 'There was a problem adding the Event. Please try again.',
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


// Agregar un evento que se dispare al cerrar la ventana modal
$('.modal').on('hidden.bs.modal', function (e) {
    // Obtener el ID del formulario correspondiente al modal que se cierra
    const eventId = $(this).data('event-id'); // Obtener el ID del event desde el modal
    const formId = 'edit-event-form'; // ID del formulario
    resetEventForm(formId); // Restablecer el formulario
});

// Función para editar un evento
function editEvent(id, event_name, event_type, description, reference, start_date, end_date, pause_time, event_icon_url, event_icon_file) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    var event_id = id;
    var formData = new FormData();
    formData.append('event_name', event_name);
    formData.append('event_type', event_type);
    formData.append('description', description);
    formData.append('reference', reference);
    formData.append('start_date', start_date);
    formData.append('end_date', end_date);
    formData.append('pause_time', pause_time);
    if (event_icon_file) {
        formData.append('event_icon', event_icon_file);
    }
    // Si no se seleccionó un nuevo icono, se envía la URL del icono actual
    formData.append('event_icon_url', event_icon_url);

    $.ajax({
        url: '/business-gestion/events/' + event_id + '/',
        type: 'PUT',
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-edit-event-' + event_id).modal('hide');
            Swal.fire({
                icon: "success",
                title: "Successfully edited Event",
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(function () {
                location.reload();
            }, 500);
        },
        error: function (xhr, status, error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was a problem editing the Event. Please try again.',
                timer: 1500
            });
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
        var name = $(this).data('event-name');
        var event_type = $(this).data('event-type');
        var icon = $(this).data('event-icon');
        var pause_time = $(this).data('event-pause-time');
        var description = $(this).data('event-description');
        var reference = $(this).data('event-reference');
        var start_date = $(this).data('event-start-date');
        var end_date = $(this).data('event-end-date');

        // Guarda event_id como dato del modal
        var modalId = '#modal-edit-event-' + event_id; // Asegúrate de que el ID sea correcto

        // Llenar los campos del formulario con los datos del evento
        $(modalId + ' #event-name').val(name);
        $(modalId + ' #event-type').val(event_type);
        $(modalId + ' #event-icon-preview').attr('src', icon);
        $(modalId + ' #event-pause-time').val(pause_time);
        $(modalId + ' #event-description').val(description);
        $(modalId + ' #event-reference').val(reference);
        $(modalId + ' #event-start_date').val(start_date);
        $(modalId + ' #event-end_date').val(end_date);

        $(modalId).modal('show');
    });

    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-event', function () {
        var event_id = $(this).data('event-id');
        var modalId = '#modal-edit-event-' + event_id;

        // Obtener los valores de los campos del formulario
        var event_name = $(modalId).find('#event-name').val();
        var event_type = $(modalId).find('#event-type').val();
        var description = $(modalId).find('#event-description').val();
        var reference = $(modalId).find('#event-reference').val();
        var start_date = $(modalId).find('#event-start_date').val();
        var end_date = $(modalId).find('#event-end_date').val();
        var pause_time = $(modalId).find('#event-pause-time').val();
        var event_icon_file = $(modalId).find('#event-icon')[0].files[0];
        var event_icon_url = $(modalId).find('#event-icon-preview').attr('src');

        // Llamar a la función editEvent con todos los campos
        editEvent(event_id, event_name, event_type, description, reference, start_date, end_date, pause_time, event_icon_url, event_icon_file);
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
