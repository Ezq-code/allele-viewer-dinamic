// Variables globales
let selectedFile = null;
let isProcessing = false;
const REQUEST_TIMEOUT_MS = 300000; // 5 minutos (aumentado para archivos grandes)

// CSRF Token para Django
const csrfToken = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("csrftoken="))
    ?.split("=")[1];

if (csrfToken) {
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
}

// Mostrar mensajes con SweetAlert2
function showMessage(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#3085d6',
        timer: icon === 'success' ? 3000 : undefined,
        timerProgressBar: icon === 'success'
    });
}

// Mostrar loading
function showLoading(message = 'Procesando archivo...') {
    Swal.fire({
        title: 'Cargando...',
        text: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// Cerrar loading
function closeLoading() {
    if (Swal.isVisible()) {
        Swal.close();
    }
}

// Validar archivo
function validateFile(file) {
    if (!file) {
        showMessage('warning', 'Sin archivo', 'Por favor selecciona un archivo');
        return false;
    }
    
    const validExtensions = ['.xlsx', '.xls'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
        showMessage('error', 'Formato inválido', 'Solo se permiten archivos Excel (.xlsx, .xls)');
        return false;
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB (aumentado)
    if (file.size > maxSize) {
        showMessage('error', 'Archivo muy grande', 'El tamaño máximo es 50MB');
        return false;
    }
    
    return true;
}

// Mostrar información del archivo
function displayFileInfo(file) {
    const infoDiv = document.getElementById('fileInfo');
    if (infoDiv && file) {
        const sizeKB = (file.size / 1024).toFixed(2);
        const sizeMB = (sizeKB / 1024).toFixed(2);
        const sizeText = sizeMB >= 1 ? `${sizeMB} MB` : `${sizeKB} KB`;
        
        infoDiv.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
                <i class="fas fa-check-circle"></i>
                <strong>Archivo seleccionado:</strong> ${file.name}<br>
                <strong>Tamaño:</strong> ${sizeText}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        infoDiv.style.display = 'block';
    }
}

// Función para mostrar resultados en un modal
function showResultsModal(data) {
    // Crear el contenido del modal
    let modalContent = `
        <div class="modal fade" id="resultsModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-chart-bar"></i> Resultados del Procesamiento
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
    `;
    
    // Mensaje principal
    if (data.mensaje) {
        modalContent += `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>${data.mensaje}</strong>
            </div>
        `;
    }
    
    // Mostrar resultados si existen
    if (data.resultados) {
        modalContent += renderResultados(data.resultados);
    } else if (data.datos) {
        modalContent += renderResultados(data.datos);
    } else {
        // Intentar mostrar cualquier otro dato
        const otherData = { ...data };
        delete otherData.mensaje;
        delete otherData.status;
        
        if (Object.keys(otherData).length > 0) {
            modalContent += renderResultados(otherData);
        } else {
            modalContent += `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    El archivo se procesó correctamente pero no hay datos adicionales para mostrar.
                </div>
            `;
        }
    }
    
    modalContent += `
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                        ${data.download_url ? `<button type="button" class="btn btn-primary" onclick="window.open('${data.download_url}', '_blank')">
                            <i class="fas fa-download"></i> Descargar Resultados
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal existente si hay
    const existingModal = document.getElementById('resultsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('resultsModal'));
    modal.show();
    
    // Limpiar modal al cerrar
    document.getElementById('resultsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Función para renderizar diferentes tipos de resultados
function renderResultados(data) {
    if (!data) return '<p>No hay datos disponibles</p>';
    
    // Si es un array (lista de registros)
    if (Array.isArray(data)) {
        if (data.length === 0) {
            return '<div class="alert alert-warning">No se encontraron registros</div>';
        }
        
        // Mostrar resumen estadístico
        let html = `
            <div class="alert alert-success">
                <i class="fas fa-chart-line"></i>
                <strong>Resumen:</strong> Se procesaron ${data.length} registros
            </div>
            <div class="table-responsive" style="max-height: 500px;">
                <table class="table table-bordered table-striped table-hover">
                    <thead class="thead-light sticky-top">
                        <tr>
        `;
        
        // Generar encabezados
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        // Mostrar datos (limitado a 100 registros por rendimiento)
        const maxDisplay = 100;
        const displayData = data.slice(0, maxDisplay);
        
        displayData.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                let value = row[header];
                if (value === null || value === undefined) value = '-';
                if (typeof value === 'object') value = JSON.stringify(value);
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        if (data.length > maxDisplay) {
            html += `<div class="alert alert-info mt-2">
                <i class="fas fa-info-circle"></i>
                Mostrando ${maxDisplay} de ${data.length} registros
            </div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    // Si es un objeto con estadísticas o métricas
    if (typeof data === 'object') {
        // Excluir ciertas propiedades que no queremos mostrar como tablas
        const excludeProps = ['mensaje', 'status', 'download_url'];
        
        let html = '<div class="row">';
        
        for (const [key, value] of Object.entries(data)) {
            if (excludeProps.includes(key)) continue;
            
            if (Array.isArray(value)) {
                // Si es un array, mostrarlo en una sección colapsable
                html += `
                    <div class="col-12 mt-3">
                        <div class="card">
                            <div class="card-header bg-info text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-table"></i> ${key}
                                    <span class="badge badge-light float-right">${value.length} items</span>
                                </h6>
                            </div>
                            <div class="card-body p-0">
                                ${renderResultados(value)}
                            </div>
                        </div>
                    </div>
                `;
            } else if (typeof value === 'object' && value !== null) {
                // Si es un objeto anidado
                html += `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-header bg-secondary text-white">
                                <strong>${key}</strong>
                            </div>
                            <div class="card-body">
                                ${renderResultados(value)}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Valores simples
                html += `
                    <div class="col-md-4 mb-2">
                        <div class="info-box">
                            <span class="info-box-icon bg-info"><i class="fas fa-chart-simple"></i></span>
                            <div class="info-box-content">
                                <span class="info-box-text">${key}</span>
                                <span class="info-box-number">${value}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }
    
    // Valor simple
    return `<div class="alert alert-info">Resultado: ${data}</div>`;
}

// Función para bloquear/desbloquear la interfaz
function setProcessingState(processing) {
    isProcessing = processing;
    
    const btnUpload = document.getElementById('btnUpload');
    const resetBtn = document.getElementById('resetBtn');
    const fileInput = document.getElementById('excelFile');
    const customName = document.getElementById('customName');
    const dropZone = document.getElementById('dropZone');
    
    if (btnUpload) {
        btnUpload.disabled = processing;
        if (processing) {
            btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            btnUpload.innerHTML = '<i class="fas fa-upload"></i> Subir y Procesar';
        }
    }
    
    if (resetBtn) resetBtn.disabled = processing;
    if (fileInput) fileInput.disabled = processing;
    if (customName) customName.disabled = processing;
    
    if (dropZone) {
        dropZone.style.opacity = processing ? '0.5' : '1';
        dropZone.style.cursor = processing ? 'not-allowed' : 'pointer';
    }
}

// Subir archivo con mejor manejo de respuesta
async function uploadFile(file, customName) {
    const formData = new FormData();
    formData.append('archivo', file);
    
    const nombreArchivo = customName || file.name;
    formData.append('nombre_archivo', nombreArchivo);
    
    // Log para depuración
    console.log('Enviando archivo:', {
        archivo: file.name,
        archivo_tamaño: file.size,
        archivo_tipo: file.type,
        nombre_archivo: nombreArchivo
    });
    
    try {
        // Usar URL relativa para evitar problemas de CORS en producción
        const info_url = '/genes_to_excel/v1/upload-excel-file/';
        
        console.log('URL:', info_url);

        const response = await axios.post(info_url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    const progressBar = document.getElementById('progressBar');
                    const progressDiv = document.getElementById('uploadProgress');
                    
                    if (progressBar && percent < 100) {
                        progressDiv.style.display = 'block';
                        progressBar.style.width = `${percent}%`;
                        progressBar.textContent = `${percent}%`;
                    }
                }
            },
            timeout: REQUEST_TIMEOUT_MS
        });
        
        console.log('Respuesta completa:', response);
        console.log('Datos de respuesta:', response.data);
        
        const progressDiv = document.getElementById('uploadProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        
        if (response.status === 200 || response.status === 201) {
            // Cerrar loading si está abierto
            closeLoading();
            
            // Mostrar mensaje de éxito
            showMessage('success', '¡Éxito!', response.data.mensaje || 'Archivo procesado correctamente');
            
            // Mostrar resultados en modal
            if (response.data) {
                // Pequeño delay para que el mensaje de éxito se vea antes del modal
                setTimeout(() => {
                    showResultsModal(response.data);
                }, 500);
            }
            
            resetForm();
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error en upload:', error);
        
        const progressDiv = document.getElementById('uploadProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        
        let errorMsg = 'Error al procesar el archivo';
        
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            
            if (error.response.data.error) {
                errorMsg = error.response.data.error;
            } else if (error.response.data.detail) {
                errorMsg = error.response.data.detail;
            } else if (error.response.data.mensaje) {
                errorMsg = error.response.data.mensaje;
            } else if (typeof error.response.data === 'object') {
                const errors = [];
                for (const [key, value] of Object.entries(error.response.data)) {
                    if (Array.isArray(value)) {
                        errors.push(`${key}: ${value.join(', ')}`);
                    } else if (typeof value === 'string') {
                        errors.push(`${key}: ${value}`);
                    }
                }
                if (errors.length) {
                    errorMsg = `Errores de validación: ${errors.join('; ')}`;
                }
            }
        } else if (error.request) {
            errorMsg = 'No se pudo conectar con el servidor. Verifica que el servidor esté corriendo.';
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        closeLoading();
        showMessage('error', 'Error', errorMsg);
        return false;
    }
}

// Resetear formulario
function resetForm() {
    const fileInput = document.getElementById('excelFile');
    const customName = document.getElementById('customName');
    const fileInfoDiv = document.getElementById('fileInfo');
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    
    if (fileInput) {
        fileInput.value = '';
    }
    if (customName) {
        customName.value = '';
    }
    if (fileInfoDiv) {
        fileInfoDiv.style.display = 'none';
        fileInfoDiv.innerHTML = '';
    }
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    }
    
    selectedFile = null;
}

// Manejar envío del formulario
async function handleSubmit(event) {
    event.preventDefault();
    
    // Evitar múltiples envíos simultáneos
    if (isProcessing) {
        showMessage('warning', 'Espera', 'Ya se está procesando un archivo. Por favor espera...');
        return;
    }
    
    if (!selectedFile) {
        showMessage('warning', 'Sin archivo', 'Por favor selecciona un archivo Excel');
        return;
    }
    
    if (!validateFile(selectedFile)) {
        return;
    }
    
    const customName = document.getElementById('customName').value;
    
    // Bloquear interfaz
    setProcessingState(true);
    
    // Mostrar loading
    showLoading('Subiendo y procesando archivo...');
    
    try {
        const success = await uploadFile(selectedFile, customName);
        
        if (!success) {
            // El error ya se maneja en uploadFile
            console.log('Upload failed');
        }
    } catch (error) {
        console.error('Error inesperado:', error);
        closeLoading();
        showMessage('error', 'Error inesperado', 'Ocurrió un error durante el procesamiento');
    } finally {
        // Desbloquear interfaz
        setProcessingState(false);
        // Asegurar que el loading se cierre
        setTimeout(() => {
            if (Swal.isVisible() && Swal.getTitle() === 'Cargando...') {
                closeLoading();
            }
        }, 1000);
    }
}

// Inicializar eventos
function init() {
    const fileInput = document.getElementById('excelFile');
    const form = document.getElementById('uploadForm');
    const resetBtn = document.getElementById('resetBtn');
    const dropZone = document.getElementById('dropZone');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                selectedFile = e.target.files[0];
                if (validateFile(selectedFile)) {
                    displayFileInfo(selectedFile);
                } else {
                    fileInput.value = '';
                    selectedFile = null;
                }
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // Configurar Drag & Drop
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary', 'bg-light');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-light');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-light');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (validateFile(file)) {
                    selectedFile = file;
                    // Actualizar el input file
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    displayFileInfo(file);
                }
            }
        });
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);