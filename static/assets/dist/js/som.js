// ============================================
// VARIABLES GLOBALES
// ============================================
const load = document.getElementById("load");
let currentGen = null;
const REQUEST_TIMEOUT_MS = 120000;
const DEFAULT_COLOR = "255,255,255";
const DEBUG = false;
const RENDER_ROWS_PER_FRAME = 30;

// ============================================
// CONFIGURACIÓN DE TAMAÑOS (VARIABLES GLOBALES)
// ============================================
const CELL_CONFIG = {
    FONT_SIZE: '5px',
    HEADER_FONT_SIZE: '8px',
    ALLELE_FONT_SIZE: '8px',
    CORNER_FONT_SIZE: '8px',
    CELL_PADDING_VERTICAL: '1px',
    CELL_PADDING_HORIZONTAL: '1px',
    MIN_CELL_WIDTH: '18px',
    MAX_CELL_WIDTH: '30px',
    MIN_HEADER_WIDTH: '15px',
    MAX_HEADER_WIDTH: '35px',
    MIN_FIRST_COL_WIDTH: '50px',
    MAX_FIRST_COL_WIDTH: '80px',
    HEADER_HEIGHT: '90px',
    CELL_HEIGHT: '18px',
    VERTICAL_TEXT_MAX_WIDTH: '70px',
};

// ============================================
// CONFIGURACIÓN DE MOMENTOS (GLOBAL)
// ============================================
const MOMENTOS = [
    {
        id: 1,
        nombre: "Moment 1",
        combinaciones: [
            { order_one: 1, order_two: 3, order_three: 1 },
            { order_one: 1, order_two: 4, order_three: 1 }
        ],
        color: '50,100,255',
        descripcion: "Early activation (blue)"
    },
    {
        id: 2,
        nombre: "Moment 2",
        combinaciones: [
            { order_one: 1, order_two: 5, order_three: 2 }
        ],
        color: '50,100,255',
        descripcion: "Middle activation (blue)"
    },
    {
        id: 3,
        nombre: "Moment 3",
        combinaciones: [
            { order_one: 1, order_two: 6, order_three: 3 },
            { order_one: 1, order_two: 7, order_three: 3 },
            { order_one: 1, order_two: 8, order_three: 3 },
            { order_one: 1, order_two: 9, order_three: 3 }
        ],
        color: '50,100,255',
        descripcion: "Late activation (blue)"
    },
    {
        id: 4,
        nombre: "Moment 4",
        combinaciones: [
            { order_one: 1, order_two: 10, order_three: 4 },
            { order_one: 1, order_two: 11, order_three: 4 }
        ],
        color: '50,100,255',
        descripcion: "Maximum peak (blue)"
    },
    {
        id: 5,
        nombre: "Moment 5",
        combinaciones: [
            { order_one: 1, order_two: 12, order_three: 5 },
            { order_one: 1, order_two: 13, order_three: 5 },
            { order_one: 1, order_two: 14, order_three: 5 }
        ],
        color: '50,100,255',
        descripcion: "Plateau (blue)"
    },
    {
        id: 6,
        nombre: "Moment 7",
        combinaciones: [
            { order_one: 1, order_two: 3, order_three: 1 },
            { order_one: 1, order_two: 4, order_three: 1 },
            { order_one: 1, order_two: 5, order_three: 2 },
            { order_one: 1, order_two: 6, order_three: 3 },
            { order_one: 1, order_two: 7, order_three: 3 },
            { order_one: 1, order_two: 8, order_three: 3 },
            { order_one: 1, order_two: 9, order_three: 3 },
            { order_one: 1, order_two: 10, order_three: 4 },
            { order_one: 1, order_two: 11, order_three: 4 },
            { order_one: 1, order_two: 12, order_three: 5 },
            { order_one: 1, order_two: 13, order_three: 5 },
            { order_one: 1, order_two: 14, order_three: 5 }
        ],
        color: '255,0,0',
        descripcion: "Decline (red)"
    },
    {
        id: 7,
        nombre: "Moment 8",
        combinaciones: [
            { order_one: 1, order_two: 3, order_three: 1 },
            { order_one: 1, order_two: 4, order_three: 1 },
            { order_one: 1, order_two: 5, order_three: 2 },
            { order_one: 1, order_two: 6, order_three: 3 },
            { order_one: 1, order_two: 7, order_three: 3 },
            { order_one: 1, order_two: 8, order_three: 3 },
            { order_one: 1, order_two: 9, order_three: 3 },
            { order_one: 1, order_two: 10, order_three: 4 },
            { order_one: 1, order_two: 11, order_three: 4 },
            { order_one: 1, order_two: 12, order_three: 5 },
            { order_one: 1, order_two: 13, order_three: 5 },
            { order_one: 1, order_two: 14, order_three: 5 }
        ],
        color: '255,255,0',
        descripcion: "Recovery (yellow)"
    },
    {
        id: 8,
        nombre: "Moment 9",
        combinaciones: [
            { order_one: 1, order_two: 3, order_three: 1 },
            { order_one: 1, order_two: 4, order_three: 1 },
            { order_one: 1, order_two: 5, order_three: 2 },
            { order_one: 1, order_two: 6, order_three: 3 },
            { order_one: 1, order_two: 7, order_three: 3 },
            { order_one: 1, order_two: 8, order_three: 3 },
            { order_one: 1, order_two: 9, order_three: 3 },
            { order_one: 1, order_two: 10, order_three: 4 },
            { order_one: 1, order_two: 11, order_three: 4 },
            { order_one: 1, order_two: 12, order_three: 5 },
            { order_one: 1, order_two: 13, order_three: 5 },
            { order_one: 1, order_two: 14, order_three: 5 }
        ],
        color: '255,0,255',
        descripcion: "Stabilization (magenta)"
    },
    {
        id: 9,
        nombre: "Moment 10",
        combinaciones: [
            { order_one: 1, order_two: 3, order_three: 1 },
            { order_one: 1, order_two: 4, order_three: 1 },
            { order_one: 1, order_two: 5, order_three: 2 },
            { order_one: 1, order_two: 6, order_three: 3 },
            { order_one: 1, order_two: 7, order_three: 3 },
            { order_one: 1, order_two: 8, order_three: 3 },
            { order_one: 1, order_two: 9, order_three: 3 },
            { order_one: 1, order_two: 10, order_three: 4 },
            { order_one: 1, order_two: 11, order_three: 4 },
            { order_one: 1, order_two: 12, order_three: 5 },
            { order_one: 1, order_two: 13, order_three: 5 },
            { order_one: 1, order_two: 14, order_three: 5 }
        ],
        color: '0,180,0',
        descripcion: "Reinforcement  (green)"
    }    
];

// ============================================
// VARIABLES DE CONTROL DE MOMENTOS
// ============================================
let momentoActual = 0;
let datosOriginales = null;
let intervaloReproduccion = null;
let reproduciendo = false;
let celdasAcumuladas = new Map(); // NUEVO: Para acumulación de celdas

// Cache de estilos por color
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
    
    const statsSpan = document.getElementById("info-stats");
    if (statsSpan) {
        statsSpan.innerHTML = `Loading data for ${genName}...`;
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
// 1. CARGAR LISTA DE GENES
// ============================================
async function cargarListaGenes() {
    try {
        if (load) load.hidden = false;
        
        if (DEBUG) console.log("🔍 Haciendo petición a: /genes_to_excel/caracteristica-gen/get-related-genes/");
        
        const response = await axios.get("/genes_to_excel/caracteristica-gen/get-related-genes/", {
            timeout: REQUEST_TIMEOUT_MS
        });
        
        const genesData = response.data;
        let genesList = [];
        
        if (Array.isArray(genesData)) {
            genesList = genesData
                .map((gene) => ({ id: gene.id, name: gene.name }))
                .filter((gene) => gene.id && gene.name);
        } else if (genesData.results && Array.isArray(genesData.results)) {
            genesList = genesData.results
                .map((gene) => ({ id: gene.id, name: gene.name }))
                .filter((gene) => gene.id && gene.name);
        } else {
            console.error("❌ Formato inesperado:", genesData);
            throw new Error("Formato de datos de genes inválido");
        }
        
        const selectGene = document.getElementById("selectGene");
        if (!selectGene) {
            console.error("❌ selectGene element not found");
            return;
        }
        
        if (genesList.length === 0) {
            selectGene.innerHTML = '<option value="">No genes available</option>';
            if (load) load.hidden = true;
            return;
        }
        
        selectGene.innerHTML = '<option value="">Select a gene</option>';
        
        const optionFragment = document.createDocumentFragment();
        genesList.forEach(gene => {
            const option = document.createElement("option");
            option.value = gene.id;
            option.textContent = gene.name;
            optionFragment.appendChild(option);
        });
        selectGene.appendChild(optionFragment);
        
        const lastGenId = localStorage.getItem("lastSelectedGenId");
        if (lastGenId && genesList.some(g => g.id === lastGenId)) {
            selectGene.value = lastGenId;
        }
        
        if (load) load.hidden = true;
        
        if (DEBUG) console.log(`✅ Genes cargados exitosamente: ${genesList.length} genes encontrados`);
        
    } catch (error) {
        console.error("❌ Error loading gene list:", error);
        
        const selectGene = document.getElementById("selectGene");
        if (selectGene) {
            selectGene.innerHTML = '<option value="">Error loading genes</option>';
        }
        
        let errorMsg = `Could not load gene list: ${error.message}`;
        
        if (error.response) {
            errorMsg += `\nStatus: ${error.response.status}`;
            errorMsg += `\nData: ${JSON.stringify(error.response.data)}`;
        }
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "error",
                title: "Error loading genes",
                text: errorMsg,
                confirmButtonText: "Accept"
            });
        }
        
        if (load) load.hidden = true;
    }
}

