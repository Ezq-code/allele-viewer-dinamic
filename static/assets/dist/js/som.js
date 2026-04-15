
// ============================================
// VARIABLES GLOBALES
// ============================================
const load = document.getElementById("load");
let currentGen = null;

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
    let allResults = [];
    let nextUrl = `/genes_to_excel/caracteristica-gen/?gen__name=${genName}&page_size=1000`;
    let pageCount = 0;
    
    console.log(`Obteniendo todos los registros para ${genName}...`);
    
    // Mostrar progreso inicial
    const statsSpan = document.getElementById("info-stats");
    if (statsSpan) {
        statsSpan.innerHTML = `Cargando datos de ${genName}...`;
    }
    
    while (nextUrl) {
        pageCount++;
        console.log(`Cargando página ${pageCount}...`);
        
        const response = await axios.get(nextUrl);
        const data = response.data;
        
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
        
        // Actualizar progreso
        if (statsSpan && data.count) {
            const porcentaje = Math.round((allResults.length / data.count) * 100);
            statsSpan.innerHTML = `Cargando: ${allResults.length} de ${data.count} registros (${porcentaje}%)...`;
        }
    }
    
    console.log(`Total registros obtenidos: ${allResults.length}`);
    return allResults;
}

// ============================================
// 1. CARGAR LISTA DE GENES DESDE NUEVO ENDPOINT
// ============================================
async function cargarListaGenes() {
    try {
        // Mostrar loading
        if (load) load.hidden = false;
        
        console.log("🔍 Haciendo petición a: /genes_to_excel/v1/listgenes");
        
        // Usar el nuevo endpoint específico para lista de genes
        const response = await axios.get("/genes_to_excel/v1/listgenes");
        
        console.log("✅ Respuesta recibida:", response);
        console.log("📦 Datos de respuesta:", response.data);
        console.log("📊 Tipo de datos:", typeof response.data);
        console.log("📊 ¿Es array?", Array.isArray(response.data));
        
        const genesData = response.data;
        
        // Verificar que genesData es un array
        let genesList = [];
        
        if (Array.isArray(genesData)) {
            console.log("✅ genesData es un array, longitud:", genesData.length);
            // Extraer el campo 'name' de cada objeto
            genesList = genesData.map(gene => {
                console.log("Procesando gene:", gene);
                return gene.name;
            }).filter(name => {
                console.log("Filtrando name:", name);
                return name;
            });
        } else if (genesData.results && Array.isArray(genesData.results)) {
            console.log("✅ genesData tiene resultados paginados, longitud:", genesData.results.length);
            // Por si acaso el endpoint devuelve paginado en el futuro
            genesList = genesData.results.map(gene => {
                console.log("Procesando gene:", gene);
                return gene.name;
            }).filter(name => {
                console.log("Filtrando name:", name);
                return name;
            });
        } else {
            console.error("❌ Formato inesperado:", genesData);
            throw new Error("Formato de datos de genes inválido");
        }
        
        console.log("📋 Lista de genes extraída:", genesList);
        
        // Ordenar alfabéticamente
        genesList.sort();
        
        console.log("📋 Lista de genes ordenada:", genesList);
        console.log(`📊 Total de genes encontrados: ${genesList.length}`);
        
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
        
        genesList.forEach(gene => {
            const option = document.createElement("option");
            option.value = gene;
            option.textContent = gene;
            selectGene.appendChild(option);
            console.log(`✅ Opción agregada: ${gene}`);
        });
        
        console.log(`✅ Select llenado con ${genesList.length} genes`);
        
        // Recuperar último gen seleccionado del localStorage
        const lastGen = localStorage.getItem("lastSelectedGen");
        console.log(`📌 Último gen seleccionado: ${lastGen}`);
        
        if (lastGen && genesList.includes(lastGen)) {
            selectGene.value = lastGen;
            console.log(`🔄 Cargando último gen: ${lastGen}`);
            // Cargar datos automáticamente si hay un gen guardado
            cargarDatosPorGen(lastGen);
        }
        
        // Ocultar loading
        if (load) load.hidden = true;
        
        console.log(`✅ Genes cargados exitosamente: ${genesList.length} genes encontrados`);
        
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
    console.log("Procesando registros:", registros.length);
    
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
    registros.forEach(reg => {
        const cord = reg.cord;
        const valor = reg.valor || "";
        const color = reg.color || "255,255,255";
        
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
                        color: color,
                        fila: fila,
                        columna: columna
                    });
                }
            }
        }
    });
    
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
    
    console.log(`Rango de filas: ${minFila} a ${maxFila} (total: ${filas.length})`);
    console.log(`Rango de columnas: ${minCol} a ${maxCol} (total: ${columnas.length})`);
    console.log(`Celdas con datos: ${celdasMap.size}`);
    
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
    const celdasConValor = matriz.reduce((total, fila) => {
        return total + fila.filter(celda => celda.valor && celda.valor !== "").length;
    }, 0);
    
    console.log(`Matriz creada: ${filas.length} filas x ${columnas.length} columnas`);
    console.log(`Celdas con valor: ${celdasConValor} de ${filas.length * columnas.length} total`);
    
    // Mostrar ejemplo de las primeras celdas no vacías
    if (celdasMap.size > 0) {
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
    
    console.log(`Renderizando tabla: ${filas.length} filas x ${columnas.length} columnas`);
    console.log(`Coordenada inicial: (${minFila}, ${minCol})`);
    
    // Mostrar indicador de carga
    container.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-pulse"></i> Renderizando tabla...</div>';
    
    // Usar setTimeout para no bloquear el UI
    setTimeout(() => {
        const table = document.createElement("table");
        table.className = "excel-table";
        
        // ========== CABECERA ==========
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        
        // Esquina superior izquierda
        const thCorner = document.createElement("th");
        thCorner.textContent = "Fila\\Col";
        thCorner.style.minWidth = "80px";
        thCorner.style.position = "sticky";
        thCorner.style.left = "0";
        thCorner.style.backgroundColor = "#f3f3f3";
        thCorner.style.zIndex = "20";
        headerRow.appendChild(thCorner);
        
        // Columnas (mostrar el número de columna real)
        columnas.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            th.style.minWidth = "80px";
            th.style.backgroundColor = "#f3f3f3";
            th.style.position = "sticky";
            th.style.top = "0";
            th.style.zIndex = "10";
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // ========== CUERPO ==========
        const tbody = document.createElement("tbody");
        
        // Filas
        matriz.forEach((fila, idxFila) => {
            const tr = document.createElement("tr");
            
            // Celda de fila (primera columna) - mostrar el número de fila real
            const tdFila = document.createElement("td");
            tdFila.textContent = filas[idxFila];
            tdFila.style.fontWeight = "bold";
            tdFila.style.backgroundColor = "#f8f8f8";
            tdFila.style.position = "sticky";
            tdFila.style.left = "0";
            tdFila.style.minWidth = "80px";
            tdFila.style.textAlign = "center";
            tdFila.style.zIndex = "5";
            tr.appendChild(tdFila);
            
            // Celdas de datos
            fila.forEach((celda, idxCol) => {
                const td = document.createElement("td");
                td.textContent = celda.valor || "";
                td.style.textAlign = "center";
                td.style.padding = "8px 12px";
                td.style.border = "1px solid #ddd";
                
                // Aplicar color de fondo si no es blanco y tiene valor
                if (celda.color && celda.color !== "255,255,255" && celda.valor) {
                    const rgb = celda.color.split(',').map(Number);
                    if (rgb.length === 3 && !(rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255)) {
                        td.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                        // Calcular color de texto contrastante
                        const luminancia = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
                        td.style.color = luminancia > 128 ? "#000" : "#fff";
                        td.style.fontWeight = "bold";
                    }
                }
                
                // Tooltip con información
                if (celda.valor) {
                    td.title = `Valor: ${celda.valor} | Posición: (${celda.fila}, ${celda.columna})`;
                    td.style.cursor = "help";
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        container.innerHTML = "";
        container.appendChild(table);
        
        // Actualizar estadísticas
        const statsSpan = document.getElementById("info-stats");
        if (statsSpan) {
            const celdasConValor = matriz.reduce((total, fila) => {
                return total + fila.filter(celda => celda.valor && celda.valor !== "").length;
            }, 0);
            
            statsSpan.innerHTML = `${filas.length} filas × ${columnas.length} columnas | ${celdasConValor} celdas con datos`;
            statsSpan.className = "badge";
        }
        
        console.log("✅ Tabla renderizada correctamente");
        
        // Agregar información adicional en el indicador virtual
        const indicator = document.getElementById("virtualScrollIndicator");
        if (indicator) {
            indicator.classList.remove("hidden");
            indicator.innerHTML = `<i class="fas fa-table"></i> Matriz desde (${data.minFila},${data.minCol}) hasta (${data.maxFila},${data.maxCol}) | Total celdas: ${data.totalCeldas.toLocaleString()} | Celdas con datos: ${data.celdasConDatos}`;
        }
        
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
async function cargarDatosPorGen(genName) {
    if (!genName) {
        mostrarMensaje("Por favor, seleccione un gen", "warning");
        return;
    }
    
    if (load) load.hidden = false;
    currentGen = genName;
    localStorage.setItem("lastSelectedGen", genName);
    
    const infoGen = document.getElementById("infoGenActual");
    if (infoGen) {
        infoGen.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> Gen actual: <strong>${genName}</strong> - Cargando datos...`;
        infoGen.style.background = "#e3f2fd";
    }
    
    try {
        // Obtener TODOS los registros del endpoint
        const registros = await obtenerTodosLosRegistros(genName);
        
        if (!registros || registros.length === 0) {
            mostrarMensaje(`No hay datos para el gen ${genName}`, "warning");
            if (load) load.hidden = true;
            if (infoGen) {
                infoGen.innerHTML = `<i class="fas fa-info-circle"></i> Gen actual: <strong>${genName}</strong> - Sin datos`;
                infoGen.style.background = "#fff3cd";
            }
            return;
        }
        
        console.log(`Procesando ${registros.length} registros para ${genName}...`);
        
        // Procesar y renderizar
        const resultado = procesarDatos(registros);
        renderizarTablaExcel(resultado);
        
        if (infoGen) {
            infoGen.innerHTML = `<i class="fas fa-check-circle"></i> Gen actual: <strong>${genName}</strong> - ${resultado.alelos.length} alelos, ${resultado.coordenadas.length} posiciones`;
            infoGen.style.background = "#d4edda";
        }
        
        if (load) load.hidden = true;
        
    } catch (error) {
        if (load) load.hidden = true;
        console.error("Error cargando datos:", error);
        
        let mensajeError = `Error al cargar datos del gen ${genName}: ${error.message}`;
        
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
            infoGen.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${genName}`;
            infoGen.style.background = "#f8d7da";
        }
    }
}

// ============================================
// 6. INICIALIZAR
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("Inicializando tabla SOM...");
    
    // Cargar lista de genes desde el nuevo endpoint
    cargarListaGenes();
    
    // Evento del botón cargar
    const btnCargar = document.getElementById("btnCargar");
    if (btnCargar) {
        btnCargar.addEventListener("click", function() {
            const selectGene = document.getElementById("selectGene");
            const genSeleccionado = selectGene.value;
            if (genSeleccionado) {
                cargarDatosPorGen(genSeleccionado);
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: "warning",
                        title: "Seleccione un gen",
                        text: "Por favor, seleccione un gen de la lista para cargar los datos.",
                        confirmButtonText: "Aceptar"
                    });
                } else {
                    alert("Por favor, seleccione un gen");
                }
            }
        });
    }
    
    // Evento de cambio en select (carga automática)
    const selectGene = document.getElementById("selectGene");
    if (selectGene) {
        selectGene.addEventListener("change", function() {
            if (this.value) {
                cargarDatosPorGen(this.value);
            }
        });
    }
});