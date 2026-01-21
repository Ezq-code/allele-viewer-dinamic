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
    if ($('#event-type').hasClass('select2-hidden-accessible')) {
        $('#event-type').select2('destroy');
    }

    $('#event-type').select2({
        theme: 'bootstrap4',
        placeholder: 'Select an event type',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#modal-add-event'),
        minimumResultsForSearch: 0
    });
}

// Función para inicializar Select2 en el modal de editar
function initializeEditSelect2(eventId) {
    var selector = '#event-type-' + eventId;

    if ($(selector).hasClass('select2-hidden-accessible')) {
        $(selector).select2('destroy');
    }

    $(selector).select2({
        theme: 'bootstrap4',
        placeholder: 'Select an event type',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#modal-edit-event-' + eventId),
        minimumResultsForSearch: 0
    });
}

function resetEventForm() {
    document.getElementById('add-event-form').reset();
}

// Agregar un evento que se dispare al cerrar la ventana modal
$('#modal-add-event').on('hidden.bs.modal', function (e) {
    resetEventForm();
});

function submitEventForm() {
    var form = document.getElementById('add-event-form');
    var eventType = $('#event-type').val();

    if (form.checkValidity() && eventType) {
        var formData = new FormData(form);

        // Agregar también el token CSRF al FormData para mayor seguridad
        formData.append('csrfmiddlewaretoken', csrfToken);

        axios.post('/business-gestion/events/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                Swal.fire({
                    icon: "success",
                    title: "Event added successfully",
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
                    text: 'There was a problem adding the Event: ' +
                        (error.response && error.response.data ?
                            JSON.stringify(error.response.data) : error.message),
                    timer: 1500
                });
            });

        $('#modal-add-event').modal('hide');
    } else {
        var errorMessage = 'Please complete all required fields.';
        if (!eventType) {
            errorMessage += '\n- Event Type';
        }
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            timer: 1500
        });
    }
}

// Función para editar un evento con Axios
function editEvent(id, event_name, event_type, description, reference, start_date, end_date, pause_time, event_icon_url, event_icon_file) {
    var event_id = id;
    var formData = new FormData();
    formData.append('event_name', event_name);
    formData.append('event_type', event_type);
    formData.append('description', description);
    formData.append('reference', reference);
    formData.append('start_date', start_date);
    formData.append('end_date', end_date);
    formData.append('pause_time', pause_time);

    // Agregar el token CSRF al FormData
    formData.append('csrfmiddlewaretoken', csrfToken);

    if (event_icon_file) {
        formData.append('event_icon', event_icon_file);
    }
    // Si no se seleccionó un nuevo icono, se envía la URL del icono actual
    formData.append('event_icon_url', event_icon_url);

    axios.put('/business-gestion/events/' + event_id + '/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(function (response) {
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
        })
        .catch(function (error) {
            console.error('Error details:', error.response);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was a problem editing the Event: ' +
                    (error.response && error.response.data ?
                        JSON.stringify(error.response.data) : error.message),
                timer: 1500
            });
        });
}

// Cuando un usuario hace clic en el botón de edición,
// se extraen los datos correspondientes y se muestran en un modal
// para que el usuario pueda modificarlos
$(document).ready(function () {
    // Eventos para el modal de crear
    $('#modal-add-event').on('shown.bs.modal', function () {
        initializeCreateSelect2();
    });

    $('#modal-add-event').on('hidden.bs.modal', function () {
        if ($('#event-type').hasClass('select2-hidden-accessible')) {
            $('#event-type').select2('destroy');
        }
    });

    // Eventos para los modales de editar (usando delegación)
    $(document).on('shown.bs.modal', '.modal.fade', function () {
        var modalId = $(this).attr('id');
        if (modalId && modalId.startsWith('modal-edit-event-')) {
            var eventId = modalId.replace('modal-edit-event-', '');
            setTimeout(function () {
                initializeEditSelect2(eventId);
            }, 100);
        }
    });

    $(document).on('hidden.bs.modal', '.modal.fade', function () {
        var modalId = $(this).attr('id');
        if (modalId && modalId.startsWith('modal-edit-event-')) {
            var eventId = modalId.replace('modal-edit-event-', '');
            var selector = '#event-type-' + eventId;
            if ($(selector).hasClass('select2-hidden-accessible')) {
                $(selector).select2('destroy');
            }
        }
    });

    // Botón de editar en la lista de eventos
    $(document).on('click', '.btn-edit', function () {
        var event_id = $(this).data('event-id');
        var name = $(this).data('event-name');
        var event_type = $(this).data('event-type');
        var icon = $(this).data('event-icon');
        var pause_time = $(this).data('event-pause-time');
        var description = $(this).data('event-description');
        var reference = $(this).data('event-reference');
        var start_date = $(this).data('event-start-date');
        var end_date = $(this).data('event-end-date');

        var modalId = '#modal-edit-event-' + event_id;

        $(modalId + ' #event-name').val(name);
        $(modalId + ' #event-type-' + event_id).val(event_type).trigger('change');
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

        var event_name = $(modalId).find('#event-name').val();
        var event_type = $(modalId).find('#event-type-' + event_id).val();
        var description = $(modalId).find('#event-description').val();
        var reference = $(modalId).find('#event-reference').val();
        var start_date = $(modalId).find('#event-start_date').val();
        var end_date = $(modalId).find('#event-end_date').val();
        var pause_time = $(modalId).find('#event-pause-time').val();
        var event_icon_file = $(modalId).find('#event-icon')[0].files[0];
        var event_icon_url = $(modalId).find('#event-icon-preview').attr('src');

        editEvent(event_id, event_name, event_type, description, reference, start_date, end_date, pause_time, event_icon_url, event_icon_file);
    });
});

