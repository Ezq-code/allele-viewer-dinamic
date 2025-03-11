// Funcion para eliminar el marcador
function deleteMark(marker_id) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtén el token CSRF del input oculto
    $.ajax({
        url: '/business-gestion/markers/' + marker_id + '/',
        type: 'DELETE',
        headers: {
                'X-CSRFToken': csrftoken
            },
        success: function (data) {
            console.log(data);
            $('#modal-delete-mark').modal('hide'); // Ocultar la ventana modal después de la eliminacion
            Swal.fire({
                icon: "success", title: "Mark successfully removed", showConfirmButton: false, timer: 1500
            });
            setTimeout(function () {
                location.reload();
            }, 500);

        }, error: function (xhr, status, error) {
            console.error(error);
        }
    });
    $('#modal-delete-mark').modal('hide');
}

//Al abrir el modal, captura el ID del elemento a eliminar y, al confirmar
// llama a una función para llevar a cabo la eliminación.
$(document).ready(function () {
    let markerId;
    // Captura el ID del marcador cuando se abre el modal
    $('#modal-delete-mark').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget); // Botón que activó el modal
        markerId = button.data('id'); // Extrae la información del atributo data-id
    });

    // Llama a la función deleteMark al hacer clic en el botón de eliminar
    $('#confirm-delete').on('click', function () {
        deleteMark(markerId);
    });
});
// Función para restablecer el formulario a su estado inicial
function resetMarkForm(formId) {
    document.getElementById(formId).reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('.modal').on('hidden.bs.modal', function (e) {
    // Obtener el ID del formulario correspondiente al modal que se cierra
    const markId = $(this).data('mark-id'); // Obtener el ID del mark desde el modal
    const formId = 'editmarkForm-' + markId; // Construir el ID del formulario
    resetMarkForm(formId); // Restablecer el formulario
});


// Funcion para editar el marcador
function editMark(id, event, latitude, longitude) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    var formData = new FormData();
    formData.append('event', event);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    $.ajax({
        url: '/business-gestion/markers/' + id + '/',
        type: 'PATCH',
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-edit-mark').modal('hide'); // Ocultar la ventana modal después de la edición
            Swal.fire({
                icon: "success", title: "Mark edited successfully", showConfirmButton: false, timer: 1500
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

//Cuando un usuario hace clic en el botón de edición,
// se extraen los datos correspondientes y se muestran en un modal
// para que el usuario pueda modificarlos
$(document).ready(function () {
    // Botón de editar en la lista de Marks
    $(document).on('click', '.btn-edit', function () {
        // Obtener los datos de la marca seleccionada
        var id = $(this).data('mark-id');
        var event = $(this).data('mark-event');
        var latitude = $(this).data('mark-latitude');
        var longitude = $(this).data('mark-longitude');

        // Mostrar los datos en el modal
        var modalId = '#modal-edit-mark-' + id;
        $(modalId).find('#mark-latitude').val(latitude);
        $(modalId).find('#mark-longitude').val(longitude);
        $(modalId).find('#btn-edit-mark').data('mark-id', id); // Guardamos el ID aquí

        // Mostrar la ventana modal
        $('#modal-edit-mark').modal('show');
    });

    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-mark', function () {
        var id = $(this).data('mark-id');
        var modalId = '#modal-edit-mark-' + id;
        var event = $(modalId).find('#mark-event').val(); // Obtener el valor del select
        var latitude = $(modalId).find('#mark-latitude').val();
        var longitude = $(modalId).find('#mark-longitude').val();

        // Realizar la solicitud AJAX para editar la marca
        editMark(id, event, latitude, longitude);
    });
});