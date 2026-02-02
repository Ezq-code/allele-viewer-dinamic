// --- VARIABLES GLOBALES (sin cambios) ---
let chartsCurrentPage = 1;
const chartsItemsPerPage = 12;
let activeGroupIdForCharts = null;
let chartsSearchQuery = '';
let geneChartInstance = null;
let geneStatusData = [];
let statusSummaryCharts = [];

// Función loadGeneStatusData (sin cambios)
async function loadGeneStatusData() {
    try {
        const response = await fetch('/business-gestion/gene-status/');
        if (!response.ok) throw new Error('Failed to fetch gene status data');
        const data = await response.json();
        geneStatusData = data.results.map(status => ({
            label: status.name,
            color: status.color || '#808080',
            description: status.description || '',
            type: status.type || '',
            requires_evidence: !!status.requires_evidence
        }));
        return true;
    } catch (error) {
        console.error('Error loading gene status data:', error);
        return false;
    }
}

// Función manejadora global para los clics en botones de genes
function handleGeneButtonClick(event) {
    const button = event.target.closest('.load-info-genes-btn');
    if (!button) return;
    
    const geneName = button.getAttribute('data-gene-name');
    
    // Obtener los datos del gen del caché
    const genes = window.currentGenes || [];
    const targetGene = genes.find(g => g.name === geneName);
    
    if (targetGene) {
        showGeneDetails(targetGene);
        $('#genesModal').modal('show');
    } else {
        console.error('❌ Gen no encontrado:', geneName);
        Toast.fire({
            icon: 'error',
            title: 'Error',
            text: `No se encontró información para el gen ${geneName}`
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadGeneStatusData();
    initializeGeneChartsSection();
    
    const loadButtons = document.querySelectorAll('.load-genes-btn');
    loadButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const groupId = this.dataset.groupId;
            const groupName = this.dataset.groupName;
            document.getElementById('selected-group-name').textContent = groupName;
            document.getElementById('gene-charts-section').hidden = false;
            document.getElementById('gene-charts-section').scrollIntoView({ behavior: 'smooth' });
            await loadChartsForGroup(groupId);
        });
    });

    document.getElementById('gene-search-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            chartsSearchQuery = this.value.trim();
            chartsCurrentPage = 1;
            fetchAndRenderCharts();
        }
    });

    document.getElementById('gene-search-input').addEventListener('search', function() {
        if (this.value === '') {
            chartsSearchQuery = '';
            chartsCurrentPage = 1;
            fetchAndRenderCharts();
        }
    });

    document.getElementById('prev-page-btn').addEventListener('click', function() {
        if (chartsCurrentPage > 1) {
            chartsCurrentPage--;
            fetchAndRenderCharts();
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', function() {
        chartsCurrentPage++;
        fetchAndRenderCharts();
    });

    function initializeGeneChartsSection() {
        // La instancia se creará bajo demanda en processAndRenderCharts
        updateLegend();
    }

    function loadChartsForGroup(groupId) {
        if (!groupId) return;
        activeGroupIdForCharts = groupId;
        chartsCurrentPage = 1;
        chartsSearchQuery = '';
        document.getElementById('gene-search-input').value = '';
        clearCharts();
        fetchAndRenderCharts();
    }

    // --- CAMBIO CLAVE 1: Limpiar la instancia de forma más segura ---
    function clearCharts() {
        if (geneChartInstance) {
            // Si la librería tuviera un método destroy, lo llamaríamos aquí.
            // Por ejemplo: geneChartInstance.destroy();
            // Como no estamos seguros, simplemente la anulamos.
            geneChartInstance = null;
        }
        if (typeof window.clearRadialStatusCharts === 'function') {
            window.clearRadialStatusCharts();
        }
        toggleStatusSummarySection(false);
        // Limpiamos el contenedor HTML para empezar de cero.
        document.getElementById('gene-charts-container').innerHTML = '';
    }

    function fetchAndRenderCharts() {
        document.getElementById('loading-spinner').classList.remove('d-none');
        document.getElementById('error-message').classList.add('d-none');
        
        let url = `/business-gestion/gene/?groups=${activeGroupIdForCharts}&page=${chartsCurrentPage}&page_size=${chartsItemsPerPage}`;
        if (chartsSearchQuery) {
            url += `&search=${encodeURIComponent(chartsSearchQuery)}`;
        }

        axios.get(url)
            .then((response) => {
                const data = response.data;
                document.getElementById('loading-spinner').classList.add('d-none');
                
                if (data.results && data.results.length > 0) {
                    processAndRenderCharts(data.results);
                    updatePaginationControls(data);
                } else {
                    document.getElementById('gene-charts-container').innerHTML = `<p class="text-muted w-100 text-center">No se encontraron genes para visualizar.</p>`;
                    toggleStatusSummarySection(false);
                    updatePaginationControls({ count: 0, next: null, previous: null });
                }
            })
            .catch((error) => {
                console.error("Error loading chart genes:", error);
                document.getElementById('loading-spinner').classList.add('d-none');
                document.getElementById('error-message').classList.remove('d-none');
                document.getElementById('error-message').textContent = `Error: ${error.message || 'Unknown error'}`;
                toggleStatusSummarySection(false);
            });
    }

    function toggleStatusSummarySection(show) {
        const section = document.getElementById('gene-status-summary-section');
        if (!section) return;
        section.hidden = !show;
    }

    function renderStatusSummaryChart(genes, statusColorMap, statusMetaMap) {
        if (typeof window.renderRadialStatusCharts !== 'function') {
            console.error('❌ renderRadialStatusCharts no está disponible.');
            toggleStatusSummarySection(false);
            return;
        }

        const hasData = genes && genes.length > 0 && statusColorMap && Object.keys(statusColorMap).length > 0;
        if (!hasData) {
            toggleStatusSummarySection(false);
            return;
        }

        window.renderRadialStatusCharts(genes, statusColorMap, statusMetaMap);
        toggleStatusSummarySection(true);
    }

    // --- CAMBIO CLAVE 2: Lógica más robusta para obtener los datos ---
 
function processAndRenderCharts(genes) {
    if (!genes || genes.length === 0) return;
    
    // Guardar los genes en una variable global para acceso posterior
    window.currentGenes = genes;

    try {
        // --- INICIO DE LA LÓGICA DE COLORES DINÁMICOS ---

        // 1. Recopilar todos los nombres de estado únicos de todos los genes
        const allStatusNames = new Set();
        genes.forEach(gene => {
            if (gene.gene_status_list && Array.isArray(gene.gene_status_list)) {
                gene.gene_status_list.forEach(status => {
                    if (status.gene_status) {
                        allStatusNames.add(status.gene_status);
                    }
                });
            }
        });
        // 2. Definir una paleta de colores amplia y variada
        const colorPalette = [
            '#FF1744', '#FF9100', '#FFD600', '#00E676', '#00B0FF',
            '#2979FF', '#651FFF', '#D500F9', '#F50057', '#FF5252',
            '#FF6D00', '#C6FF00', '#1DE9B6', '#00E5FF', '#448AFF',
            '#7C4DFF', '#E040FB', '#FF4081', '#FF8A80', '#FFD180',
            '#FFFF8D', '#B9F6CA', '#80D8FF', '#82B1FF', '#B388FF'
        ];

        // 3. Crear el mapa de colores asignando un color a cada estado único
        const statusColorMap = {};
        Array.from(allStatusNames).forEach((statusName, index) => {
            statusColorMap[statusName] = colorPalette[index % colorPalette.length];
        });
        // --- FIN DE LA LÓGICA DE COLORES DINÁMICOS ---

        // 4. Preparar los datos para cada gen usando el mapa de colores
        const geneData = genes.map(gene => {
            // Procesar los estados para este gen específico
            const statusData = (gene.gene_status_list || [])
                .map(status => {
                    const v = parseFloat(status.value);                    
                    // NOTA: Se reemplaza la lógica anterior de colores fijos.
                    // Ahora se busca directamente en nuestro mapa dinámico.
                    // Si por alguna razón un estado no está en el mapa, se usa un color gris por defecto.
                    const color = statusColorMap[status.gene_status] || '#CCCCCC';

                    const updated_since =status.updated_since;

                    
                    return {
                        label: status.gene_status,
                        value: v,
                        color: color,
                        updated_since: updated_since
                    };
                })
                .filter(item => !isNaN(item.value));

            return {
                name: gene.name,
                statusData: statusData
            };
        });

        // 5. Asegurarse de que la instancia de la librería existe
        if (!geneChartInstance) {
            if (typeof GeneDonutChart !== 'undefined') {
                geneChartInstance = new GeneDonutChart({
                    containerId: 'gene-charts-container',
                    chartWidth: 237,
                    chartHeight: 237,
                    legendTitle: 'Estados de Genes 222',
                    showLegend: false
                });
              } else {
                console.error("❌ GeneDonutChart library is not loaded.");
                return;
            }
        }

        // 6. Renderizar con los datos específicos de cada gen
        geneChartInstance.render(
            geneData.map(g => g.name),
            geneData.map(g => g.statusData)
        );

        const statusMetaMap = {};
        geneStatusData.forEach(status => {
            statusMetaMap[status.label] = {
                description: status.description || '',
                type: status.type || '',
                requires_evidence: !!status.requires_evidence
            };
        });

        renderStatusSummaryChart(genes, statusColorMap, statusMetaMap);
        // 7. Configurar listeners para botones y gráficas
        const chartsContainer = document.getElementById('gene-charts-container');
        
        // Remover listeners previos para evitar duplicados
        chartsContainer.removeEventListener('click', handleGeneButtonClick);
        chartsContainer.removeEventListener('gene-chart-click', handleChartClick);
        
        // Función para manejar clics en la gráfica
        function handleChartClick(event) {
            const geneName = event.detail.geneName;            
            const targetGene = genes.find(g => g.name === geneName);
            if (targetGene) {
                showGeneDetails(targetGene);
                $('#genesModal').modal('show');
            }
        }
        
        // Agregar los nuevos listeners
        chartsContainer.addEventListener('click', handleGeneButtonClick);
        chartsContainer.addEventListener('gene-chart-click', handleChartClick);

        
    } catch (error) {
        document.getElementById('error-message').classList.remove('d-none');
        document.getElementById('error-message').textContent = 
            `Error rendering charts: ${error.message}`;
    }
}
    
    function updateLegend() {
        const legendContainer = document.querySelector('#gene-legend-container .d-flex');
        if (!legendContainer) return;
        legendContainer.innerHTML = '';
        if (geneStatusData.length === 0) return;
        
        geneStatusData.forEach(status => {
            const legendItem = document.createElement('div');
            legendItem.className = 'd-flex align-items-center';
            const colorBox = document.createElement('div');
            colorBox.style.width = '16px'; colorBox.style.height = '16px';
            colorBox.style.backgroundColor = status.color; colorBox.style.marginRight = '8px'; colorBox.style.borderRadius = '3px';
            const label = document.createElement('span');
            label.textContent = status.label; label.className = 'text-light';
            legendItem.appendChild(colorBox); legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
    }
    
    function updatePaginationControls(data) {
        const totalPages = Math.ceil(data.count / chartsItemsPerPage) || 1;
        document.getElementById('current-page').textContent = chartsCurrentPage;
        document.getElementById('total-pages').textContent = totalPages;
        document.getElementById('prev-page-btn').disabled = !data.previous;
        document.getElementById('next-page-btn').disabled = !data.next;
    }

    window.loadChartsForGroup = loadChartsForGroup;
});

//---------------------------------



function downloadEvidence(evidencePath) {
    if (!evidencePath) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No evidence available for download',
            timer: 3000
        });
        return;
    }

    const decodedPath = decodeURIComponent(evidencePath);

    // Validate URL
    try {
        new URL(decodedPath);
    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid evidence URL',
            timer: 3000
        });
        return;
    }

    Swal.fire({
        title: 'Downloading...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(decodedPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Download error');
            }
            // Get content type from server
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            // Get filename from Content-Disposition header if exists
            const contentDisposition = response.headers.get('content-disposition');
            let fileName = 'evidence';
            
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            } else {
                // If no Content-Disposition, try to get name from path
                fileName = decodedPath.split('/').pop() || fileName;
            }

            return response.blob().then(blob => ({
                blob: new Blob([blob], { type: contentType }),
                fileName: fileName
            }));
        })
        .then(({ blob, fileName }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire({
                icon: 'success',
                title: 'Download Complete',
                text: 'File has been downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch(error => {
            console.error('Download error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Download Error',
                text: error.message || 'Could not download evidence file',
                timer: 3000
            });
        });
}


