
// ============================================
// VARIABLES GLOBALES
// ============================================
const load = document.getElementById("load");
let currentGen = null;
const REQUEST_TIMEOUT_MS = 120000;
const DEFAULT_COLOR = "255,255,255";
const DEBUG = false;
const RENDER_ROWS_PER_FRAME = 30;

// Cache de estilos por color para evitar parseos repetidos en tablas grandes
const colorStyleCache = new Map();

// CSRF Token para Django
const csrfToken = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("csrftoken="))
    ?.split("=")[1];

if (csrfToken) {
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
}

// ============================================
// FUNCIÓN PARA OBTENER TODAS LAS PÁGINAS
// ============================================
async function obtenerTodosLosRegistros(genName) {
    let info_url = `/genes_to_excel/caracteristica-gen/get-all/?gen_id=${genName}`;
    if (DEBUG) console.log(`Obteniendo todos los registros para ${genName}...`);
    
    // Mostrar progreso inicial
    const statsSpan = document.getElementById("info-stats");
    if (statsSpan) {
        statsSpan.innerHTML = `Cargando datos de ${genName}...`;
    }
    const response = await axios.get(info_url, {
                                            timeout: REQUEST_TIMEOUT_MS
                                        });
    const data = response.data;
    const result = data.results || [];
    if (DEBUG) console.log(`Total registros obtenidos: ${result.length}`);
    return result;
}

function getColorStyle(color, hasValue) {
    if (!hasValue || !color || color === DEFAULT_COLOR) {
        return { bg: "", textColor: "", bold: false };
    }

    if (colorStyleCache.has(color)) {
        return colorStyleCache.get(color);
    }

    const rgb = color.split(",").map(Number);
    if (rgb.length !== 3 || rgb.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
        const fallback = { bg: "", textColor: "", bold: false };
        colorStyleCache.set(color, fallback);
        return fallback;
    }

    const isWhite = rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255;
    if (isWhite) {
        const whiteStyle = { bg: "", textColor: "", bold: false };
        colorStyleCache.set(color, whiteStyle);
        return whiteStyle;
    }

    const luminancia = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
    const style = {
        bg: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
        textColor: luminancia > 128 ? "#000" : "#fff",
        bold: true
    };
    colorStyleCache.set(color, style);
    return style;
}

