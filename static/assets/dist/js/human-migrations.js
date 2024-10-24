$(document).ready(function() {
    // Crear Feature
    $('#createFeatureButton').click(function() {
        $.ajax({
            url: '../business-gestion/features/create/',  // Cambia esta URL a la correcta
            method: 'POST',
            data: $('#createFeatureForm').serialize(),
            success: function(response) {
                if (response.success) {
                   Swal.fire({
                    icon: "success",
                    title: "Feature creado con éxito",
                    showConfirmButton: false,
                    timer: 1500
                });
                // Limpiar los campos del formulario
                resetFeatureForm();
                // Recargar la página después de 0.5 segundos
                setTimeout(function () {
                    location.reload();
                }, 500);
                } else {
                    alert('Error al crear el feature.');
                }
            },
            error: function() {
               Swal.fire({
                    icon: "error",
                    title: "Error en la solicitud",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    });

});




function resetFeatureForm() {
    document.getElementById('createFeatureForm').reset();
}

function deleteFeature(id) {
    $.ajax({
        url: `../business-gestion/features/delete/${id}/`,
        type: 'POST',
        success: function (data) {
            console.log(data);
            $('#modal-delete-event').modal('hide'); // Ocultar la ventana modal después de la elminacion
            Swal.fire({
                    icon: "success",
                    title: "Evento eliminado con éxito",
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




// Editar evento
function editFeature(id, feature_id, title, mag, place,time, timefinal) {
    var formData = new FormData();
    formData.append('feature_id', feature_id);
    formData.append('title', title);
    formData.append('mag', mag);
    formData.append('place', place);
    formData.append('time', time);
    formData.append('timefinal', timefinal);
    $.ajax({
        url: '../business-gestion/features/edit/' + id + '/',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            console.log(data);
            $('#modal-edit-feature').modal('hide'); // Ocultar la ventana modal después de la edición
            Swal.fire({
                icon: "success",
                title: "Feature editado con éxito",
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
$(document).ready(function() {
  // Botón de editar en la lista de Features
  $('.btn-edit').click(function() {
    // Obtener los datos del evento seleccionado
    var id = $(this).data('feature-id');
    var feature_id = $(this).data('feature-feature_id');
    var title = $(this).data('feature-title');
    var mag = $(this).data('feature-mag');
    var place = $(this).data('feature-place');
    var time = $(this).data('feature-time');
    var timefinal = $(this).data('feature-timefinal');
    // Mostrar el nombre del evento
    $('#modal-edit-feature #feature-feature_id').val(feature_id);
    $('#modal-edit-feature #feature-title').val(title);
    $('#modal-edit-feature #feature-mag').val(mag);
    $('#modal-edit-feature #feature-place').val(place);
    $('#modal-edit-feature #feature-time').val(time);
    $('#modal-edit-feature #feature-timefinal').val(timefinal);
    $('#btn-edit-feature').data('feature-id', id); // Guardamos el ID aquí
    // Mostrar la ventana modal
    $('#modal-edit-feature').modal('show');
  });

  // Enviar formulario al hacer click en el botón Enviar
  $('#btn-edit-feature').click(function() {
    var id = $(this).data('feature-id');
    var feature_id = $('#modal-edit-feature #feature-feature_id').val();
    var title = $('#modal-edit-feature #feature-title').val();
    var mag = $('#modal-edit-feature #feature-mag').val();
    var place = $('#modal-edit-feature #feature-place').val();
    var time = $('#modal-edit-feature #feature-time').val();
    var timefinal = $('#modal-edit-feature #feature-timefinal').val();
    // Realizar la solicitud AJAX para editar el feature
    editFeature(id, feature_id, title, mag, place, time, timefinal);
  });
});

