// Variables globales
let selectedFile = null;
const REQUEST_TIMEOUT_MS = 120000;

// Obtener token CSRF de Django
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return null;
}

// Configurar Axios con CSRF
axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

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
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showMessage('error', 'Archivo muy grande', 'El tamaño máximo es 10MB');
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

// Subir archivo
async function uploadFile(file, customName) {
    const formData = new FormData();
    formData.append('archivo', file);
    
    if (customName) {
        formData.append('nombre_archivo', customName);
    }
    
    try {
        // INFORMACIÓN DEL API
        let info_url = `/genes_to_excel/v1/upload_excel_file/`;
        const response = await axios.post(info_url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                const progressBar = document.getElementById('progressBar');
                const progressDiv = document.getElementById('uploadProgress');
                
                if (progressBar && percent < 100) {
                    progressDiv.style.display = 'block';
                    progressBar.style.width = `${percent}%`;
                    progressBar.textContent = `${percent}%`;
                }
            },
            timeout: REQUEST_TIMEOUT_MS
        });
        
        // Ocultar barra de progreso
        const progressDiv = document.getElementById('uploadProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        
        if (response.status === 201) {
            showMessage('success', '¡Éxito!', response.data.mensaje || 'Archivo procesado correctamente');
            resetForm();
            return true;
        }
    } catch (error) {
        // Ocultar barra de progreso
        const progressDiv = document.getElementById('uploadProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        
        let errorMsg = 'Error al procesar el archivo';
        if (error.response && error.response.data) {
            errorMsg = error.response.data.error || error.response.data.detail || errorMsg;
        } else if (error.request) {
            errorMsg = 'No se pudo conectar con el servidor';
        }
        
        showMessage('error', 'Error', errorMsg);
        return false;
    }
}

// Resetear formulario
function resetForm() {
    const fileInput = document.getElementById('excelFile');
    const customName = document.getElementById('customName');
    const fileInfo = document.getElementById('fileInfo');
    const progressDiv = document.getElementById('uploadProgress');
    
    if (fileInput) fileInput.value = '';
    if (customName) customName.value = '';
    if (fileInfo) {
        fileInfo.style.display = 'none';
        fileInfo.innerHTML = '';
    }
    if (progressDiv) progressDiv.style.display = 'none';
    
    selectedFile = null;
}

// Manejar envío del formulario
async function handleSubmit(event) {
    event.preventDefault();
    
    if (!selectedFile) {
        showMessage('warning', 'Sin archivo', 'Por favor selecciona un archivo Excel');
        return;
    }
    
    if (!validateFile(selectedFile)) {
        return;
    }
    
    const customName = document.getElementById('customName').value;
    
    showLoading('Subiendo y procesando archivo...');
    const success = await uploadFile(selectedFile, customName);
    
    if (!success) {
        Swal.close();
    }
}

// Inicializar eventos
function init() {
    const fileInput = document.getElementById('excelFile');
    const form = document.getElementById('uploadForm');
    const resetBtn = document.getElementById('resetBtn');
    
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
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);