// ============================================
// 2. PROCESAR DATOS
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
            maxCol: 0,
            seccionVariable: [],
            seccionFija: [],
            filasVariable: [],
            filasFija: []
        };
    }
    
    let minFila = Infinity;
    let maxFila = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    
    const celdasMap = new Map();
    const order1Map = new Map();
    const order2Map = new Map();
    const order3Map = new Map();
    const ncbiLinkMap = new Map();
    
    for (let i = 0; i < registros.length; i++) {
        const reg = registros[i];
        const cord = reg.cord;
        const valor = reg.valor || "";
        const color = reg.color || DEFAULT_COLOR;
        const order1 = String(reg.order_one || "").trim();
        const order2 = String(reg.order_two || "").trim();
        const order3 = String(reg.order_three || "").trim();
        const ncbiLink = reg.ncbi_link || "";
        
        if (cord && cord.includes(',')) {
            const [fila, columna] = cord.split(',').map(Number);
            
            if (!isNaN(fila) && !isNaN(columna)) {
                minFila = Math.min(minFila, fila);
                maxFila = Math.max(maxFila, fila);
                minCol = Math.min(minCol, columna);
                maxCol = Math.max(maxCol, columna);
                
                if (!order1Map.has(fila)) {
                    order1Map.set(fila, order1);
                }
                if (!order2Map.has(fila) && order2 !== "") {
                    order2Map.set(fila, order2);
                }
                if (!order3Map.has(fila) && order3 !== "") {
                    order3Map.set(fila, order3);
                }
                if (!ncbiLinkMap.has(fila) && ncbiLink !== "") {
                    ncbiLinkMap.set(fila, ncbiLink);
                }
                
                const key = `${fila},${columna}`;
                if (valor && valor.trim() !== "") {
                    celdasMap.set(key, {
                        valor: valor,
                        color: color,
                        order1: order1,
                        order2: order2,
                        order3: order3,
                        ncbi_link: ncbiLink
                    });
                }
            }
        }
    }
    
    if (minFila === Infinity) {
        console.error("No se encontraron coordenadas válidas");
        return {
            matriz: [],
            filas: [],
            columnas: [],
            minFila: 0,
            maxFila: 0,
            minCol: 0,
            maxCol: 0,
            seccionVariable: [],
            seccionFija: [],
            filasVariable: [],
            filasFija: []
        };
    }
    
    const filas = [];
    for (let i = minFila; i <= maxFila; i++) {
        filas.push(i);
    }
    
    const columnas = [];
    for (let j = minCol; j <= maxCol; j++) {
        columnas.push(j);
    }
    
    const filasVariable = [];
    const filasFija = [];
    let hasOrder1 = false;
    
    for (let i = 0; i < filas.length; i++) {
        const filaNum = filas[i];
        const order1 = String(order1Map.get(filaNum) || "").trim();
        if (order1 !== "") hasOrder1 = true;
        if (order1 === "1") {
            filasVariable.push(filaNum);
        } else if (order1 === "2") {
            filasFija.push(filaNum);
        } else {
            filasVariable.push(filaNum);
        }
    }
    
    function crearCelda(filaNum, colNum, celda) {
        if (celda) {
            return {
                valor: celda.valor,
                color: celda.color,
                fila: filaNum,
                columna: colNum,
                order1: celda.order1 || order1Map.get(filaNum) || "",
                order2: celda.order2 || order2Map.get(filaNum) || "",
                order3: celda.order3 || order3Map.get(filaNum) || "",
                ncbi_link: celda.ncbi_link || ncbiLinkMap.get(filaNum) || ""
            };
        } else {
            return {
                valor: "",
                color: "255,255,255",
                fila: filaNum,
                columna: colNum,
                order1: order1Map.get(filaNum) || "",
                order2: order2Map.get(filaNum) || "",
                order3: order3Map.get(filaNum) || "",
                ncbi_link: ncbiLinkMap.get(filaNum) || ""
            };
        }
    }
    
    const matriz = [];
    for (let i = 0; i < filas.length; i++) {
        const filaNum = filas[i];
        const filaData = [];
        for (let j = 0; j < columnas.length; j++) {
            const colNum = columnas[j];
            const key = `${filaNum},${colNum}`;
            const celda = celdasMap.get(key);
            filaData.push(crearCelda(filaNum, colNum, celda));
        }
        matriz.push(filaData);
    }
    
    const seccionVariable = [];
    for (let i = 0; i < filas.length; i++) {
        const filaNum = filas[i];
        const order1 = String(order1Map.get(filaNum) || "").trim();
        if (order1 === "1" || order1 === "") {
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
                        columna: colNum,
                        order1: order1 || "1",
                        order2: celda.order2 || order2Map.get(filaNum) || "",
                        order3: celda.order3 || order3Map.get(filaNum) || "",
                        ncbi_link: celda.ncbi_link || ncbiLinkMap.get(filaNum) || ""
                    });
                } else {
                    filaData.push({
                        valor: "",
                        color: "255,255,255",
                        fila: filaNum,
                        columna: colNum,
                        order1: order1 || "1",
                        order2: order2Map.get(filaNum) || "",
                        order3: order3Map.get(filaNum) || "",
                        ncbi_link: ncbiLinkMap.get(filaNum) || ""
                    });
                }
            }
            seccionVariable.push(filaData);
        }
    }
    
    const seccionFija = [];
    for (let i = 0; i < filas.length; i++) {
        const filaNum = filas[i];
        const order1 = String(order1Map.get(filaNum) || "").trim();
        if (order1 === "2") {
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
                        columna: colNum,
                        order1: "2",
                        order2: celda.order2 || order2Map.get(filaNum) || "",
                        order3: celda.order3 || order3Map.get(filaNum) || "",
                        ncbi_link: celda.ncbi_link || ncbiLinkMap.get(filaNum) || ""
                    });
                } else {
                    filaData.push({
                        valor: "",
                        color: "255,255,255",
                        fila: filaNum,
                        columna: colNum,
                        order1: "2",
                        order2: order2Map.get(filaNum) || "",
                        order3: order3Map.get(filaNum) || "",
                        ncbi_link: ncbiLinkMap.get(filaNum) || ""
                    });
                }
            }
            seccionFija.push(filaData);
        }
    }
    
    const celdasConValor = celdasMap.size;
    
    return {
        matriz: matriz,
        filas: filas,
        columnas: columnas,
        minFila: minFila,
        maxFila: maxFila,
        minCol: minCol,
        maxCol: maxCol,
        totalCeldas: matriz.length * columnas.length,
        celdasConDatos: celdasMap.size,
        seccionVariable: seccionVariable,
        seccionFija: seccionFija,
        filasVariable: filasVariable,
        filasFija: filasFija,
        order1Map: order1Map,
        order2Map: order2Map,
        order3Map: order3Map,
        ncbiLinkMap: ncbiLinkMap
    };
}

