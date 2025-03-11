// Funcion para restablecer el formulario a su estado inicial
function resetEventTypeForm() {
    document.getElementById('add-event-type-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-event-type').on('hidden.bs.modal', function (e) {
    resetEventTypeForm();
});

// Agregar una función para enviar el formulario
function submitEventTypeForm() {
    var form = document.getElementById('add-event-type-form');
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    if (form.checkValidity()) {
        var formData = new FormData(form);

        $.ajax({
            url: '/business-gestion/event-types/',
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
                    title: "Event-Type created successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
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
                    text: 'There was a problem saving the Event-Type. Please try again.',
                    timer: 1500
                });
                resetEventTypeForm();
            }
        });
        // Cerrar la ventana modal después de enviar el formulario
        $('#modal-add-event').modal('hide');
        resetEventTypeForm();
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
function editEventType(id, name, pause_time, icon_url, icon_file) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    var event_id = id;
    var formData = new FormData();
    formData.append('name', name);
    formData.append('pause_time', pause_time);
    if (icon_file) {
        formData.append('icon', icon_file);
    }
    // Si no se seleccionó un nuevo icono, se envía la URL del icono actual
    formData.append('icon_url', icon_url);
    $.ajax({
        url: '/business-gestion/event-types/' + event_id + '/',
        type: 'PATCH',
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-edit-event-type').modal('hide');
            Swal.fire({
                icon: "success",
                title: "Successfully edited Event-Type",
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
        var event_id = $(this).data('id');
        var name = $(this).data('name');
        var icon = $(this).data('icon');
        var pause_time = $(this).data('pause-time');
        // Guarda event_id como dato del modal
        var modalId = '#modal-edit-event-type-' + event_id; // Asegúrate de que el ID sea correcto
        $(modalId + ' #name').val(''); // Limpiar el campo del nombre del evento
        $(modalId + ' #icon-preview').attr('src', ''); // Limpiar la vista previa del icono
        $(modalId + ' #icon-url').val(''); // Limpiar el campo de la URL del icono
        $(modalId + ' #icon').val(''); // Limpiar el input file

        $(modalId + ' #name').val(name);
        $(modalId + ' #pause-time').val(pause_time);
        $(modalId + ' #icon-preview').attr('src', icon);
        $(modalId + ' #icon-url').val(icon);

        $(modalId).modal('show');
    });
    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-event-type', function () {
        var id = $(this).data('id');
        var modalId = '#modal-edit-event-type-' + id;
        var name = $(modalId).find('#name').val();
        var pause_time = $(modalId).find('#pause-time').val();
        var icon_file = $(modalId).find('#icon')[0].files[0];
        var icon_url = $(modalId).find('#icon-url').val();
        editEventType(id, name,pause_time, icon_url, icon_file);
    });
});


// Funcion para eliminar un evento
function deleteEventType(event_id) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    $.ajax({
        url: '/business-gestion/event-types/' + event_id + '/',
        type: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-delete-event-type').modal('hide'); // Ocultar la ventana modal después de la elminacion
            Swal.fire({
                icon: "success",
                title: "Event-Type successfully removed",
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
    $('#modal-delete-event-type').modal('hide');
}


//Al abrir el modal, captura el ID del elemento a eliminar y, al confirmar
// llama a una función para llevar a cabo la eliminación.
$(document).ready(function () {
    let eventId;

    // Captura el ID del marcador cuando se abre el modal
    $('#modal-delete-event-type').on('show.bs.modal', function (eventtype) {
        const button = $(eventtype.relatedTarget); // Botón que activó el modal
        eventId = button.data('id'); // Extrae la información del atributo data-id
    });

    // Llama a la función deleteMark al hacer clic en el botón de eliminar
    $('#confirm-delete-event-type').on('click', function () {
        deleteEventType(eventId);
    });
});