// ============================================
// 1. CARGAR LISTA DE GENES DESDE NUEVO ENDPOINT
// ============================================
async function cargarListaGenes() {
    try {
        // Mostrar loading
        if (load) load.hidden = false;
        
        if (DEBUG) console.log("🔍 Haciendo petición a: /genes_to_excel/caracteristica-gen/get-related-genes/");
        
        // Usar el nuevo endpoint específico para lista de genes
        const response = await axios.get("/genes_to_excel/caracteristica-gen/get-related-genes/", {
                                            timeout: REQUEST_TIMEOUT_MS
                                        });
        
        if (DEBUG) {
            console.log("✅ Respuesta recibida:", response);
            console.log("📦 Datos de respuesta:", response.data);
            console.log("📊 Tipo de datos:", typeof response.data);
            console.log("📊 ¿Es array?", Array.isArray(response.data));
        }
        
        const genesData = response.data;
        
        // Verificar que genesData es un array
        let genesList = [];
        
        if (Array.isArray(genesData)) {
            if (DEBUG) console.log("✅ genesData es un array, longitud:", genesData.length);
            // Extraer id y name de cada objeto
            genesList = genesData
                .map((gene) => ({ id: gene.id, name: gene.name }))
                .filter((gene) => gene.id && gene.name);
        } else if (genesData.results && Array.isArray(genesData.results)) {
            if (DEBUG) console.log("✅ genesData tiene resultados paginados, longitud:", genesData.results.length);
            // Por si acaso el endpoint devuelve paginado en el futuro
            genesList = genesData.results
                .map((gene) => ({ id: gene.id, name: gene.name }))
                .filter((gene) => gene.id && gene.name);
        } else {
            console.error("❌ Formato inesperado:", genesData);
            throw new Error("Formato de datos de genes inválido");
        }
        
        if (DEBUG) console.log("📋 Lista de genes extraída:", genesList);
        if (DEBUG) console.log(`📊 Total de genes encontrados: ${genesList.length}`);
        
        const selectGene = document.getElementById("selectGene");
        if (!selectGene) {
            console.error("❌ No se encontró el elemento selectGene");
            return;
        }
        
        if (genesList.length === 0) {
            console.warn("⚠️ No se encontraron genes en la respuesta");
            selectGene.innerHTML = '<option value="">No hay genes disponibles</option>';
            if (load) load.hidden = true;
            return;
        }
        
        // Llenar el select con los genes
        selectGene.innerHTML = '<option value="">Seleccione un gen</option>';
        
        const optionFragment = document.createDocumentFragment();
        genesList.forEach(gene => {
            const option = document.createElement("option");
            option.value = gene.id;  // Usar ID como value
            option.textContent = gene.name;  // Mostrar nombre
            optionFragment.appendChild(option);
            if (DEBUG) console.log(`✅ Opción agregada: ${gene.name} (ID: ${gene.id})`);
        });
        selectGene.appendChild(optionFragment);
        
        // Recuperar último gen seleccionado del localStorage
        const lastGenId = localStorage.getItem("lastSelectedGenId");
        if (DEBUG) console.log(`📌 Último gen seleccionado: ${lastGenId}`);
        
        if (lastGenId && genesList.some(g => g.id === lastGenId)) {
            selectGene.value = lastGenId;
            if (DEBUG) console.log(`🔄 Cargando último gen: ${lastGenId}`);
            // Cargar datos automáticamente si hay un gen guardado
            //cargarDatosPorGen(lastGenId);
        }
        
        // Ocultar loading
        if (load) load.hidden = true;
        
        if (DEBUG) console.log(`✅ Genes cargados exitosamente: ${genesList.length} genes encontrados`);
        
    } catch (error) {
        console.error("❌ Error cargando lista de genes:", error);
        console.error("Detalles del error:", {
            message: error.message,
            response: error.response,
            config: error.config
        });
        
        const selectGene = document.getElementById("selectGene");
        if (selectGene) {
            selectGene.innerHTML = '<option value="">Error al cargar genes</option>';
        }
        
        // Mostrar mensaje de error detallado
        let errorMsg = `No se pudo cargar la lista de genes: ${error.message}`;
        
        if (error.response) {
            errorMsg += `\nStatus: ${error.response.status}`;
            errorMsg += `\nData: ${JSON.stringify(error.response.data)}`;
        }
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "error",
                title: "Error al cargar genes",
                text: errorMsg,
                confirmButtonText: "Aceptar"
            });
        } else {
            console.error("Error:", errorMsg);
            const infoGen = document.getElementById("infoGenActual");
            if (infoGen) {
                infoGen.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${error.message}`;
                infoGen.style.background = "#f8d7da";
            }
        }
        
        if (load) load.hidden = true;
    }
}

// ============================================
// 2. PROCESAR DATOS - CREAR MATRIZ COMPLETA DESDE COORDENADAS
// ============================================
function procesarDatos(registros) {
    if (DEBUG) console.log("Procesando registros:", registros.length);
    
    if (!registros || registros.length === 0) {
        return {
            matriz: [],
            filas: [],
            columnas: [],
            minFila: 0,
            maxFila: 0,
            minCol: 0,
            maxCol: 0
        };
    }
    
    // Encontrar el rango mínimo y máximo de filas y columnas
    let minFila = Infinity;
    let maxFila = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    
    // Mapa para almacenar valores por coordenada
    const celdasMap = new Map(); // Key: "fila,columna" -> {valor, color}
    
    // Primera pasada: encontrar rangos y almacenar valores
    for (let i = 0; i < registros.length; i++) {
        const reg = registros[i];
        const cord = reg.cord;
        const valor = reg.valor || "";
        const color = reg.color || DEFAULT_COLOR;
        
        if (cord && cord.includes(',')) {
            const [fila, columna] = cord.split(',').map(Number);
            
            if (!isNaN(fila) && !isNaN(columna)) {
                // Actualizar rangos
                minFila = Math.min(minFila, fila);
                maxFila = Math.max(maxFila, fila);
                minCol = Math.min(minCol, columna);
                maxCol = Math.max(maxCol, columna);
                
                // Guardar el valor si no está vacío
                const key = `${fila},${columna}`;
                if (valor && valor.trim() !== "") {
                    celdasMap.set(key, {
                        valor: valor,
                        color: color
                    });
                }
            }
        }
    }
    
    // Si no se encontraron coordenadas válidas
    if (minFila === Infinity) {
        console.error("No se encontraron coordenadas válidas");
        return {
            matriz: [],
            filas: [],
            columnas: [],
            minFila: 0,
            maxFila: 0,
            minCol: 0,
            maxCol: 0
        };
    }
    
    // Crear array de filas y columnas (desde min hasta max)
    const filas = [];
    for (let i = minFila; i <= maxFila; i++) {
        filas.push(i);
    }
    
    const columnas = [];
    for (let j = minCol; j <= maxCol; j++) {
        columnas.push(j);
    }
    
    if (DEBUG) {
        console.log(`Rango de filas: ${minFila} a ${maxFila} (total: ${filas.length})`);
        console.log(`Rango de columnas: ${minCol} a ${maxCol} (total: ${columnas.length})`);
        console.log(`Celdas con datos: ${celdasMap.size}`);
    }
    
    // Crear la matriz completa (todas las celdas, incluso vacías)
    const matriz = [];
    
    for (let i = 0; i < filas.length; i++) {
        const filaNum = filas[i];
        const filaData = [];
        
        for (let j = 0; j < columnas.length; j++) {
            const colNum = columnas[j];
            const key = `${filaNum},${colNum}`;
            const celda = celdasMap.get(key);
            
            if (celda) {
                filaData.push({
                    valor: celda.valor,
                    color: celda.color,
                    fila: filaNum,
                    columna: colNum
                });
            } else {
                filaData.push({
                    valor: "",
                    color: "255,255,255",
                    fila: filaNum,
                    columna: colNum
                });
            }
        }
        matriz.push(filaData);
    }
    
    // Contar estadísticas
    const celdasConValor = celdasMap.size;
    
    if (DEBUG) {
        console.log(`Matriz creada: ${filas.length} filas x ${columnas.length} columnas`);
        console.log(`Celdas con valor: ${celdasConValor} de ${filas.length * columnas.length} total`);
    }
    
    // Mostrar ejemplo de las primeras celdas no vacías
    if (DEBUG && celdasMap.size > 0) {
        const primerasCeldas = Array.from(celdasMap.entries()).slice(0, 5);
        console.log("Ejemplo de celdas con datos:", primerasCeldas);
    }
    
    return {
        matriz: matriz,
        filas: filas,
        columnas: columnas,
        minFila: minFila,
        maxFila: maxFila,
        minCol: minCol,
        maxCol: maxCol,
        totalCeldas: filas.length * columnas.length,
        celdasConDatos: celdasMap.size
    };
}


// ============================================
// FUNCIÓN PARA SANITIZAR HTML (Prevenir XSS)
// ============================================
function sanitizarHTML(str) {
    if (!str) return 'N/A';
    sanitizarHTML._el ||= document.createElement('div');
    sanitizarHTML._el.textContent = str;
    return sanitizarHTML._el.innerHTML;
}

// ============================================
// FUNCIÓN PARA VALIDAR COLOR RGB
// ============================================
function validarColorRGB(color) {
    if (!color) return '200,200,200';
    const partes = color.split(',').map(Number);
    if (partes.length === 3 && partes.every(n => n >= 0 && n <= 255)) {
        return color;
    }
    return '200,200,200';
}

// ============================================
// FUNCIÓN PARA OBTENER Y MOSTRAR DETALLES DE LA CELDA (MEJORADA)
// ============================================
async function mostrarDetalleCelda(alelo, columna, filaNum, colNum, valorActual) {
    // ========== VALIDACIONES DE SEGURIDAD ==========
    
    // 1. Verificar que no sea la primera columna (índice de fila)
    if (!filaNum || !colNum) {
        console.warn("Intento de click en celda sin coordenadas válidas");
        return;
    }
    
    // 2. Verificar que el valor no esté vacío
    if (!valorActual || valorActual.trim() === "") {
        console.warn("Intento de click en celda vacía");
        return;
    }
    
    // 3. Verificar que las coordenadas sean números válidos
    if (isNaN(filaNum) || isNaN(colNum) || filaNum < 0 || colNum < 0) {
        console.error("Coordenadas inválidas:", { filaNum, colNum });
        return;
    }

    // 4. 🚫 EXCLUIR PRIMERA COLUMNA (columna 0 - números/índices)
    if (colNum === 0) {
        console.log("🚫 Primera columna (índice) - Sin acción", { filaNum, colNum });
        return;
    }
    
    // 5. 🚫 EXCLUIR PRIMERA FILA (fila 0 o 1 - headers adicionales)
    //    Ajusta según tu estructura: puede ser fila 0 o fila 1
    const PRIMERA_FILA_HEADER = 0;  // o 1, según tu matriz
    if (filaNum === PRIMERA_FILA_HEADER) {
        console.log("🚫 Primera fila (header) - Sin acción", { filaNum, colNum });
        return;
    }
    
    // 6. 🚫 EXCLUIR SEGUNDA COLUMNA (columna 1 - metadata)
    const SEGUNDA_COLUMNA_METADATA = 1;
    if (colNum === SEGUNDA_COLUMNA_METADATA) {
        console.log("🚫 Segunda columna (metadata) - Sin acción", { filaNum, colNum });
        return;
    }
    
    // 7. 🚫 EXCLUIR SEGUNDA FILA (fila 1 - metadata adicional)
    const SEGUNDA_FILA_METADATA = 1;
    if (filaNum === SEGUNDA_FILA_METADATA) {
        console.log("🚫 Segunda fila (metadata) - Sin acción", { filaNum, colNum });
        return;
    }

    // 8. Validar parámetros obligatorios
    if (!currentGen) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: 'No hay un gen seleccionado',
                confirmButtonText: 'Aceptar'
            });
        }
        return;
    }
    
    // Validar que las coordenadas sean números válidos
    const filaValida = Number.isInteger(filaNum) && filaNum >= 0;
    const colValida = Number.isInteger(colNum) && colNum >= 0;
    
    if (!filaValida || !colValida) {
        console.error('Coordenadas inválidas:', filaNum, colNum);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Coordenadas inválidas: (${filaNum}, ${colNum})`,
                confirmButtonText: 'Aceptar'
            });
        }
        return;
    }
    
    let swalInstance = null;
    
    try {
        // Mostrar modal de carga con timeout
        if (typeof Swal !== 'undefined') {
            swalInstance = Swal.fire({
                title: 'Cargando información...',
                html: '<i class="fas fa-spinner fa-pulse"></i> Obteniendo datos de la coordenada...',
                allowOutsideClick: true, // Permitir cerrar mientras carga
                showConfirmButton: false,
                timer: 10000, // Timeout de 10 segundos
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
        
        // Construir URL con parámetros codificados correctamente
        const params = new URLSearchParams({
            cord: `${filaNum},${colNum}`,
            gen_id: currentGen,
        });
        const url = `/genes_to_excel/coordenadas-gen/?${params.toString()}`;
        
        console.log(`🔍 Consultando detalles en: ${url}`);
        
        // Agregar timeout a la petición axios
        const response = await axios.get(url, {
            timeout: REQUEST_TIMEOUT_MS
        });
        
        const data = response.data;
        
        // Validar respuesta
        if (!data.results || data.results.length === 0) {
            throw new Error('No se encontraron detalles para esta celda');
        }
        
        const detalle = data.results[0];
        
        // Sanitizar todos los campos
        const gen = sanitizarHTML(detalle.Gene);
        const coordinate = sanitizarHTML(detalle.Coordinate);
        const valor = sanitizarHTML(detalle.Valor);
        const colorValido = validarColorRGB(detalle.Color);
        const protein = sanitizarHTML(detalle.Protein);
        const species = sanitizarHTML(detalle.Species);
        const variant = sanitizarHTML(detalle.Variant);
        const order1 = sanitizarHTML(detalle.Order1);
        const order2 = sanitizarHTML(detalle.Order2);
        const order3 = sanitizarHTML(detalle.Order3);
        
        // Procesar alelos asociados de forma segura
        let alelosAsociados = [];
        if (detalle.Alleleasoc) {
            alelosAsociados = detalle.Alleleasoc.split(',')
                .map(al => sanitizarHTML(al.trim()))
                .filter(al => al && al !== '');
        }
        
        // Calcular color de texto para contraste
        const rgbParts = colorValido.split(',').map(Number);
        const luminancia = (rgbParts[0] * 0.299 + rgbParts[1] * 0.587 + rgbParts[2] * 0.114);
        const textoColor = luminancia > 128 ? '#000000' : '#ffffff';
        
        // Crear contenido HTML de forma segura (usando textContent internamente)
        const contenidoHTML = `
            <div style="text-align: left; font-family: monospace; max-height: 70vh; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; width: 40%; background: #f5f5f5;">Gen:</td>
                        <td style="padding: 8px;">${gen}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Coordenada:</td>
                        <td style="padding: 8px;">${coordinate}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Valor:</td>
                        <td style="padding: 8px;">
                            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: rgb(${colorValido}); color: ${textoColor}; font-weight: bold;">
                                ${valor || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Color:</td>
                        <td style="padding: 8px;">
                            <div style="display: inline-block; width: 40px; height: 20px; background-color: rgb(${colorValido}); border: 1px solid #ccc; vertical-align: middle;"></div>
                            <span style="margin-left: 8px;">(${colorValido})</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Proteína:</td>
                        <td style="padding: 8px;">${protein}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Alelos Asociados:</td>
                        <td style="padding: 8px;">
                            ${alelosAsociados.length > 0 ? 
                                `<div style="max-height: 150px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${alelosAsociados.map(al => `<span style="background: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block;">${al}</span>`).join('')}
                                </div>` : 
                                '<span style="color: #999;">Ninguno</span>'
                            }
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Especie:</td>
                        <td style="padding: 8px;">${species}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Variante:</td>
                        <td style="padding: 8px;">${variant}</td>
                    </tr>
                    ${order1 !== 'N/A' ? `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Order1:</td>
                        <td style="padding: 8px;">${order1}</td>
                    </tr>
                    ` : ''}
                    ${order2 !== 'N/A' ? `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Order2:</td>
                        <td style="padding: 8px;">${order2}</td>
                    </tr>
                    ` : ''}
                    ${order3 !== 'N/A' ? `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Order3:</td>
                        <td style="padding: 8px;">${order3}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
        `;
        
        // Cerrar modal de carga si existe
        if (swalInstance) {
            swalInstance.close();
        }
        
        // Mostrar modal con información
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                title: `📊 Información - ${gen}`,
                html: contenidoHTML,
                icon: 'info',
                width: '650px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3085d6',
                showCloseButton: true,
                customClass: {
                    popup: 'detalle-celda-modal'
                }
            });
        } else {
            // Fallback seguro sin alert()
            console.log('Detalle celda:', {
                gen, coordinate, valor, protein, species, variant
            });
            mostrarMensaje(`Información: ${gen} - ${valor}`, 'info');
        }
        
    } catch (error) {
        console.error("Error obteniendo detalles de la celda:", error);
        
        // Cerrar modal de carga si existe
        if (swalInstance) {
            swalInstance.close();
        }
        
        let mensajeError = '';
        let tituloError = 'Error al cargar detalles';
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            mensajeError = 'La petición ha excedido el tiempo de espera. Por favor, intente nuevamente.';
        } else if (error.response) {
            if (error.response.status === 404) {
                mensajeError = `No se encontró información para la coordenada (${filaNum}, ${colNum}) en el gen ${currentGen}`;
                tituloError = 'Información no disponible';
            } else if (error.response.status === 500) {
                mensajeError = 'Error interno del servidor. Por favor, intente más tarde.';
            } else {
                mensajeError = `Error ${error.response.status}: ${error.response.statusText || error.message}`;
            }
        } else if (error.request) {
            mensajeError = 'No se recibió respuesta del servidor. Verifique su conexión.';
        } else {
            mensajeError = error.message || 'Error desconocido al cargar los detalles';
        }
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: error.response?.status === 404 ? 'info' : 'error',
                title: tituloError,
                text: mensajeError,
                confirmButtonText: 'Aceptar'
            });
        } else {
            mostrarMensaje(mensajeError, 'error');
        }
    }
}

// ============================================
// Convertir número a letras estilo Excel (1=A, 2=B, 27=AA)
// ============================================
function numeroALetra(numero) {
    let resultado = '';
    while (numero > 0) {
        numero--;
        resultado = String.fromCharCode(65 + (numero % 26)) + resultado;
        numero = Math.floor(numero / 26);
    }
    return resultado;
}

// ============================================
// 3. RENDERIZAR TABLA ESTILO EXCEL
// ============================================
function renderizarTablaExcel(data) {
    const container = document.getElementById("excel-container");
    if (!container) return;
    
    const { matriz, filas, columnas, minFila, minCol } = data;
    
    if (!matriz || matriz.length === 0 || columnas.length === 0) {
        mostrarMensaje("No se encontraron datos para mostrar", "warning");
        return;
    }
    
    if (DEBUG) {
        console.log(`Renderizando tabla: ${filas.length} filas x ${columnas.length} columnas`);
        console.log(`Coordenada inicial: (${minFila}, ${minCol})`);
    }
    
    // Mostrar indicador de carga
    container.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-pulse"></i> Renderizando tabla...</div>';
    
    // Usar setTimeout para arrancar fuera del ciclo de eventos actual
    setTimeout(() => {
        const table = document.createElement("table");
        table.className = "excel-table";
        
        // ========== CABECERA ==========
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        
        // Esquina superior izquierda
        const thCorner = document.createElement("th");
        thCorner.textContent = "Alelos \\ Proteínas";
        thCorner.style.minWidth = "100px";
        thCorner.style.position = "sticky";
        thCorner.style.left = "0";
        thCorner.style.backgroundColor = "#f3f3f3";
        thCorner.style.zIndex = "20";
        headerRow.appendChild(thCorner);
        
        // Columnas (mostrar nombres de proteínas)
        //columnas.forEach(proteina => {
        //    const th = document.createElement("th");
        //    th.textContent = proteina;
        //    th.style.minWidth = "80px";
        //    th.style.backgroundColor = "#f3f3f3";
        //    th.style.position = "sticky";
        //    th.style.top = "0";
        //    th.style.zIndex = "10";
        //    headerRow.appendChild(th);
        //});

        // Columnas - AHORA CON LETRAS EN LUGAR DE NÚMEROS
        const headerFragment = document.createDocumentFragment();
        columnas.forEach(proteina => {
            const th = document.createElement("th");
            th.textContent = numeroALetra(proteina); // ← Cambiado de 'proteina' a letras
            th.style.minWidth = "80px";
            th.style.backgroundColor = "#f3f3f3";
            th.style.position = "sticky";
            th.style.top = "0";
            th.style.zIndex = "10";
            headerFragment.appendChild(th);
        });
        headerRow.appendChild(headerFragment);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // ========== CUERPO ==========
        const tbody = document.createElement("tbody");
        
        table.appendChild(tbody);
        container.innerHTML = "";
        container.appendChild(table);

        // Delegación de eventos para minimizar listeners por celda
        tbody.addEventListener("click", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td) return;
            event.stopPropagation();

            mostrarDetalleCelda(
                td.dataset.alelo,
                Number(td.dataset.columna),
                Number(td.dataset.fila),
                Number(td.dataset.colNum),
                td.dataset.valor
            );
        });

        tbody.addEventListener("mouseover", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td || td.contains(event.relatedTarget)) return;
            td.style.backgroundColor = "#e3f2fd";
            td.style.transform = "scale(1.02)";
            td.style.transition = "all 0.2s ease";
            td.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        });

        tbody.addEventListener("mouseout", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td || td.contains(event.relatedTarget)) return;
            td.style.backgroundColor = td.dataset.baseBg || "";
            td.style.transform = "scale(1)";
            td.style.boxShadow = "none";
        });

        // Render incremental por lotes para mantener UI responsiva
        let idxFila = 0;
        const totalFilas = matriz.length;

        const renderChunk = () => {
            const bodyFragment = document.createDocumentFragment();
            const end = Math.min(idxFila + RENDER_ROWS_PER_FRAME, totalFilas);

            for (; idxFila < end; idxFila++) {
                const fila = matriz[idxFila];
                const tr = document.createElement("tr");

                // Primera columna - Nombre del alelo (SIN acción)
                const tdAlelo = document.createElement("td");
                tdAlelo.textContent = filas[idxFila];
                tdAlelo.style.fontWeight = "bold";
                tdAlelo.style.backgroundColor = "#f8f8f8";
                tdAlelo.style.position = "sticky";
                tdAlelo.style.left = "0";
                tdAlelo.style.minWidth = "100px";
                tdAlelo.style.textAlign = "center";
                tdAlelo.style.zIndex = "5";
                tr.appendChild(tdAlelo);

                // Celdas de datos
                for (let idxCol = 0; idxCol < fila.length; idxCol++) {
                    const celda = fila[idxCol];
                    const td = document.createElement("td");
                    td.textContent = celda.valor || "";
                    td.style.textAlign = "center";
                    td.style.padding = "8px 12px";
                    td.style.border = "1px solid #ddd";

                    const colorStyle = getColorStyle(celda.color, Boolean(celda.valor));
                    if (colorStyle.bg) {
                        td.style.backgroundColor = colorStyle.bg;
                        td.style.color = colorStyle.textColor;
                        td.style.fontWeight = "bold";
                    }

                    // ========== AGREGAR ACCIÓN SOLO A CELDAS CON VALOR ==========
                    if (celda.valor && celda.valor !== "") {
                        td.style.cursor = "pointer";
                        td.classList.add("clickable-cell");
                        td.dataset.alelo = filas[idxFila];
                        td.dataset.columna = String(columnas[idxCol]);
                        td.dataset.fila = String(celda.fila);
                        td.dataset.colNum = String(celda.columna);
                        td.dataset.valor = celda.valor;
                        td.dataset.baseBg = colorStyle.bg;
                        td.title = `Click into a cell to see details "${celda.valor}" en ${filas[idxFila]}`;
                    }

                    tr.appendChild(td);
                }

                bodyFragment.appendChild(tr);
            }

            tbody.appendChild(bodyFragment);

            if (idxFila < totalFilas) {
                requestAnimationFrame(renderChunk);
                return;
            }

            // Actualizar estadísticas al finalizar el render
            const statsSpan = document.getElementById("info-stats");
            if (statsSpan) {
                statsSpan.innerHTML = `${filas.length} filas × ${columnas.length} columnas | ${data.celdasConDatos} celdas con datos`;
                statsSpan.className = "badge";
            }

            if (DEBUG) console.log("✅ Tabla renderizada correctamente");

            // Agregar información adicional en el indicador virtual
            const indicator = document.getElementById("virtualScrollIndicator");
            if (indicator) {
                indicator.classList.remove("hidden");
                indicator.innerHTML = `<i class="fas fa-table"></i> Matriz desde (${data.minFila},${data.minCol}) hasta (${data.maxFila},${data.maxCol}) | Total celdas: ${data.totalCeldas.toLocaleString()} | Celdas con datos: ${data.celdasConDatos}`;
            }
        };

        requestAnimationFrame(renderChunk);
        
    }, 100);
}

// ============================================
// FUNCION DE DEPUACION
// ============================================
// Función para depurar y mostrar información de las coordenadas
function depurarCoordenadas(registros, genName) {
    console.log(`=== DEPURACIÓN DE COORDENADAS PARA ${genName} ===`);
    
    if (!registros || registros.length === 0) {
        console.log("No hay registros para depurar");
        return;
    }
    
    // Extraer todas las coordenadas
    const coordenadas = [];
    registros.forEach(reg => {
        if (reg.cord && reg.cord.includes(',')) {
            const [fila, col] = reg.cord.split(',').map(Number);
            if (!isNaN(fila) && !isNaN(col)) {
                coordenadas.push({ fila, col, valor: reg.valor, color: reg.color });
            }
        }
    });
    
    if (coordenadas.length === 0) {
        console.log("No se encontraron coordenadas válidas en los registros");
        console.log("Primeros 3 registros:", registros.slice(0, 3));
        return;
    }
    
    // Encontrar mínimos y máximos
    const minFila = Math.min(...coordenadas.map(c => c.fila));
    const maxFila = Math.max(...coordenadas.map(c => c.fila));
    const minCol = Math.min(...coordenadas.map(c => c.col));
    const maxCol = Math.max(...coordenadas.map(c => c.col));
    
    console.log(`Rango de filas: ${minFila} a ${maxFila} (${maxFila - minFila + 1} filas)`);
    console.log(`Rango de columnas: ${minCol} a ${maxCol} (${maxCol - minCol + 1} columnas)`);
    console.log(`Total de coordenadas únicas: ${coordenadas.length}`);
    
    // Mostrar algunas coordenadas de ejemplo
    console.log("Ejemplo de coordenadas (primeras 10):");
    coordenadas.slice(0, 10).forEach(coord => {
        console.log(`  (${coord.fila}, ${coord.col}) -> valor: "${coord.valor}", color: ${coord.color}`);
    });
    
    // Verificar si hay coordenadas fuera de rango esperado
    const coordenadasNegativas = coordenadas.filter(c => c.fila < 0 || c.col < 0);
    if (coordenadasNegativas.length > 0) {
        console.warn(`⚠️ Se encontraron ${coordenadasNegativas.length} coordenadas con valores negativos`);
    }
    
    return { minFila, maxFila, minCol, maxCol, totalCoordenadas: coordenadas.length };
}

// ============================================
// 4. MOSTRAR MENSAJE EN EL CONTENEDOR
// ============================================
function mostrarMensaje(mensaje, tipo = "info") {
    const container = document.getElementById("excel-container");
    if (!container) return;
    
    let bgColor = "#f8f9fa";
    let icon = "fa-info-circle";
    let color = "#004085";
    
    if (tipo === "warning") {
        bgColor = "#fff3cd";
        icon = "fa-exclamation-triangle";
        color = "#856404";
    } else if (tipo === "error") {
        bgColor = "#f8d7da";
        icon = "fa-exclamation-circle";
        color = "#721c24";
    }
    
    container.innerHTML = `
        <div style="padding: 50px; text-align: center; background: ${bgColor};">
            <i class="fas ${icon} fa-3x mb-3" style="color: ${color};"></i>
            <p style="color: ${color};">${mensaje}</p>
        </div>
    `;
    
    const statsSpan = document.getElementById("info-stats");
    if (statsSpan) {
        statsSpan.innerHTML = "Sin datos";
    }
}

// ============================================
// 5. CARGAR DATOS POR GEN
// ============================================
async function cargarDatosPorGen(genId, genNombre) {
    if (!genId) {
        mostrarMensaje("Please select a gene", "warning");
        return;
    }
    
    if (load) load.hidden = false;
    currentGen = genId;
    localStorage.setItem("lastSelectedGenId", genId);
    
    const infoGen = document.getElementById("infoGenActual");
    if (infoGen) {
        infoGen.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> Current Gene: <strong>${genNombre}</strong> - Cargando datos...`;
        infoGen.style.background = "#e3f2fd";
    }
    
    try {
        // Obtener TODOS los registros del endpoint
        const registros = await obtenerTodosLosRegistros(genId);
        
        if (!registros || registros.length === 0) {
            mostrarMensaje(`No hay datos para el gen ${genNombre}`, "warning");
            if (load) load.hidden = true;
            if (infoGen) {
                infoGen.innerHTML = `<i class="fas fa-info-circle"></i> Current Gene: <strong>${genNombre}</strong> - No data`;
                infoGen.style.background = "#fff3cd";
            }
            return;
        }
        
        console.log(`Procesando ${registros.length} registros para ${genNombre} (ID: ${genId})...`);
        
        // Procesar y renderizar
        const resultado = procesarDatos(registros);
        renderizarTablaExcel(resultado);
        
        if (infoGen) {
            infoGen.innerHTML = `<i class="fas fa-check-circle"></i> Current Gene: <strong>${genNombre}</strong>`;
            infoGen.style.background = "#d4edda";
        }
              
        if (load) load.hidden = true;
        
    } catch (error) {
        if (load) load.hidden = true;
        console.error("Error cargando datos:", error);
        
        let mensajeError = `Error al cargar datos del gen ${genNombre}: ${error.message}`;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "error",
                title: "Error al cargar datos",
                text: mensajeError,
                confirmButtonText: "Aceptar"
            });
        }
        
        mostrarMensaje(mensajeError, "error");
        
        if (infoGen) {
            infoGen.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${genNombre}`;
            infoGen.style.background = "#f8d7da";
        }
    }
}

// ============================================
// 6. INICIALIZAR
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("Initializing SOM table...");
    
    // Cargar lista de genes desde el nuevo endpoint
    cargarListaGenes();
    
    // Evento del botón cargar
    const btnCargar = document.getElementById("btnCargar");
    if (btnCargar) {
        btnCargar.addEventListener("click", function() {
            const selectGene = document.getElementById("selectGene");
            const genId = selectGene.value;
            const genNombre = selectGene.options[selectGene.selectedIndex].text;
            if (genId) {
                cargarDatosPorGen(genId, genNombre);
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: "warning",
                        title: "Select a gene",
                        text: "Please select a gene from the list to load the data.",
                        confirmButtonText: "OK"
                    });
                } else {
                    alert("Please select a gene from the list to load the data.");
                }
            }
        });
    }
    
    // Evento de cambio en select (carga automática)
    //const selectGene = document.getElementById("selectGene");
    //if (selectGene) {
    //    selectGene.addEventListener("change", function() {
    //        if (this.value) {
    //            cargarDatosPorGen(this.value);
    //        }
    //    });
    //}
});