// ============================================
// FUNCIÓN PARA SANITIZAR HTML
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
// FUNCIÓN PARA OBTENER Y MOSTRAR DETALLES DE LA CELDA
// ============================================
async function mostrarDetalleCelda(alelo, columna, filaNum, colNum, valorActual) {
    if (!filaNum || !colNum) {
        console.warn("Intento de click en celda sin coordenadas válidas");
        return;
    }
    
    if (!valorActual || valorActual.trim() === "") {
        console.warn("Intento de click en celda vacía");
        return;
    }
    
    if (isNaN(filaNum) || isNaN(colNum) || filaNum < 0 || colNum < 0) {
        console.error("Coordenadas inválidas:", { filaNum, colNum });
        return;
    }

    if (colNum === 0) {
        console.log("🚫 Primera columna (índice) - Sin acción", { filaNum, colNum });
        return;
    }
    
    const PRIMERA_FILA_HEADER = 0;
    if (filaNum === PRIMERA_FILA_HEADER) {
        console.log("🚫 Primera fila (header) - Sin acción", { filaNum, colNum });
        return;
    }
    
    const SEGUNDA_COLUMNA_METADATA = 1;
    if (colNum === SEGUNDA_COLUMNA_METADATA) {
        console.log("🚫 Segunda columna (metadata) - Sin acción", { filaNum, colNum });
        return;
    }
    
    const SEGUNDA_FILA_METADATA = 1;
    if (filaNum === SEGUNDA_FILA_METADATA) {
        console.log("🚫 Segunda fila (metadata) - Sin acción", { filaNum, colNum });
        return;
    }

    if (!currentGen) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: 'No gene selected',
                confirmButtonText: 'Accept'
            });
        }
        return;
    }
    
    const filaValida = Number.isInteger(filaNum) && filaNum >= 0;
    const colValida = Number.isInteger(colNum) && colNum >= 0;
    
    if (!filaValida || !colValida) {
        console.error('Coordenadas inválidas:', filaNum, colNum);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Invalid coordinates: (${filaNum}, ${colNum})`,
                confirmButtonText: 'Accept'
            });
        }
        return;
    }
    
    let swalInstance = null;
    
    try {
        if (typeof Swal !== 'undefined') {
            swalInstance = Swal.fire({
                title: 'Loading information...',
                html: '<i class="fas fa-spinner fa-pulse"></i> Fetching coordinate data...',
                allowOutsideClick: true,
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
        
        const params = new URLSearchParams({
            cord: `${filaNum},${colNum}`,
            gen_id: currentGen,
        });
        const url = `/genes_to_excel/caracteristica-gen/?${params.toString()}`;
        
        console.log(`🔍 Consultando detalles en: ${url}`);
        
        const response = await axios.get(url, {
            timeout: REQUEST_TIMEOUT_MS
        });
        
        const data = response.data;
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No details found for this cell');
        }
        
        const detalle = data.results[0];
        
        const gen = sanitizarHTML(detalle.name);
        const valor = sanitizarHTML(detalle.valor);
        const colorValido = validarColorRGB(detalle.color);
        const protein = sanitizarHTML(detalle.protein);
        const species = sanitizarHTML(detalle.species);
        const variant = sanitizarHTML(detalle.variant);
        const ncbi_link = sanitizarHTML(detalle.ncbi_link);
        
        let alelosAsociados = [];
        if (detalle.alleleasoc) {
            alelosAsociados = detalle.alleleasoc.split(',')
                .map(al => sanitizarHTML(al.trim()))
                .filter(al => al && al !== '');
        }
        
        const rgbParts = colorValido.split(',').map(Number);
        const luminancia = (rgbParts[0] * 0.299 + rgbParts[1] * 0.587 + rgbParts[2] * 0.114);
        const textoColor = luminancia > 128 ? '#000000' : '#ffffff';
        
        const contenidoHTML = `
            <div style="text-align: left; font-family: monospace; max-height: 70vh; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; width: 40%; background: #f5f5f5;">Gene:</td>
                        <td style="padding: 8px;">${gen}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Value:</td>
                        <td style="padding: 8px;">
                            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: rgb(${colorValido}); color: ${textoColor}; font-weight: bold;">
                                ${valor || 'N/A'}
                            </span>
                        </td>
                    </tr>                    
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Protein:</td>
                        <td style="padding: 8px;">${protein}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Associated Alleles:</td>
                        <td style="padding: 8px;">
                            ${alelosAsociados.length > 0 ? 
                                `<div style="max-height: 150px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${alelosAsociados.map(al => `<span style="background: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block;">${al}</span>`).join('')}
                                </div>` : 
                                '<span style="color: #999;">None</span>'
                            }
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Species:</td>
                        <td style="padding: 8px;">${species}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Variant:</td>
                        <td style="padding: 8px;">${variant}</td>
                    </tr>
                    ${ncbi_link !== 'N/A' ? `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">NCBI_Link:</td>
                        <td style="padding: 8px;">
                            <a href="${ncbi_link}" target="_blank">${ncbi_link}</a>
                        </td>
                    </tr>
                    ` : ''}
                </table>
            </div>
        `;
        
        if (swalInstance) {
            swalInstance.close();
        }
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                title: `📊 Information - ${gen}`,
                html: contenidoHTML,
                icon: 'info',
                width: '650px',
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
                showCloseButton: true,
                customClass: {
                    popup: 'detalle-celda-modal'
                }
            });
        }
        
    } catch (error) {
        console.error("Error obteniendo detalles de la celda:", error);
        
        if (swalInstance) {
            swalInstance.close();
        }
        
        let mensajeError = '';
        let tituloError = 'Error loading details';
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            mensajeError = 'The request timed out. Please try again.';
        } else if (error.response) {
            if (error.response.status === 404) {
                mensajeError = `No information found for coordinate (${filaNum}, ${colNum}) in gene ${currentGen}`;
                tituloError = 'Information not available';
            } else if (error.response.status === 500) {
                mensajeError = 'Internal server error. Please try again later.';
            } else {
                mensajeError = `Error ${error.response.status}: ${error.response.statusText || error.message}`;
            }
        } else if (error.request) {
            mensajeError = 'No response from server. Please check your connection.';
        } else {
            mensajeError = error.message || 'Unknown error loading details';
        }
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: error.response?.status === 404 ? 'info' : 'error',
                title: tituloError,
                text: mensajeError,
                confirmButtonText: 'Accept'
            });
        }
    }
}

// ============================================
// Convertir número a letras estilo Excel
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
function calcularDimensionesTextoRotado(texto, fontSize) {
    if (!texto || texto === "") {
        return { width: 20, height: 20 };
    }
    
    const fontSizeNum = parseInt(fontSize) || 7;
    const charWidth = fontSizeNum * 0.6;
    const textLength = texto.length;
    const textWidth = textLength * charWidth;
    const textHeight = fontSizeNum * 1.2;
    const padding = 2;
    
    return {
        width: Math.ceil(textHeight + padding * 2),
        height: Math.ceil(textWidth + padding * 2),
        minWidth: Math.max(20, Math.ceil(textHeight + padding * 2)),
        minHeight: Math.max(20, Math.ceil(textWidth + padding * 2))
    };
}

function renderizarTablaExcel(data) {
    const container = document.getElementById("excel-container");
    if (!container) return;
    
    const { matriz, columnas, seccionVariable, seccionFija } = data;
    
    if (!matriz || matriz.length === 0 || columnas.length === 0) {
        mostrarMensaje("No data found to display", "warning");
        return;
    }
    
    const proteinNames = [];
    if (matriz.length > 0 && matriz[0]) {
        for (let idxCol = 1; idxCol < matriz[0].length; idxCol++) {
            const celdaProteina = matriz[0][idxCol];
            proteinNames.push(celdaProteina.valor || "");
        }
    }
    
    const alleleNames = [];
    if (matriz.length > 0) {
        for (let idxRow = 1; idxRow < matriz.length; idxRow++) {
            if (matriz[idxRow] && matriz[idxRow][0]) {
                const celdaAlelo = matriz[idxRow][0];
                alleleNames.push((celdaAlelo.valor && celdaAlelo.valor.trim() !== "") ? celdaAlelo.valor : "");
            } else {
                alleleNames.push("");
            }
        }
    }
    
    let seccionVariableFiltrada = [];
    let seccionFijaFiltrada = [];
    let fila1Eliminada = false;
    
    for (let i = 0; i < seccionVariable.length; i++) {
        const filaData = seccionVariable[i];
        if (filaData && filaData[0]) {
            const filaNum = filaData[0].fila;
            if (filaNum !== 1) {
                seccionVariableFiltrada.push(filaData);
            } else {
                fila1Eliminada = true;
            }
        }
    }
    
    for (let i = 0; i < seccionFija.length; i++) {
        const filaData = seccionFija[i];
        if (filaData && filaData[0]) {
            const filaNum = filaData[0].fila;
            if (filaNum !== 1) {
                seccionFijaFiltrada.push(filaData);
            }
        }
    }
    
    if (fila1Eliminada && seccionVariableFiltrada.length > 0) {
        const filaBlanco = [];
        const numColumnas = seccionVariableFiltrada[0] ? seccionVariableFiltrada[0].length : 0;
        
        for (let j = 0; j < numColumnas; j++) {
            filaBlanco.push({
                valor: "",
                color: "255,255,255",
                fila: 1,
                columna: j,
                order1: "1"
            });
        }
        seccionVariableFiltrada.unshift(filaBlanco);
    }
    
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6c757d;"><i class="fas fa-spinner fa-pulse fa-2x"></i><br><br>Rendering table...</div>';
    
    setTimeout(() => {
        const table = document.createElement("table");
        table.className = "excel-table";
        table.style.fontSize = CELL_CONFIG.FONT_SIZE;
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        
        const thCorner = document.createElement("th");
        thCorner.textContent = "A\\P";
        thCorner.style.minWidth = "35px";
        thCorner.style.maxWidth = "50px";
        thCorner.style.width = "auto";
        thCorner.style.position = "sticky";
        thCorner.style.left = "0";
        thCorner.style.backgroundColor = "#f3f3f3";
        thCorner.style.zIndex = "20";
        thCorner.style.fontSize = CELL_CONFIG.CORNER_FONT_SIZE || '7px';
        thCorner.style.padding = "2px 4px";
        thCorner.style.border = "1px solid #d4d4d4";
        thCorner.style.fontWeight = "bold";
        thCorner.style.textAlign = "center";
        thCorner.style.height = "auto";
        thCorner.style.verticalAlign = "middle";
        headerRow.appendChild(thCorner);
        
        const headerFontSize = CELL_CONFIG.HEADER_FONT_SIZE || '7px';
        
        proteinNames.forEach((proteinName) => {
            const th = document.createElement("th");
            const dims = calcularDimensionesTextoRotado(proteinName, headerFontSize);
            const cellWidth = dims.width;
            const cellHeight = dims.height;
            
            th.style.minWidth = cellWidth + "px";
            th.style.maxWidth = cellWidth + "px";
            th.style.width = cellWidth + "px";
            th.style.minHeight = cellHeight + "px";
            th.style.height = cellHeight + "px";
            th.style.backgroundColor = "#f3f3f3";
            th.style.position = "sticky";
            th.style.top = "0";
            th.style.zIndex = "10";
            th.style.fontSize = headerFontSize;
            th.style.padding = "0px";
            th.style.border = "1px solid #d4d4d4";
            th.style.textAlign = "center";
            th.style.verticalAlign = "middle";
            th.style.overflow = "hidden";
            th.style.whiteSpace = "nowrap";
            
            const div = document.createElement("div");
            div.textContent = proteinName || "";
            div.className = "vertical-text";
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.style.width = "100%";
            div.style.height = "100%";
            div.style.transform = "rotate(-90deg)";
            div.style.whiteSpace = "nowrap";
            div.style.fontWeight = "bold";
            div.style.fontSize = headerFontSize;
            div.style.padding = "0px";
            div.style.margin = "0px";
            div.style.lineHeight = "1.1";
            div.style.maxWidth = "none";
            div.style.overflow = "visible";
            div.style.textOverflow = "clip";
            div.style.color = "#000000";
            div.style.letterSpacing = "0px";
            
            const textSpan = document.createElement("span");
            textSpan.textContent = proteinName || "";
            textSpan.style.display = "inline-block";
            div.appendChild(textSpan);
            
            if (proteinName && proteinName.length > 6) {
                div.title = proteinName;
            }
            
            th.appendChild(div);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        
        container.innerHTML = "";
        container.appendChild(table);
        
        tbody.addEventListener("click", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td) return;
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
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
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
            td.style.transform = "scale(1.02)";
            td.style.transition = "all 0.2s ease";
            td.style.outline = "1px solid #0078d4";
            td.style.zIndex = "20";
            td.style.position = "relative";
        });
        
        tbody.addEventListener("mouseout", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td || td.contains(event.relatedTarget)) return;
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
            td.style.transform = "scale(1)";
            td.style.outline = "none";
            td.style.zIndex = "auto";
        });
        
        let idxFilaVariable = 0;
        const totalFilasVariable = seccionVariableFiltrada.length;
        let idxFilaFija = 0;
        const totalFilasFija = seccionFijaFiltrada.length;
        let seccionActual = 'variable';
        let filasRenderizadas = 0;
        const totalFilasTotales = totalFilasVariable + totalFilasFija;
        
        if (totalFilasTotales === 0) {
            mostrarMensaje("No data rows found", "warning");
            return;
        }
        
        const renderChunk = () => {
            const bodyFragment = document.createDocumentFragment();
            let filasEnEsteChunk = 0;
            
            if (seccionActual === 'variable' && idxFilaVariable < totalFilasVariable) {
                const end = Math.min(idxFilaVariable + RENDER_ROWS_PER_FRAME, totalFilasVariable);
                
                for (; idxFilaVariable < end; idxFilaVariable++) {
                    const filaData = seccionVariableFiltrada[idxFilaVariable];
                    if (!filaData) continue;
                    
                    const filaReal = filaData[0]?.fila || 0;
                    let idxAlelo;
                    if (filaReal === 1) {
                        idxAlelo = -1;
                    } else {
                        idxAlelo = filaReal - 2;
                    }
                    
                    const tr = crearFilaHTML(filaData, filaReal, alleleNames, idxAlelo, 'variable');
                    bodyFragment.appendChild(tr);
                    filasRenderizadas++;
                    filasEnEsteChunk++;
                }
                
                if (idxFilaVariable >= totalFilasVariable && totalFilasFija > 0) {
                    seccionActual = 'fija';
                }
            }
            
            if (seccionActual === 'fija' && idxFilaFija < totalFilasFija) {
                const end = Math.min(idxFilaFija + RENDER_ROWS_PER_FRAME, totalFilasFija);
                
                for (; idxFilaFija < end; idxFilaFija++) {
                    const filaData = seccionFijaFiltrada[idxFilaFija];
                    if (!filaData) continue;
                    
                    const filaReal = filaData[0]?.fila || 0;
                    let idxAlelo;
                    if (filaReal === 1) {
                        idxAlelo = -1;
                    } else {
                        idxAlelo = filaReal - 2;
                    }
                    
                    const tr = crearFilaHTML(filaData, filaReal, alleleNames, idxAlelo, 'fija');
                    bodyFragment.appendChild(tr);
                    filasRenderizadas++;
                    filasEnEsteChunk++;
                }
            }
            
            tbody.appendChild(bodyFragment);
            
            if (idxFilaVariable < totalFilasVariable || idxFilaFija < totalFilasFija) {
                requestAnimationFrame(renderChunk);
                return;
            }
            
            const statsSpan = document.getElementById("info-stats");
            if (statsSpan) {
                const totalDataRows = totalFilasVariable + totalFilasFija;
                statsSpan.innerHTML = `${totalDataRows} rows × ${proteinNames.length} columns | ` +
                                     `${data.celdasConDatos} cells with data | ` +
                                     `Variable: ${totalFilasVariable}, Fija: ${totalFilasFija}`;
            }
        };
        
        function crearFilaHTML(filaData, filaReal, alleleNames, idxAlelo, seccion) {
            const tr = document.createElement("tr");
            tr.classList.add(`seccion-${seccion}`);
            
            let nombreAlelo = "";
            if (filaReal === 1 || idxAlelo < 0) {
                nombreAlelo = "";
            } else if (idxAlelo >= 0 && idxAlelo < alleleNames.length) {
                nombreAlelo = alleleNames[idxAlelo];
            }
            
            const tdAlelo = document.createElement("td");
            tdAlelo.textContent = nombreAlelo;
            tdAlelo.style.fontWeight = "bold";
            tdAlelo.style.backgroundColor = seccion === 'variable' ? "#f0f7ff" : "#f8f0ff";
            tdAlelo.style.position = "sticky";
            tdAlelo.style.left = "0";
            tdAlelo.style.minWidth = CELL_CONFIG.MIN_FIRST_COL_WIDTH;
            tdAlelo.style.maxWidth = CELL_CONFIG.MAX_FIRST_COL_WIDTH;
            tdAlelo.style.textAlign = "left";
            tdAlelo.style.zIndex = "5";
            tdAlelo.style.fontSize = CELL_CONFIG.ALLELE_FONT_SIZE;
            tdAlelo.style.padding = "2px 4px";
            tdAlelo.style.whiteSpace = "nowrap";
            tdAlelo.style.border = "1px solid #d4d4d4";
            tdAlelo.classList.add("header-cell", "allele-header");
            
            if (nombreAlelo === "") {
                tdAlelo.style.backgroundColor = seccion === 'variable' ? "#e8f0fe" : "#f0e8fe";
            }
            tr.appendChild(tdAlelo);
            
            for (let idxCol = 1; idxCol < filaData.length; idxCol++) {
                const celda = filaData[idxCol];
                const td = document.createElement("td");
                td.textContent = celda.valor || "";
                td.style.textAlign = "center";
                td.style.padding = "1px 1px";
                td.style.border = "1px solid #d4d4d4";
                td.style.fontSize = CELL_CONFIG.FONT_SIZE;
                td.style.whiteSpace = "nowrap";
                td.style.minWidth = CELL_CONFIG.MIN_CELL_WIDTH;
                td.style.maxWidth = CELL_CONFIG.MAX_CELL_WIDTH;
                td.style.width = "auto";
                td.style.height = CELL_CONFIG.CELL_HEIGHT;
                td.style.lineHeight = "1";
                td.style.overflow = "hidden";
                td.style.textOverflow = "ellipsis";
                
                const colorStyle = getColorStyle(celda.color, Boolean(celda.valor));
                if (colorStyle.bg) {
                    td.style.backgroundColor = colorStyle.bg;
                    td.style.color = colorStyle.textColor;
                    td.style.fontWeight = colorStyle.bold ? "bold" : "normal";
                }
                
                if (celda.valor && celda.valor !== "" && filaReal !== 1) {
                    td.style.cursor = "pointer";
                    td.classList.add("clickable-cell");
                    td.dataset.alelo = nombreAlelo;
                    td.dataset.columna = String(celda.columna);
                    td.dataset.fila = String(celda.fila);
                    td.dataset.colNum = String(celda.columna);
                    td.dataset.valor = celda.valor;
                    td.dataset.baseBg = colorStyle.bg || '';
                    td.dataset.seccion = seccion;
                    td.title = `Click: ${celda.valor}`;
                }
                
                tr.appendChild(td);
            }
            
            return tr;
        }
        
        requestAnimationFrame(renderChunk);
        
    }, 50);
}

// ============================================
// FUNCIONES DE GESTIÓN DE MOMENTOS
// ============================================

function filtrarCeldasPorMomento(seccionVariable, momento) {
    if (!seccionVariable || !momento) {
        return seccionVariable;
    }
    
    const { combinaciones, color } = momento;
    
    const combinacionesSet = new Set();
    combinaciones.forEach(combo => {
        const key = `${combo.order_one}|${combo.order_two}|${combo.order_three}`;
        combinacionesSet.add(key);
    });
    
    const seccionFiltrada = [];
    
    for (let i = 0; i < seccionVariable.length; i++) {
        const filaData = seccionVariable[i];
        const filaFiltrada = [];
        
        for (let j = 0; j < filaData.length; j++) {
            const celda = filaData[j];
            const orderKey = `${celda.order1}|${celda.order2}|${celda.order3}`;
            const cumpleCombinacion = combinacionesSet.has(orderKey);
            const cumpleColor = celda.color === color;
            const esFija = celda.order1 === "2";
            
            if ((cumpleCombinacion && cumpleColor) || esFija) {
                filaFiltrada.push({
                    ...celda,
                    momentoActivo: true,
                    colorOriginal: celda.color,
                    esFija: esFija
                });
            } else {
                filaFiltrada.push({
                    ...celda,
                    valor: "",
                    color: "255,255,255",
                    momentoActivo: false,
                    colorOriginal: celda.color,
                    esFija: false
                });
            }
        }
        
        seccionFiltrada.push(filaFiltrada);
    }
    
    return seccionFiltrada;
}

function reconstruirAcumulacionHastaMomento(indiceMomento) {
    // Reiniciar acumulación
    const nuevaAcumulacion = new Map();
    
    // Recorrer todos los momentos desde el 0 hasta el índice actual
    for (let m = 0; m <= indiceMomento; m++) {
        const momento = MOMENTOS[m];
        const seccionFiltrada = filtrarCeldasPorMomento(
            datosOriginales.seccionVariable,
            momento
        );
        
        // Acumular celdas activas de este momento
        for (let i = 0; i < seccionFiltrada.length; i++) {
            for (let j = 0; j < seccionFiltrada[i].length; j++) {
                const celda = seccionFiltrada[i][j];
                if (celda.momentoActivo && celda.valor && celda.valor !== "") {
                    const key = `${celda.fila},${celda.columna}`;
                    nuevaAcumulacion.set(key, celda);
                }
            }
        }
    }
    
    return nuevaAcumulacion;
}

function construirSeccionConAcumuladas(seccionOriginal, celdasAcumuladas) {
    const nuevaSeccion = [];
    
    for (let i = 0; i < seccionOriginal.length; i++) {
        const filaData = seccionOriginal[i];
        const nuevaFila = [];
        
        for (let j = 0; j < filaData.length; j++) {
            const celda = filaData[j];
            const key = `${celda.fila},${celda.columna}`;
            const esFija = celda.order1 === "2";
            
            // PRIORIDAD: Si es fija Y tiene valor, mantenerla siempre
            if (esFija && celda.valor && celda.valor !== "") {
                nuevaFila.push({
                    ...celda,
                    momentoActivo: true,
                    esFija: true,
                    colorOriginal: celda.color
                });
            }
            // Si está acumulada
            else if (celdasAcumuladas.has(key)) {
                const celdaAcumulada = celdasAcumuladas.get(key);
                nuevaFila.push({
                    ...celdaAcumulada,
                    momentoActivo: true,
                    esFija: esFija
                });
            }
            // Vacía
            else {
                nuevaFila.push({
                    ...celda,
                    valor: "",
                    color: "255,255,255",
                    momentoActivo: false,
                    esFija: false,
                    colorOriginal: celda.color
                });
            }
        }
        
        nuevaSeccion.push(nuevaFila);
    }
    
    return nuevaSeccion;
}

function repintarConMomento(momentoIndex) {
    if (!datosOriginales) {
        console.warn("there is no original data to drawing");
        return;
    }
    
    if (momentoIndex < 0 || momentoIndex >= MOMENTOS.length) {
        console.warn(`Moment ${momentoIndex} out of range`);
        return;
    }
    
    const momento = MOMENTOS[momentoIndex];
    momentoActual = momentoIndex;
    
    actualizarInfoMomento(momento);
    
    celdasAcumuladas = reconstruirAcumulacionHastaMomento(momentoIndex);
    console.log(`🔄 Acumulación reconstruida hasta momento ${momentoIndex + 1} (${celdasAcumuladas.size} celdas)`);
    
    // Construir datos con celdas acumuladas
    const datosAcumulados = {
        ...datosOriginales,
        seccionVariable: construirSeccionConAcumuladas(
            datosOriginales.seccionVariable,
            celdasAcumuladas
        )
    };
    
    renderizarTablaExcelConMomento(datosAcumulados, momento);
    actualizarContadorMomento();
    
    // Actualizar el selector para reflejar el momento actual
    const selectMomento = document.getElementById("select-momento");
    if (selectMomento) {
        selectMomento.value = String(momentoIndex);
    }
    
    // Actualizar estado de botones
    actualizarEstadoBotones();
}

function renderizarTablaExcelConMomento(data, momento) {
    const container = document.getElementById("excel-container");
    if (!container) return;
    
    const { matriz, columnas, seccionVariable, seccionFija } = data;
    
    if (!matriz || matriz.length === 0 || columnas.length === 0) {
        mostrarMensaje("No data found to display", "warning");
        return;
    }
    
    const proteinNames = [];
    if (matriz.length > 0 && matriz[0]) {
        for (let idxCol = 1; idxCol < matriz[0].length; idxCol++) {
            const celdaProteina = matriz[0][idxCol];
            proteinNames.push(celdaProteina.valor || "");
        }
    }
    
    const alleleNames = [];
    if (matriz.length > 0) {
        for (let idxRow = 1; idxRow < matriz.length; idxRow++) {
            if (matriz[idxRow] && matriz[idxRow][0]) {
                const celdaAlelo = matriz[idxRow][0];
                alleleNames.push((celdaAlelo.valor && celdaAlelo.valor.trim() !== "") ? celdaAlelo.valor : "");
            } else {
                alleleNames.push("");
            }
        }
    }
    
    let seccionVariableFiltrada = [];
    let seccionFijaFiltrada = [];
    let fila1Eliminada = false;
    
    for (let i = 0; i < seccionVariable.length; i++) {
        const filaData = seccionVariable[i];
        if (filaData && filaData[0]) {
            const filaNum = filaData[0].fila;
            if (filaNum !== 1) {
                seccionVariableFiltrada.push(filaData);
            } else {
                fila1Eliminada = true;
            }
        }
    }
    
    for (let i = 0; i < seccionFija.length; i++) {
        const filaData = seccionFija[i];
        if (filaData && filaData[0]) {
            const filaNum = filaData[0].fila;
            if (filaNum !== 1) {
                seccionFijaFiltrada.push(filaData);
            }
        }
    }
    
    if (fila1Eliminada && seccionVariableFiltrada.length > 0) {
        const filaBlanco = [];
        const numColumnas = seccionVariableFiltrada[0] ? seccionVariableFiltrada[0].length : 0;
        
        for (let j = 0; j < numColumnas; j++) {
            filaBlanco.push({
                valor: "",
                color: "255,255,255",
                fila: 1,
                columna: j,
                order1: "1",
                momentoActivo: false
            });
        }
        seccionVariableFiltrada.unshift(filaBlanco);
    }
    
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6c757d;"><i class="fas fa-spinner fa-pulse fa-2x"></i><br><br>Rendering filtered table...</div>';
    
    setTimeout(() => {
        const table = document.createElement("table");
        table.className = "excel-table";
        table.style.fontSize = CELL_CONFIG.FONT_SIZE;
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        
        const thCorner = document.createElement("th");
        thCorner.textContent = "A\\P";
        thCorner.style.minWidth = "35px";
        thCorner.style.maxWidth = "50px";
        thCorner.style.width = "auto";
        thCorner.style.position = "sticky";
        thCorner.style.left = "0";
        thCorner.style.backgroundColor = "#f3f3f3";
        thCorner.style.zIndex = "20";
        thCorner.style.fontSize = CELL_CONFIG.CORNER_FONT_SIZE || '7px';
        thCorner.style.padding = "2px 4px";
        thCorner.style.border = "1px solid #d4d4d4";
        thCorner.style.fontWeight = "bold";
        thCorner.style.textAlign = "center";
        thCorner.style.height = "auto";
        thCorner.style.verticalAlign = "middle";
        headerRow.appendChild(thCorner);
        
        const headerFontSize = CELL_CONFIG.HEADER_FONT_SIZE || '7px';
        
        proteinNames.forEach((proteinName) => {
            const th = document.createElement("th");
            const dims = calcularDimensionesTextoRotado(proteinName, headerFontSize);
            const cellWidth = dims.width;
            const cellHeight = dims.height;
            
            th.style.minWidth = cellWidth + "px";
            th.style.maxWidth = cellWidth + "px";
            th.style.width = cellWidth + "px";
            th.style.minHeight = cellHeight + "px";
            th.style.height = cellHeight + "px";
            th.style.backgroundColor = "#f3f3f3";
            th.style.position = "sticky";
            th.style.top = "0";
            th.style.zIndex = "10";
            th.style.fontSize = headerFontSize;
            th.style.padding = "0px";
            th.style.border = "1px solid #d4d4d4";
            th.style.textAlign = "center";
            th.style.verticalAlign = "middle";
            th.style.overflow = "hidden";
            th.style.whiteSpace = "nowrap";
            
            const div = document.createElement("div");
            div.textContent = proteinName || "";
            div.className = "vertical-text";
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.style.width = "100%";
            div.style.height = "100%";
            div.style.transform = "rotate(-90deg)";
            div.style.whiteSpace = "nowrap";
            div.style.fontWeight = "bold";
            div.style.fontSize = headerFontSize;
            div.style.padding = "0px";
            div.style.margin = "0px";
            div.style.lineHeight = "1.1";
            div.style.maxWidth = "none";
            div.style.overflow = "visible";
            div.style.textOverflow = "clip";
            div.style.color = "#000000";
            div.style.letterSpacing = "0px";
            
            const textSpan = document.createElement("span");
            textSpan.textContent = proteinName || "";
            textSpan.style.display = "inline-block";
            div.appendChild(textSpan);
            
            if (proteinName && proteinName.length > 6) {
                div.title = proteinName;
            }
            
            th.appendChild(div);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        
        container.innerHTML = "";
        container.appendChild(table);
        
        tbody.addEventListener("click", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td) return;
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
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
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
            td.style.transform = "scale(1.02)";
            td.style.transition = "all 0.2s ease";
            td.style.outline = "1px solid #0078d4";
            td.style.zIndex = "20";
            td.style.position = "relative";
        });
        
        tbody.addEventListener("mouseout", (event) => {
            const td = event.target.closest("td.clickable-cell");
            if (!td || td.contains(event.relatedTarget)) return;
            if (td.classList.contains("header-cell") || td.classList.contains("protein-header")) {
                return;
            }
            td.style.transform = "scale(1)";
            td.style.outline = "none";
            td.style.zIndex = "auto";
        });
        
        let idxFilaVariable = 0;
        const totalFilasVariable = seccionVariableFiltrada.length;
        let idxFilaFija = 0;
        const totalFilasFija = seccionFijaFiltrada.length;
        let seccionActual = 'variable';
        let filasRenderizadas = 0;
        const totalFilasTotales = totalFilasVariable + totalFilasFija;
        
        if (totalFilasTotales === 0) {
            mostrarMensaje("No data rows found", "warning");
            return;
        }
        
        const renderChunk = () => {
            const bodyFragment = document.createDocumentFragment();
            
            if (seccionActual === 'variable' && idxFilaVariable < totalFilasVariable) {
                const end = Math.min(idxFilaVariable + RENDER_ROWS_PER_FRAME, totalFilasVariable);
                
                for (; idxFilaVariable < end; idxFilaVariable++) {
                    const filaData = seccionVariableFiltrada[idxFilaVariable];
                    if (!filaData) continue;
                    
                    const filaReal = filaData[0]?.fila || 0;
                    let idxAlelo;
                    if (filaReal === 1) {
                        idxAlelo = -1;
                    } else {
                        idxAlelo = filaReal - 2;
                    }
                    
                    const tr = crearFilaHTMLConMomento(filaData, filaReal, alleleNames, idxAlelo, 'variable', momento);
                    bodyFragment.appendChild(tr);
                    filasRenderizadas++;
                }
                
                if (idxFilaVariable >= totalFilasVariable && totalFilasFija > 0) {
                    seccionActual = 'fija';
                }
            }
            
            if (seccionActual === 'fija' && idxFilaFija < totalFilasFija) {
                const end = Math.min(idxFilaFija + RENDER_ROWS_PER_FRAME, totalFilasFija);
                
                for (; idxFilaFija < end; idxFilaFija++) {
                    const filaData = seccionFijaFiltrada[idxFilaFija];
                    if (!filaData) continue;
                    
                    const filaReal = filaData[0]?.fila || 0;
                    let idxAlelo;
                    if (filaReal === 1) {
                        idxAlelo = -1;
                    } else {
                        idxAlelo = filaReal - 2;
                    }
                    
                    const tr = crearFilaHTMLConMomento(filaData, filaReal, alleleNames, idxAlelo, 'fija', momento);
                    bodyFragment.appendChild(tr);
                    filasRenderizadas++;
                }
            }
            
            tbody.appendChild(bodyFragment);
            
            if (idxFilaVariable < totalFilasVariable || idxFilaFija < totalFilasFija) {
                requestAnimationFrame(renderChunk);
                return;
            }
            
            const statsSpan = document.getElementById("info-stats");
            if (statsSpan) {
                const celdasActivas = contarCeldasActivas(seccionVariableFiltrada);
                const totalCeldas = seccionVariableFiltrada.reduce((sum, fila) => sum + fila.length, 0);
                
                statsSpan.innerHTML = `${totalFilasVariable + totalFilasFija} rows × ${proteinNames.length} columns | ` +
                                     `${celdasActivas} cells active (${Math.round(celdasActivas/totalCeldas*100)}%) | ` +
                                     `Moment ${momento.id}: ${momento.nombre}`;
            }
        };
        
        // ============================================
        // FUNCIONES PARA FILA DE MOMENTOS
        // ============================================
        function crearFilaHTMLConMomento(filaData, filaReal, alleleNames, idxAlelo, seccion, momento) {
            const tr = document.createElement("tr");
            tr.classList.add(`seccion-${seccion}`);
            
            let nombreAlelo = "";
            if (filaReal === 1 || idxAlelo < 0) {
                nombreAlelo = "";
            } else if (idxAlelo >= 0 && idxAlelo < alleleNames.length) {
                nombreAlelo = alleleNames[idxAlelo];
            }
            
            const tdAlelo = document.createElement("td");
            tdAlelo.textContent = nombreAlelo;
            tdAlelo.style.fontWeight = "bold";
            tdAlelo.style.backgroundColor = seccion === 'variable' ? "#f0f7ff" : "#f8f0ff";
            tdAlelo.style.position = "sticky";
            tdAlelo.style.left = "0";
            tdAlelo.style.minWidth = CELL_CONFIG.MIN_FIRST_COL_WIDTH;
            tdAlelo.style.maxWidth = CELL_CONFIG.MAX_FIRST_COL_WIDTH;
            tdAlelo.style.textAlign = "left";
            tdAlelo.style.zIndex = "5";
            tdAlelo.style.fontSize = CELL_CONFIG.ALLELE_FONT_SIZE;
            tdAlelo.style.padding = "2px 4px";
            tdAlelo.style.whiteSpace = "nowrap";
            tdAlelo.style.border = "1px solid #d4d4d4";
            tdAlelo.classList.add("header-cell", "allele-header");
            
            if (nombreAlelo === "") {
                tdAlelo.style.backgroundColor = seccion === 'variable' ? "#e8f0fe" : "#f0e8fe";
            }
            tr.appendChild(tdAlelo);
            
            for (let idxCol = 1; idxCol < filaData.length; idxCol++) {
                const celda = filaData[idxCol];
                const td = document.createElement("td");
                td.textContent = celda.valor || "";
                td.style.textAlign = "center";
                td.style.padding = "1px 1px";
                td.style.border = "1px solid #d4d4d4";
                td.style.fontSize = CELL_CONFIG.FONT_SIZE;
                td.style.whiteSpace = "nowrap";
                td.style.minWidth = CELL_CONFIG.MIN_CELL_WIDTH;
                td.style.maxWidth = CELL_CONFIG.MAX_CELL_WIDTH;
                td.style.width = "auto";
                td.style.height = CELL_CONFIG.CELL_HEIGHT;
                td.style.lineHeight = "1";
                td.style.overflow = "hidden";
                td.style.textOverflow = "ellipsis";
                
                const esActiva = celda.momentoActivo === true && celda.valor && celda.valor !== "";
                const esFija = celda.esFija === true || celda.order1 === "2"; // ⭐ MODIFICADO
                
                // ⭐ NUEVO: Si es fija Y tiene valor, siempre mostrar con color
                if (esFija && celda.valor && celda.valor !== "") {
                    const colorOriginal = celda.colorOriginal || celda.color || "200,200,200";
                    const colorStyle = getColorStyle(colorOriginal, true);
                    if (colorStyle.bg) {
                        td.style.backgroundColor = colorStyle.bg;
                        td.style.color = colorStyle.textColor;
                        td.style.fontWeight = colorStyle.bold ? "bold" : "normal";
                    }
                    td.title = `FIXED: ${celda.valor}`;
                    td.style.cursor = "default";
                    td.classList.add("celda-fija");
                }
                // Si es activa (de un momento)
                else if (esActiva) {
                    const colorOriginal = celda.colorOriginal || celda.color;
                    const colorStyle = getColorStyle(colorOriginal, true);
                    if (colorStyle.bg) {
                        td.style.backgroundColor = colorStyle.bg;
                        td.style.color = colorStyle.textColor;
                        td.style.fontWeight = colorStyle.bold ? "bold" : "normal";
                    }
                    td.title = `ACTIVE: ${celda.valor} | Moment ${momento.id}: ${momento.nombre}`;
                    td.style.cursor = "pointer";
                    td.classList.add("clickable-cell", "celda-activa");
                    td.dataset.alelo = nombreAlelo;
                    td.dataset.columna = String(celda.columna);
                    td.dataset.fila = String(celda.fila);
                    td.dataset.colNum = String(celda.columna);
                    td.dataset.valor = celda.valor;
                    td.dataset.momento = momento.id;
                }
                // Celda vacía
                else {
                    td.style.backgroundColor = "#ffffff";
                    td.style.color = "#cccccc";
                    td.style.fontWeight = "normal";
                    td.style.cursor = "default";
                    td.title = "";
                }
                
                tr.appendChild(td);
            }
            
            return tr;
        }
        
        function contarCeldasActivas(seccion) {
            let count = 0;
            for (let i = 0; i < seccion.length; i++) {
                for (let j = 0; j < seccion[i].length; j++) {
                    if (seccion[i][j].momentoActivo === true && seccion[i][j].valor && seccion[i][j].valor !== "") {
                        count++;
                    }
                }
            }
            return count;
        }
        
        requestAnimationFrame(renderChunk);
        
    }, 50);
}

function actualizarEstadoBotones() {
    const btnAnterior = document.getElementById("btn-anterior");
    const btnSiguiente = document.getElementById("btn-siguiente");
    const btnPrimero = document.getElementById("btn-primer-momento");
    const btnUltimo = document.getElementById("btn-ultimo-momento");
    
    if (btnAnterior) {
        btnAnterior.disabled = (momentoActual === 0);
    }
    if (btnPrimero) {
        btnPrimero.disabled = (momentoActual === 0);
    }
    
    if (btnSiguiente) {
        btnSiguiente.disabled = (momentoActual >= MOMENTOS.length - 1);
    }
    if (btnUltimo) {
        btnUltimo.disabled = (momentoActual >= MOMENTOS.length - 1);
    }
}

function actualizarInfoMomento(momento) {
    const infoMomento = document.getElementById("info-momento");
    if (infoMomento) {
        const combinacionesStr = momento.combinaciones
            .map(c => `(${c.order_one}, ${c.order_two}, ${c.order_three})`)
            .join(' ');
        
        infoMomento.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <span style="font-weight: bold; color: #0078d4;">
                    <i class="fas fa-play"></i> Moment ${momento.id}: ${momento.nombre}
                </span>
                <span style="background: rgb(${momento.color}); padding: 2px 8px; border-radius: 4px; color: white; font-size: 11px;">
                    ${momento.color}
                </span>
                <span style="font-size: 12px; color: #666;">
                    ${momento.descripcion || ''}
                </span>
                <span style="font-size: 11px; color: #999;">
                    ${combinacionesStr}
                </span>
            </div>
        `;
        infoMomento.style.display = 'block';
    }
}