// --- 7. NEW FUNCTION TO SHOW DETAILS IN BOOTSTRAP MODAL ---
function showGeneDetails(gene) {
    const modalTitle = document.getElementById('genesModalLabel');
    const dashboardContainer = document.getElementById('gene-dashboard-container');
    dashboardContainer.innerHTML = '';
    modalTitle.textContent = `Details for ${gene.name}`;

    let dashboardHtml = `
            <div class="row mb-4">
                    <div class="col-md-12">
                            ${gene.description ? `<p>${gene.description}</p>` : ''}
                    </div>
            </div>`;

    // Status section with donut chart
    dashboardHtml += `<div class="row">`;
    const statusList = gene.gene_status_list || [];
    
    if (statusList.length > 0) {
        // Add donut chart container
        dashboardHtml += `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Status Overview</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <canvas id="geneStatusChart" width="400" height="400"></canvas>
                            </div>
                            <div class="col-md-6">
                                <div id="chartLegend" class="mt-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Individual status items with knobs
        statusList.forEach((status) => {
            const percent = parseFloat(status.value);
            let knobColor = "#6c757d";
            if (!isNaN(percent)) {
                if (percent >= 0 && percent <= 25) knobColor = "#dc3545";
                else if (percent >= 26 && percent <= 50) knobColor = "#ffc107";
                else if (percent >= 51 && percent <= 75) knobColor = "#17a2b8";
                else if (percent > 75 && percent <= 100) knobColor = "#28a745";
            }

            dashboardHtml += `
                    <div class="col-md-6 col-lg-4 mb-4 text-center">
                            <input type="text" class="knob mb-2" value="${status.value}" 
                                         data-width="100" data-height="100" data-fgColor="${knobColor}" 
                                         data-thickness=".2" data-readOnly="true" data-angleOffset="-125" data-angleArc="250">
                            <h6 class="mb-1">${status.gene_status}</h6>
                            ${status.evidence ? `
                                    <button class="btn btn-sm btn-outline-secondary" data-toggle="tooltip" data-placement="top" 
                                                    title="Download Evidence" 
                                                    onclick="downloadEvidence('${encodeURIComponent(status.evidence)}')">
                                            <i class="bi bi-download"></i>
                                    </button>
                            ` : ''}
                    </div>
            `;
        });
    } else {
        dashboardHtml += `
                <div class="col-12">
                        <p class="text-muted">No status information available for this gene.</p>
                </div>
        `;
    }
    
    // Add disorders section if they exist
    if (gene.disorders && gene.disorders.length > 0) {
        dashboardHtml += `
        <div class="row mb-4">
                <div class="col-12">
                        <div class="card card-primary">
                                <div class="card-header">
                                        <h3 class="card-title">Associated Disorders</h3>
                                </div>
                                <div class="card-body">
                                        <div class="row">
                                                ${gene.disorders.map((disorder, index) => {
                                                    // Array of Bootstrap background classes
                                                    const bgColors = ['bg-info', 'bg-success', 'bg-warning', 'bg-danger', 'bg-primary', 'bg-secondary'];
                                                    // Get color by index, cycling through the array
                                                    const bgColor = bgColors[index % bgColors.length];
                                                    
                                                    return `
                                                        <div class="col-md-4">
                                                                <div class="info-box ${bgColor}">
                                                                        <span class="info-box-icon">
                                                                                <i class="bi bi-clipboard2-pulse"></i>
                                                                        </span>
                                                                        <div class="info-box-content">
                                                                                ${disorder ? 
                                                                                    `<span class="info-box-number">${disorder}</span>` : 
                                                                                    ''}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                    `;
                                                }).join('')}
                                        </div>
                                </div>
                        </div>
                </div>
        </div>`;
    }
    dashboardHtml += `</div>`;

    dashboardContainer.innerHTML = dashboardHtml;
    $('#genesModal').modal('show');

    $('#genesModal').on('shown.bs.modal', function () {
        $('.knob').knob();
        $('[data-toggle="tooltip"]').tooltip();
        
        // Create donut chart if there's status data
        if (statusList.length > 0) {
            try {
                // Prepare data for the chart
                const labels = statusList.map(s => s.gene_status || '');
                const data = statusList.map(s => {
                    const v = parseFloat(s.value);
                    return isNaN(v) ? 0 : v;
                });
                const backgroundColors = statusList.map(s => {
                    const v = parseFloat(s.value);
                    if (isNaN(v)) return '#6c757d';
                    if (v <= 25) return '#dc3545';
                    if (v <= 50) return '#ffc107';
                    if (v <= 75) return '#17a2b8';
                    return '#28a745';
                });
                
                // Create the chart (Chart.js)
                const ctx = document.getElementById('geneStatusChart').getContext('2d');
                const geneStatusChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: backgroundColors,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                         plugins: {
      legend: {
        display: false // Oculta la leyenda (colores y etiquetas)
      },
      tooltip: {
        enabled: false // Desactiva los tooltips al pasar el ratón
      },
      title: {
        display: false // Desactiva el título del gráfico si lo hubiera
      }
    }
                    }
                });
                
                // Create custom legend
                const legendContainer = document.getElementById('chartLegend');
                let legendHtml = '<h5>Status Breakdown</h5><div class="mt-3">';
                
                statusList.forEach((status, index) => {
                    const percent = parseFloat(status.value);
                    let color = "#6c757d";
                    if (!isNaN(percent)) {
                        if (percent >= 0 && percent <= 25) color = "#dc3545";
                        else if (percent >= 26 && percent <= 50) color = "#ffc107";
                        else if (percent >= 51 && percent <= 75) color = "#17a2b8";
                        else if (percent > 75 && percent <= 100) color = "#28a745";
                    }
                    
                    legendHtml += `
                        <div class="d-flex align-items-center mb-2">
                            <div style="width: 20px; height: 20px; background-color: ${color}; margin-right: 10px; border-radius: 3px;"></div>
                            <span>${status.gene_status}: ${status.value}%</span>
                        </div>
                    `;
                });
                
                legendHtml += '</div>';
                legendContainer.innerHTML = legendHtml;
                
                // Store chart reference for cleanup
                if (!window._modalChartsRegistry) {
                    window._modalChartsRegistry = {};
                }
                window._modalChartsRegistry['geneStatusChart'] = geneStatusChart;
                
            } catch (err) {
                console.error('Error creating gene status chart', err);
            }
        }
    });
    
    // Clean up charts when modal is hidden
    $('#genesModal').on('hidden.bs.modal', function () {
        if (window._modalChartsRegistry) {
            Object.values(window._modalChartsRegistry).forEach(chart => {
                try { chart.destroy(); } catch (e) {}
            });
            window._modalChartsRegistry = {};
        }
    });
}