// Obtener token CSRF de las cookies
const csrfToken = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("csrftoken="))
    ?.split("=")[1];

// Configurar Axios globalmente para incluir el token CSRF
if (csrfToken) {
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
}

// Función para inicializar Select2 en el modal de crear
function initializeCreateSelect2() {
    if ($('#event').hasClass('select2-hidden-accessible')) {
        $('#event').select2('destroy');
    }

    $('#event').select2({
        theme: 'bootstrap4',
        placeholder: 'Select an event',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#modal-add-gallery'),
        minimumResultsForSearch: 0
    });
}

// Función para inicializar Select2 en el modal de editar
function initializeEditSelect2(galleryId) {
    var selector = '#gallery-event-' + galleryId;

    if ($(selector).hasClass('select2-hidden-accessible')) {
        $(selector).select2('destroy');
    }

    $(selector).select2({
        theme: 'bootstrap4',
        placeholder: 'Select an event',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#modal-edit-gallery-' + galleryId),
        minimumResultsForSearch: 0
    });
}

// Función para restablecer el formulario a su estado inicial
function resetGalleryForm() {
    document.getElementById('add-gallery-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-gallery').on('hidden.bs.modal', function (e) {
    resetGalleryForm();
});

// Función para enviar el formulario con Axios
function submitGalleryForm() {
    var form = document.getElementById('add-gallery-form');

    if (form.checkValidity()) {
        var formData = new FormData(form);

        // Agregar también el token CSRF al FormData para mayor seguridad
        if (csrfToken) {
            formData.append('csrfmiddlewaretoken', csrfToken);
        }

        axios.post('/business-gestion/event-gallery/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(function (response) {
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
        })
        .catch(function (error) {
            console.error('Error details:', error.response);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was a problem adding the image to the gallery: ' +
                    (error.response && error.response.data ?
                     JSON.stringify(error.response.data) : error.message),
                timer: 1500
            });
        });

        // Cerrar la ventana modal después de enviar el formulario
        $('#modal-add-gallery').modal('hide');
        resetGalleryForm();
    } else {
        // Mostrar un mensaje de error personalizado
        var errorMessage = 'Please complete all required fields.';
        var invalidFields = form.querySelectorAll(':invalid');
        if (invalidFields.length > 0) {
            errorMessage += '\nEmpty Field:';
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

// Funcion para editar una galería con Axios
function editGallery(id, gallery_name, gallery_event, gallery_image_url, gallery_image_file) {
    var gallery_id = id;
    var formData = new FormData();
    formData.append('name', gallery_name);
    formData.append('event', gallery_event);

    // Agregar el token CSRF al FormData
    if (csrfToken) {
        formData.append('csrfmiddlewaretoken', csrfToken);
    }

    if (gallery_image_file) {
        formData.append('image', gallery_image_file);
    }
    // Si no se seleccionó una nueva imagen, se envía la URL de la imagen actual
    formData.append('gallery_image_url', gallery_image_url);

    axios.patch('/business-gestion/event-gallery/' + gallery_id + '/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(function (response) {
        $('#modal-edit-gallery-' + gallery_id).modal('hide');
        Swal.fire({
            icon: "success",
            title: "Successfully edited Gallery",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(function () {
            location.reload();
        }, 500);
    })
    .catch(function (error) {
        console.error('Error details:', error.response);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was a problem editing the gallery: ' +
                (error.response && error.response.data ?
                 JSON.stringify(error.response.data) : error.message),
            timer: 1500
        });
    });
}

// Cuando un usuario hace clic en el botón de edición,
// se extraen los datos correspondientes y se muestran en un modal
$(document).ready(function () {
    // Eventos para el modal de crear
    $('#modal-add-gallery').on('shown.bs.modal', function() {
        initializeCreateSelect2();
    });

    $('#modal-add-gallery').on('hidden.bs.modal', function() {
        if ($('#event').hasClass('select2-hidden-accessible')) {
            $('#event').select2('destroy');
        }
    });

    // Eventos para los modales de editar (usando delegación)
    $(document).on('shown.bs.modal', '.modal.fade', function() {
        var modalId = $(this).attr('id');
        if (modalId && modalId.startsWith('modal-edit-gallery-')) {
            var galleryId = modalId.replace('modal-edit-gallery-', '');
            setTimeout(function() {
                initializeEditSelect2(galleryId);
            }, 100);
        }
    });

    $(document).on('hidden.bs.modal', '.modal.fade', function() {
        var modalId = $(this).attr('id');
        if (modalId && modalId.startsWith('modal-edit-gallery-')) {
            var galleryId = modalId.replace('modal-edit-gallery-', '');
            var selector = '#gallery-event-' + galleryId;
            if ($(selector).hasClass('select2-hidden-accessible')) {
                $(selector).select2('destroy');
            }
        }
    });

    // Botón de editar en la lista de galerías
    $(document).on('click', '.btn-edit', function () {
        var gallery_id = $(this).data('gallery-id');
        var gallery_name = $(this).data('gallery-name');
        var gallery_image = $(this).data('gallery-image');
        var gallery_event = $(this).data('gallery-event');

        var modalId = '#modal-edit-gallery-' + gallery_id;

        // Limpiar los campos
        $(modalId + ' #gallery-name').val('');
        $(modalId + ' #gallery-event-' + gallery_id).val('').trigger('change');
        $(modalId + ' #gallery-image-preview').attr('src', '');
        $(modalId + ' #gallery-image-url').val('');
        $(modalId + ' #gallery-image').val('');

        // Establecer los valores
        $(modalId + ' #gallery-name').val(gallery_name);
        $(modalId + ' #gallery-event-' + gallery_id).val(gallery_event).trigger('change');
        $(modalId + ' #gallery-image-preview').attr('src', gallery_image);
        $(modalId + ' #gallery-image-url').val(gallery_image);

        $(modalId).modal('show');
    });

    // Enviar formulario al hacer click en el botón Enviar
    $(document).on('click', '#btn-edit-gallery', function () {
        var id = $(this).data('gallery-id');
        var modalId = '#modal-edit-gallery-' + id;
        var gallery_name = $(modalId).find('#gallery-name').val();
        var gallery_event = $(modalId).find('#gallery-event-' + id).val();
        var gallery_image_file = $(modalId).find('#gallery-image')[0].files[0];
        var gallery_image_url = $(modalId).find('#gallery-image-url').val();
        editGallery(id, gallery_name, gallery_event, gallery_image_url, gallery_image_file);
    });
});

// Función para eliminar una galería con Axios
function deleteGallery(gallery_id) {
    // También agregar el token CSRF en el body si tu backend lo requiere
    const data = {
        csrfmiddlewaretoken: csrfToken
    };

    axios.delete('/business-gestion/event-gallery/' + gallery_id + '/', {
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function (response) {
        $('#modal-delete-gallery').modal('hide');
        Swal.fire({
            icon: "success",
            title: "Image-data successfully removed",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(function () {
            location.reload();
        }, 500);
    })
    .catch(function (error) {
        console.error('Error details:', error.response);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was a problem deleting the image: ' +
                (error.response && error.response.data ?
                 JSON.stringify(error.response.data) : error.message),
            timer: 1500
        });
    });
    $('#modal-delete-gallery').modal('hide');
}

// Al abrir el modal, captura el ID del elemento a eliminar
$(document).ready(function () {
    let galleryId;

    // Captura el ID del elemento cuando se abre el modal
    $('#modal-delete-gallery').on('show.bs.modal', function (gallery) {
        const button = $(gallery.relatedTarget);
        galleryId = button.data('id');
    });

    // Llama a la función deleteGallery al hacer clic en el botón de eliminar
    $('#confirm-delete-gallery').on('click', function () {
        deleteGallery(galleryId);
    });
});