function actualizarContadorMomento() {
    const contador = document.getElementById("momento-contador");
    if (contador) {
        contador.textContent = `${momentoActual + 1} / ${MOMENTOS.length}`;
    }
}

function siguienteMomento() {
    if (!datosOriginales) {
        console.warn("No hay datos cargados");
        return;
    }
    if (momentoActual >= MOMENTOS.length - 1) {
        console.log("Ya estás en el último momento");
        return;
    }
    const siguiente = momentoActual + 1;
    repintarConMomento(siguiente);
}

function anteriorMomento() {
    if (!datosOriginales) {
        console.warn("No hay datos cargados");
        return;
    }
    if (momentoActual <= 0) {
        console.log("Ya estás en el primer momento");
        return;
    }
    const anterior = momentoActual - 1;
    repintarConMomento(anterior);
}

function irAMomento(indice) {
    if (indice < 0 || indice >= MOMENTOS.length) {
        console.warn(`Índice ${indice} fuera de rango`);
        return;
    }
    
    // Si vamos al primer momento, el reset se hace automáticamente en repintarConMomento
    repintarConMomento(indice);
}

function resetearMomentos() {
    if (!datosOriginales) {
        console.warn("No hay datos cargados para resetear");
        return;
    }
    
    console.log("🔄 Reset completo - reiniciando todo");
    
    // Reiniciar acumulación y volver al primer momento
    momentoActual = 0;
    repintarConMomento(0);
    
    // Actualizar selector
    const selectMomento = document.getElementById("select-momento");
    if (selectMomento) {
        selectMomento.value = "0";
    }
}

