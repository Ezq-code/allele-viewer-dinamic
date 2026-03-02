// --- VARIABLES GLOBALES (sin cambios) ---
let chartsCurrentPage = 1;
const chartsItemsPerPage = 12;
let activeGroupIdForCharts = null;
let chartsSearchQuery = '';
let geneStatusData = [];

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

    const geneStatusSummaryContainer = document.getElementById('gene-status-summary-container');
    if (geneStatusSummaryContainer) {
        geneStatusSummaryContainer.addEventListener('click', function(event) {
            const geneElement = event.target.closest('.gene-donut-chart-center, .radial-chart-item');
            if (!geneElement) return;

            const geneName = geneElement.getAttribute('data-gene-name');
            if (!geneName) return;

            const genes = window.currentGenes || [];
            const targetGene = genes.find(g => g.name === geneName);
            if (!targetGene) {
                Toast.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `No gene information found for ${geneName}`
                });
                return;
            }

            showGeneDetails(targetGene);
            $('#genesModal').modal('show');
        });
    }
    
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
        if (typeof window.clearRadialStatusCharts === 'function') {
            window.clearRadialStatusCharts();
        }
        toggleStatusSummarySection(false);
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

        // 4. Preparar metadatos para tooltips de D3
        const statusMetaMap = {};
        geneStatusData.forEach(status => {
            statusMetaMap[status.label] = {
                description: status.description || '',
                type: status.type || '',
                requires_evidence: !!status.requires_evidence
            };
        });

        renderStatusSummaryChart(genes, statusColorMap, statusMetaMap);

        
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

    const statusList = gene.gene_status_list || [];
    const disorders = Array.isArray(gene.disorders_names) && gene.disorders_names.length > 0
        ? gene.disorders_names
        : (Array.isArray(gene.disorders) ? gene.disorders : []);

    let dashboardHtml = `
        <div class="card card-outline card-primary mb-4">
            <div class="card-body">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                        <h4 class="mb-1">${gene.name}</h4>
                        <p class="text-muted mb-2 mb-md-0">${gene.description || 'No description available for this gene.'}</p>
                    </div>
                    <div class="d-flex mt-2 mt-md-0">
                        <span class="badge badge-info mr-2 p-2">Statuses: ${statusList.length}</span>
                        <span class="badge badge-primary p-2">Disorders: ${disorders.length}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-outline card-secondary mb-4">
            <div class="card-header">
                <h3 class="card-title mb-0"><i class="bi bi-activity mr-2"></i>Gene Status Overview</h3>
            </div>
            <div class="card-body">
                <div class="row">
    `;

    if (statusList.length > 0) {
        statusList.forEach((status) => {
            const percent = parseFloat(status.value);
            let knobColor = '#6c757d';
            if (!isNaN(percent)) {
                if (percent >= 0 && percent <= 25) knobColor = '#dc3545';
                else if (percent >= 26 && percent <= 50) knobColor = '#ffc107';
                else if (percent >= 51 && percent <= 75) knobColor = '#17a2b8';
                else if (percent > 75 && percent <= 100) knobColor = '#28a745';
            }

            dashboardHtml += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center d-flex flex-column justify-content-between">
                            <div>
                                <input type="text" class="knob mb-2" value="${status.value}"
                                    data-width="110" data-height="110" data-fgColor="${knobColor}"
                                    data-thickness=".2" data-readOnly="true" data-angleOffset="-125" data-angleArc="250">
                                <h6 class="mb-1 font-weight-bold">${status.gene_status}</h6>
                            </div>
                            <div class="mt-2">
                                ${status.evidence ? `
                                    <button class="btn btn-sm btn-outline-primary" data-toggle="tooltip" data-placement="top"
                                        title="Download Evidence"
                                        onclick="downloadEvidence('${encodeURIComponent(status.evidence)}')">
                                        <i class="bi bi-download mr-1"></i>Evidence
                                    </button>
                                ` : '<span class="text-muted small">No evidence file</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        dashboardHtml += `
            <div class="col-12">
                <div class="alert alert-light border text-center mb-0">
                    No status information available for this gene.
                </div>
            </div>
        `;
    }

    dashboardHtml += `
                </div>
            </div>
        </div>
    `;

    if (disorders.length > 0) {
        dashboardHtml += `
            <div class="card card-outline card-primary mb-2">
                <div class="card-header">
                    <h3 class="card-title mb-0"><i class="bi bi-clipboard2-pulse mr-2"></i>Associated Disorders</h3>
                </div>
                <div class="card-body">
                    <div class="d-flex flex-wrap">
                        ${disorders.map((disorder, index) => {
                            const badgeClasses = ['badge-info', 'badge-success', 'badge-warning', 'badge-danger', 'badge-primary', 'badge-secondary'];
                            const badgeClass = badgeClasses[index % badgeClasses.length];
                            return `
                                <span class="badge ${badgeClass} mr-2 mb-2 p-2" style="font-size: 0.85rem;">
                                    ${disorder || 'Unnamed disorder'}
                                </span>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        dashboardHtml += `
            <div class="card card-outline card-secondary mb-2">
                <div class="card-body text-center text-muted">
                    No associated disorders reported for this gene.
                </div>
            </div>
        `;
    }

    dashboardContainer.innerHTML = dashboardHtml;
    $('#genesModal').modal('show');

    $('#genesModal').off('shown.bs.modal').on('shown.bs.modal', function () {
        $('.knob').knob();
        $('[data-toggle="tooltip"]').tooltip();
    });
}