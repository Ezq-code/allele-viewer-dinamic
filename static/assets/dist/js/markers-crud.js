// Funcion para eliminar el marcador
function deleteMark(marker_id) {
    $.ajax({
        url: `../business-gestion/markers/delete/${marker_id}/`, type: 'POST', success: function (data) {
            console.log(data);
            $('#modal-delete-mark').modal('hide'); // Ocultar la ventana modal después de la elminacion
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


// Funcion para editar el marcador
function editMark(id, event_type, start_date, start_format, end_date, end_format, description, reference, latitude, longitude) {
    var formData = new FormData();
    formData.append('event_type', event_type);
    formData.append('start_date', start_date);
    formData.append('start_format', start_format);
    formData.append('end_date', end_date);
    formData.append('end_format', end_format);
    formData.append('description', description);
    formData.append('reference', reference);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    $.ajax({
        url: '../business-gestion/markers/edit/' + id + '/',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
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
    $('.btn-edit').click(function () {
        // Obtener los datos de la marca seleccionada
        var id = $(this).data('mark-id');
        var event_type = $(this).data('mark-event_type');
        var start_date = $(this).data('mark-start_date');
        var start_format = $(this).data('mark-start_format');
        var end_date = $(this).data('mark-end_date');
        var end_format = $(this).data('mark-end_format');
        var description = $(this).data('mark-description');
        var reference = $(this).data('mark-reference');
        var latitude = $(this).data('mark-latitude');
        var longitude = $(this).data('mark-longitude');

        // Mostrar los datos en el modal
        $('#modal-edit-mark #mark-start_date').val(start_date);
        $('#modal-edit-mark #mark-start_format').val(start_format);
        $('#modal-edit-mark #mark-end_date').val(end_date);
        $('#modal-edit-mark #mark-end_format').val(end_format);
        $('#modal-edit-mark #mark-description').val(description);
        $('#modal-edit-mark #mark-reference').val(reference);
        $('#modal-edit-mark #mark-latitude').val(latitude);
        $('#modal-edit-mark #mark-longitude').val(longitude);
        $('#btn-edit-mark').data('mark-id', id); // Guardamos el ID aquí

        // Mostrar la ventana modal
        $('#modal-edit-mark').modal('show');
    });

    // Enviar formulario al hacer click en el botón Enviar
    $('#btn-edit-mark').click(function () {
        var id = $(this).data('mark-id');
        var event_type = $('#modal-edit-mark select').val(); // Asumimos que el select está habilitado
        var start_date = $('#modal-edit-mark #mark-start_date').val();
        var start_format = $('#modal-edit-mark #mark-start_format').val();
        var end_date = $('#modal-edit-mark #mark-end_date').val();
        var end_format = $('#modal-edit-mark #mark-end_format').val();
        var description = $('#modal-edit-mark #mark-description').val();
        var reference = $('#modal-edit-mark #mark-reference').val();
        var latitude = $('#modal-edit-mark #mark-latitude').val();
        var longitude = $('#modal-edit-mark #mark-longitude').val();

        // Realizar la solicitud AJAX para editar la marca
        editMark(id, event_type, start_date, start_format, end_date, end_format, description, reference, latitude, longitude);
    });
});