function toggleReproduccion() {
    if (reproduciendo) {
        detenerReproduccion();
    } else {
        iniciarReproduccion();
    }
}

function iniciarReproduccion() {
    if (!datosOriginales) {
        console.warn("No hay datos cargados para reproducir");
        return;
    }
    
    // Si estamos en el último momento, empezar desde el principio
    if (momentoActual >= MOMENTOS.length - 1) {
        resetearMomentos();
    }
    
    if (intervaloReproduccion) {
        clearInterval(intervaloReproduccion);
        intervaloReproduccion = null;
    }
    
    reproduciendo = true;
    actualizarBotonReproduccion(true);
    
    intervaloReproduccion = setInterval(() => {
        if (momentoActual >= MOMENTOS.length - 1) {
            // Llegamos al final, detener reproducción
            detenerReproduccion();
            return;
        }
        const siguiente = momentoActual + 1;
        repintarConMomento(siguiente);
    }, 1500);
}

function detenerReproduccion() {
    if (intervaloReproduccion) {
        clearInterval(intervaloReproduccion);
        intervaloReproduccion = null;
    }
    reproduciendo = false;
    actualizarBotonReproduccion(false);
}

function actualizarBotonReproduccion(activo) {
    const btnPlay = document.getElementById("btn-play");
    if (btnPlay) {
        if (activo) {
            btnPlay.innerHTML = '<i class="fas fa-pause"></i> Pause';
            btnPlay.classList.add('btn-danger');
            btnPlay.classList.remove('btn-success');
        } else {
            btnPlay.innerHTML = '<i class="fas fa-play"></i> Play';
            btnPlay.classList.add('btn-success');
            btnPlay.classList.remove('btn-danger');
        }
    }
}

