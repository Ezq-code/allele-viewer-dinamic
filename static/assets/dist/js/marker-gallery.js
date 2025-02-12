// Función para restablecer el formulario a su estado inicial
function resetGalleryForm() {
    document.getElementById('add-gallery-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-gallery').on('hidden.bs.modal', function (e) {
    resetGalleryForm();
});

// Agregar una función para enviar el formulario
function submitGalleryForm() {
    var form = document.getElementById('add-gallery-form');
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF

    if (form.checkValidity()) {
        var formData = new FormData(form);

        $.ajax({
            url: '/business-gestion/markers-gallery/', // Asegúrate de que esta URL sea la correcta para tu API
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
                    title: "Image added to gallery successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                // Limpiar los campos del formulario
                resetGalleryForm();
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
                    text: 'There was a problem adding the image to the gallery. Please try again.',
                    timer: 1500
                });
                resetGalleryForm();
            }
        });

        // Cerrar la ventana modal después de enviar el formulario
        $('#modal-add-gallery').modal('hide');
        resetGalleryForm();
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
function editGallery(id, gallery_name, gallery_marker, gallery_image_url, gallery_image_file) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    var gallery_id = id;
    var formData = new FormData();
    formData.append('name', gallery_name);
    formData.append('marker', gallery_marker);
    if (gallery_image_file) {
        formData.append('image', gallery_image_file);
    }
    // Si no se seleccionó un nuevo icono, se envía la URL del icono actual
    formData.append('gallery_image_url', gallery_image_url);
    $.ajax({
        url: '/business-gestion/markers-gallery/' + gallery_id + '/',
        type: 'PATCH',
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-edit-gallery').modal('hide');
            Swal.fire({
                icon: "success",
                title: "Successfully edited Gallery",
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
    // Botón de editar en la lista de gallerias
    $(document).on('click', '.btn-edit', function () {
        // Obtener los datos del evento seleccionado
        var gallery_id = $(this).data('gallery-id');
        var gallery_name = $(this).data('gallery-name');
        var gallery_image = $(this).data('gallery-image');
        var gallery_marker = $(this).data('gallery-marker');
        // Guarda gallery_id como dato del modal
        var modalId = '#modal-edit-gallery-' + gallery_id; // Asegúrate de que el ID sea correcto
        $(modalId + ' #gallery-name').val(''); // Limpiar el campo del nombre del evento
        $(modalId + ' #gallery-image-preview').attr('src', ''); // Limpiar la vista previa del icono
        $(modalId + ' #gallery-image-url').val(''); // Limpiar el campo de la URL del icono
        $(modalId + ' #gallery-image').val(''); // Limpiar el input file

        $(modalId + ' #gallery-name').val(gallery_name);
        $(modalId + ' #gallery-marker').val(gallery_marker);
        $(modalId + ' #gallery-image-preview').attr('src', gallery_image);
        $(modalId + ' #gallery-image-url').val(gallery_image);

        $(modalId).modal('show');
    });
    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-gallery', function () {
        var id = $(this).data('gallery-id');
        var modalId = '#modal-edit-gallery-' + id;
        var gallery_name = $(modalId).find('#gallery-name').val();
        var gallery_marker = $(modalId).find('#gallery-marker').val();
        var gallery_image_file = $(modalId).find('#gallery-image')[0].files[0];
        var gallery_image_url = $(modalId).find('#gallery-image-url').val();
        editGallery(id, gallery_name,gallery_marker, gallery_image_url, gallery_image_file);
    });
});




// Funcion para eliminar un evento
function deleteGallery(gallery_id) {
    const csrftoken = $("[name=csrfmiddlewaretoken]").val(); // Obtiene el token CSRF
    $.ajax({
        url: '/business-gestion/markers-gallery/' + gallery_id + '/',
        type: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        },
        success: function (data) {
            console.log(data);
            $('#modal-delete-gallery').modal('hide'); // Ocultar la ventana modal después de la elminacion
            Swal.fire({
                icon: "success",
                title: "Image-data successfully removed",
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
    $('#modal-delete-gallery').modal('hide');
}


//Al abrir el modal, captura el ID del elemento a eliminar y, al confirmar
// llama a una función para llevar a cabo la eliminación.
$(document).ready(function () {
    let galleryId;

    // Captura el ID del marcador cuando se abre el modal
    $('#modal-delete-gallery').on('show.bs.modal', function (gallery) {
        const button = $(gallery.relatedTarget); // Botón que activó el modal
        galleryId = button.data('id'); // Extrae la información del atributo data-id
    });

    // Llama a la función deleteMark al hacer clic en el botón de eliminar
    $('#confirm-delete-gallery').on('click', function () {
        deleteGallery(galleryId);
    });
});