// Función para eliminar un evento con Axios
function deleteEvent(event_id) {
    // También agregar el token CSRF en el body para DELETE si tu backend lo requiere
    const data = {
        csrfmiddlewaretoken: csrfToken
    };

    axios.delete('/business-gestion/events/' + event_id + '/', {
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            $('#modal-delete-event').modal('hide');
            Swal.fire({
                icon: "success",
                title: "Event successfully removed",
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
                text: 'There was a problem deleting the Event: ' +
                    (error.response && error.response.data ?
                        JSON.stringify(error.response.data) : error.message),
                timer: 1500
            });
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


// Código para la subida múltiple de imágenes (manteniendo la estructura original pero usando Axios)
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = '/business-gestion/event-gallery';
    let selectedFiles = {}; // Almacenar archivos por evento

    // Mostrar nombres y previsualización de archivos seleccionados
    $(document).on('change', '.custom-file-input', function () {
        const input = $(this)[0];
        const eventId = $(this).attr('id').split('-')[2];
        selectedFiles[eventId] = Array.from(input.files);

        updateFileLabel(this);
        updatePreview(eventId);
    });

    // Actualizar la etiqueta del input de archivos
    function updateFileLabel(inputElement) {
        const eventId = $(inputElement).attr('id').split('-')[2];
        const fileNames = selectedFiles[eventId].map(file => file.name);
        $(inputElement).next('.custom-file-label').html(fileNames.join(', '));
    }

    // Actualizar la previsualización con botones de eliminar
    function updatePreview(eventId) {
        const previewArea = $('#preview-' + eventId);
        previewArea.empty();

        if (selectedFiles[eventId] && selectedFiles[eventId].length > 0) {
            selectedFiles[eventId].forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const previewItem = $(`
                        <div class="preview-item" style="position: relative; display: inline-block; margin: 5px;">
                            <img src="${e.target.result}" style="max-height: 100px; max-width: 100px;">
                            <button type="button" class="btn btn-danger btn-xs remove-image" 
                                style="position: absolute; top: 0; right: 0; padding: 2px 5px;"
                                data-event-id="${eventId}" data-file-index="${index}">
                                <i class="fa fa-times"></i>
                            </button>
                        </div>
                    `);
                    previewArea.append(previewItem);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // Eliminar imagen de la previsualización
    $(document).on('click', '.remove-image', function () {
        const eventId = $(this).data('event-id');
        const fileIndex = $(this).data('file-index');

        // Eliminar el archivo del array
        selectedFiles[eventId].splice(fileIndex, 1);

        // Reconstruir el input de archivos
        const dataTransfer = new DataTransfer();
        selectedFiles[eventId].forEach(file => dataTransfer.items.add(file));
        $('#event-images-' + eventId)[0].files = dataTransfer.files;

        // Actualizar vistas
        updatePreview(eventId);
        updateFileLabel($('#event-images-' + eventId));
    });

    // Manejar el envío del formulario via Axios
    $(document).on('submit', '[id^="add-images-form-"]', function (e) {
        e.preventDefault();
        const form = $(this);
        const eventId = form.attr('id').split('-')[3];
        const formData = new FormData();

        // Agregar solo los archivos que quedaron seleccionados
        if (selectedFiles[eventId]) {
            selectedFiles[eventId].forEach(file => {
                formData.append('images', file);
            });
        }

        // Agregar CSRF token
        if (csrfToken) {
            formData.append('csrfmiddlewaretoken', csrfToken);
        }

        axios.post(`${API_BASE_URL}/bulk-upload/${eventId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                if (typeof toastr !== 'undefined') {
                    toastr.success(response.data.message || 'Images uploaded successfully');
                }
                $('#modal-add-images-' + eventId).modal('hide');
                location.reload();
            })
            .catch(function (error) {
                // const errorMsg = error.response?.data?.error || 'Error uploading images';
                // if (typeof toastr !== 'undefined') {
                //     toastr.error(errorMsg);
                // }
                console.error('Upload error details:', error);

                // Mostrar detalles del error en la consola
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Request made but no response:', error.request);
                } else {
                    console.error('Error setting up request:', error.message);
                }

                const errorMsg = error.response?.data?.error ||
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Error uploading images';

                if (typeof toastr !== 'undefined') {
                    toastr.error(errorMsg);
                }

            });
    });
});