function inicializarControlesMomentos() {
    let controlesContainer = document.getElementById("controles-momentos");
    
    if (!controlesContainer) {
        controlesContainer = document.createElement("div");
        controlesContainer.id = "controles-momentos";
        controlesContainer.className = "controles-momentos";
        controlesContainer.style.cssText = `
            padding: 10px 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        `;
        
        const container = document.getElementById("excel-container");
        if (container && container.parentNode) {
            container.parentNode.insertBefore(controlesContainer, container);
        } else {
            document.querySelector(".container-fluid")?.appendChild(controlesContainer);
        }
    }
    
    controlesContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button id="btn-reset" class="btn btn-sm btn-danger" title="Start all">
                <i class="fas fa-undo"></i> Reset
            </button>
            
            <span style="border-left: 1px solid #ccc; padding-left: 5px;"></span>
            
            <button id="btn-primer-momento" class="btn btn-sm btn-outline-secondary" title="First moment" ${momentoActual === 0 ? 'disabled' : ''}>
                <i class="fas fa-fast-backward"></i>
            </button>
            <button id="btn-anterior" class="btn btn-sm btn-outline-secondary" title="Back moment" ${momentoActual === 0 ? 'disabled' : ''}>
                <i class="fas fa-step-backward"></i>
            </button>
            <button id="btn-play" class="btn btn-sm btn-success" title="Play">
                <i class="fas fa-play"></i> Play
            </button>
            <button id="btn-siguiente" class="btn btn-sm btn-outline-secondary" title="Next moment" ${momentoActual >= MOMENTOS.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-step-forward"></i>
            </button>
            <button id="btn-ultimo-momento" class="btn btn-sm btn-outline-secondary" title="Last moment" ${momentoActual >= MOMENTOS.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-fast-forward"></i>
            </button>
            
            <span style="border-left: 1px solid #ccc; padding-left: 10px; margin-left: 5px;"></span>
            
            <span id="momento-contador" class="badge bg-dark" style="font-size: 14px; padding: 5px 12px;">
                ${momentoActual + 1} / ${MOMENTOS.length}
            </span>
            
            <select id="select-momento" class="form-select form-select-sm" style="width: auto; min-width: 150px;">
                ${MOMENTOS.map((m, idx) => `
                    <option value="${idx}" ${idx === momentoActual ? 'selected' : ''}>${m.id}. ${m.nombre}</option>
                `).join('')}
            </select>
            
            <span id="info-momento" style="display: none; font-size: 12px; padding: 4px 10px; background: #e9ecef; border-radius: 4px;">
            </span>
        </div>
    `;
    
    // ⭐ NUEVO: Botón RESET
    document.getElementById("btn-reset")?.addEventListener("click", resetearMomentos);
    
    document.getElementById("btn-primer-momento")?.addEventListener("click", () => {
        // Al ir al primer momento, reiniciamos la acumulación
        celdasAcumuladas = new Map();
        irAMomento(0);
    });
    
    document.getElementById("btn-anterior")?.addEventListener("click", anteriorMomento);
    document.getElementById("btn-play")?.addEventListener("click", toggleReproduccion);
    document.getElementById("btn-siguiente")?.addEventListener("click", siguienteMomento);
    
    document.getElementById("btn-ultimo-momento")?.addEventListener("click", () => {
        irAMomento(MOMENTOS.length - 1);
    });
    
    // ⭐ FIX: Selector de momentos - mejorado
    document.getElementById("select-momento")?.addEventListener("change", function() {
        const idx = parseInt(this.value);
        if (!isNaN(idx) && idx >= 0 && idx < MOMENTOS.length) {
            detenerReproduccion();
            
            // Si vamos al primer momento, reiniciamos acumulación
            if (idx === 0) {
                celdasAcumuladas = new Map();
            }
            
            irAMomento(idx);
        }
    });
    
    actualizarContadorMomento();
    actualizarEstadoBotones();
}

function actualizarMomentos(nuevosMomentos) {
    if (!nuevosMomentos || !Array.isArray(nuevosMomentos) || nuevosMomentos.length === 0) {
        console.warn("No se proporcionaron momentos válidos");
        return;
    }
    
    MOMENTOS.length = 0;
    nuevosMomentos.forEach((m, idx) => {
        MOMENTOS.push({
            id: m.id || idx + 1,
            nombre: m.nombre || `Momento ${idx + 1}`,
            combinaciones: m.combinaciones || [],
            color: m.color || '255,255,255',
            descripcion: m.descripcion || ''
        });
    });
    
    if (document.getElementById("controles-momentos")) {
        inicializarControlesMomentos();
    }
    
    if (datosOriginales) {
        repintarConMomento(0);
    }
    
    console.log(`✅ Momentos actualizados: ${MOMENTOS.length} momentos`);
}



// ============================================
// FUNCION DE DEPURACION
// ============================================
function depurarCoordenadas(registros, genName) {
    console.log(`=== DEPURACIÓN DE COORDENADAS PARA ${genName} ===`);
    
    if (!registros || registros.length === 0) {
        console.log("No hay registros para depurar");
        return;
    }
    
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
    
    const minFila = Math.min(...coordenadas.map(c => c.fila));
    const maxFila = Math.max(...coordenadas.map(c => c.fila));
    const minCol = Math.min(...coordenadas.map(c => c.col));
    const maxCol = Math.max(...coordenadas.map(c => c.col));
    
    console.log(`Rango de filas: ${minFila} a ${maxFila} (${maxFila - minFila + 1} filas)`);
    console.log(`Rango de columnas: ${minCol} a ${maxCol} (${maxCol - minCol + 1} columnas)`);
    console.log(`Total de coordenadas únicas: ${coordenadas.length}`);
    console.log("Ejemplo de coordenadas (primeras 10):");
    coordenadas.slice(0, 10).forEach(coord => {
        console.log(`  (${coord.fila}, ${coord.col}) -> valor: "${coord.valor}", color: ${coord.color}`);
    });
    
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
        statsSpan.innerHTML = "No data";
    }
}

// ============================================
// 5. CARGAR DATOS POR GEN (MODIFICADA)
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
        infoGen.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> Current Gene: <strong>${genNombre}</strong> - Loading data...`;
        infoGen.style.background = "#e3f2fd";
    }
    
    try {
        const registros = await obtenerTodosLosRegistros(genId);
        
        if (!registros || registros.length === 0) {
            mostrarMensaje(`No data available for gene ${genNombre}`, "warning");
            if (load) load.hidden = true;
            if (infoGen) {
                infoGen.innerHTML = `<i class="fas fa-info-circle"></i> Current Gene: <strong>${genNombre}</strong> - No data`;
                infoGen.style.background = "#fff3cd";
            }
            return;
        }
        
        console.log(`Processing ${registros.length} records for ${genNombre} (ID: ${genId})...`);
        
        const resultado = procesarDatos(registros);
        
        // REINICIAR ACUMULACIÓN
        celdasAcumuladas = new Map();
        
        // GUARDAR DATOS ORIGINALES
        datosOriginales = resultado;
        
        // Inicializar controles de momentos
        inicializarControlesMomentos();
        
        // Renderizar con el primer momento
        repintarConMomento(0);
        
        if (infoGen) {
            infoGen.innerHTML = `<i class="fas fa-check-circle"></i> Current Gene: <strong>${genNombre}</strong> (Moments mode)`;
            infoGen.style.background = "#d4edda";
        }
              
        if (load) load.hidden = true;
        
    } catch (error) {
        if (load) load.hidden = true;
        console.error("Error loading data:", error);
        
        let mensajeError = `Error loading data for gene ${genNombre}: ${error.message}`;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "error",
                title: "Error loading data",
                text: mensajeError,
                confirmButtonText: "Accept"
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
    
    cargarListaGenes();
    
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
});