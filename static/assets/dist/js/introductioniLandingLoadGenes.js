document.addEventListener("DOMContentLoaded", function () {
  // --- 1. DOM ELEMENT REFERENCES (Se mantiene igual) ---
  const container = document.getElementById("gene-buttons-container");
  const geneMatrix = document.getElementById("gene-matrix");
  const matrixTitle = document.getElementById("selected-group-name");
  const searchInput = document.getElementById("gene-search-input");
  const spinner = document.createElement("div");
  spinner.className = "spinner-border spinner-border-sm text-light";
  spinner.setAttribute("role", "status");
  spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
  
  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");

  // --- 2. STATE VARIABLES (Se mantiene igual) ---
  let currentPage = 1;
  const pageSize = 49;
  let activeGroupId = null;
  let searchQuery = '';

  // ... (Funciones 3, 4, 5, 6, 7, 8, 9 se mantienen igual) ...
  
  // --- 3. MAIN LOADING FUNCTION ---
  function loadGroupGenes(groupId, groupName) {
    if (!groupId) return;
    
    activeGroupId = groupId;
    currentPage = 1;
    searchQuery = '';
    searchInput.value = '';

    matrixTitle.textContent = groupName;
    container.innerHTML = '';
    container.appendChild(spinner);
    spinner.style.display = "block";
    paginationControls.classList.add("d-none");

    if (geneMatrix.hasAttribute("hidden")) {
      geneMatrix.removeAttribute("hidden");
    }
    geneMatrix.scrollIntoView({ behavior: 'smooth' });

    fetchAndRenderGenes();
  }

  // --- 4. EVENT LISTENER FOR LOAD BUTTONS ---
  const loadButtons = document.querySelectorAll('.load-genes-btn');
  loadButtons.forEach(button => {
    button.addEventListener('click', function() {
      const groupId = this.dataset.groupId;
      const groupName = this.dataset.groupName;
      loadGroupGenes(groupId, groupName);
    });
  });

  // --- SEARCH INPUT EVENT LISTENER ---
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchQuery = this.value.trim();
      currentPage = 1;
      fetchAndRenderGenes();
    }
  });

  searchInput.addEventListener('search', function() {
      if (this.value === '') {
          searchQuery = '';
          currentPage = 1;
          fetchAndRenderGenes();
      }
  });

  // --- 5. FETCH AND RENDER FUNCTION ---
  function fetchAndRenderGenes() {
    if (!activeGroupId) return;
    let url = `/business-gestion/gene/?groups=${activeGroupId}&page=${currentPage}&page_size=${pageSize}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    axios.get(url)
      .then((response) => {
        spinner.style.display = "none";
        const data = response.data;
        if (data.results && data.results.length > 0) {
          renderGeneButtons(data.results);
            loadGeneCharts(data.results);           
          updatePaginationControls(data);
        } else {
          const noResultsMessage = searchQuery 
            ? `<p class="text-light">No genes found for "${searchQuery}".</p>`
            : '<p class="text-light">No genes found for this group.</p>';
          container.innerHTML = noResultsMessage;
          paginationControls.classList.add("d-none");
        }
      })
      .catch((error) => {
        console.error("Error loading genes:", error);
        spinner.style.display = "none";
        container.innerHTML = '<p class="text-danger">Error loading genes.</p>';
        paginationControls.classList.add("d-none");
      });
  }

  // --- 6. FUNCTION TO RENDER GENE BUTTONS ---
function renderGeneButtons(genes) {
    container.innerHTML = '';
    genes.forEach((gene) => {
        const button = document.createElement("button");
        button.className = "btn btn-outline-light gene-btn";
        button.textContent = gene.name;
        button.addEventListener("click", () => showGeneDetails(gene));
        container.appendChild(button);
        // Añade esta línea para cargar también las gráficas
   
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


  // --- 8. FUNCTION TO UPDATE PAGINATION ---
  function updatePaginationControls(data) {
    paginationControls.classList.remove("d-none");
    pageInfo.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = !data.previous;
    nextPageBtn.disabled = !data.next;
  }

  // --- 9. PAGINATION EVENT LISTENERS ---
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndRenderGenes();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchAndRenderGenes();
  });



////------------------------------------
// Variables globales para la paginación de GRÁFICAS
// NOTA: Se ha renombrado 'itemsPerPage' a 'chartsItemsPerPage' para evitar conflictos.
let chartsCurrentPage = 1;
const chartsItemsPerPage = 10; // Usaremos esta constante
let allGenes = [];
let filteredGenes = [];
let geneChartInstance = null;
let geneStatusData = []; // <-- NUEVA VARIABLE GLOBAL para el statusData

// Función para inicializar la sección de gráficas
function initGeneChartsSection() {
    // Crear el contenedor para la nueva sección
    const chartsSection = document.createElement('div');
    chartsSection.id = 'gene-charts-section';
    chartsSection.className = 'container mt-5';
    
    // Añadir el HTML de la sección
    chartsSection.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2 class="text-center">Visualización de Genes</h2>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div class="form-group">
                        <input type="text" id="gene-search-charts" class="form-control" placeholder="Buscar genes...">
                    </div>
                    <div class="form-group">
                        <select id="items-per-page-charts" class="form-control">
                            <option value="10">10 por página</option>
                            <option value="20">20 por página</option>
                            <option value="50">50 por página</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div id="gene-charts-container" class="d-flex justify-content-center flex-wrap"></div>
                <div id="charts-pagination" class="d-flex justify-content-center mt-4"></div>
            </div>
        </div>
    `;
    
    // Añadir la sección al cuerpo del documento
    document.body.appendChild(chartsSection);
    
    // Configurar eventos
    document.getElementById('gene-search-charts').addEventListener('input', handleSearchCharts);
    document.getElementById('items-per-page-charts').addEventListener('change', handleItemsPerPageChange);
    
    // Inicializar la instancia de GeneDonutChart
    // NOTA: Asegúrate de que la librería GeneDonutChart esté cargada antes de este script.
    geneChartInstance = new GeneDonutChart({
        containerId: 'gene-charts-container',
        chartWidth: 200,
        chartHeight: 200,
        legendTitle: 'Estados de Genes'
    });
}

// Función para cargar y mostrar los genes en gráficas
function loadGeneCharts(genes) {
    allGenes = genes;
    filteredGenes = [...allGenes];
    chartsCurrentPage = 1;
    
    // Extraer datos de estado del primer gen (asumiendo que todos tienen la misma estructura)
    const statusData = allGenes.length > 0 && allGenes[0].gene_status_list ? 
        allGenes[0].gene_status_list.map(status => {
            const v = parseFloat(status.value);
            let color = "#6c757d";
            if (!isNaN(v)) {
                if (v <= 25) color = "#dc3545";
                else if (v <= 50) color = "#ffc107";
                else if (v <= 75) color = "#17a2b8";
                else color = "#28a745";
            }
            
            return {
                label: status.gene_status,
                value: v,
                color: color
            };
        }) : [];
    
    // ALMACENAR GLOBALMENTE el statusData
    geneStatusData = statusData; 
    
    // Renderizar la página actual
    renderChartsPage(); // <-- Llamada sin argumento
}

// Función para renderizar la página actual de gráficas
function renderChartsPage() { // <-- Eliminado el argumento statusData
    // Calcular índices para la paginación
    const itemsPerPage = parseInt(document.getElementById('items-per-page-charts').value || chartsItemsPerPage);
    const startIndex = (chartsCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageGenes = filteredGenes.slice(startIndex, endIndex);
    
    // Extraer solo los nombres de los genes para esta página
    const geneNames = pageGenes.map(gene => gene.name);
    
    // Renderizar las gráficas con los genes de esta página
    // Usamos la variable global geneStatusData
    geneChartInstance.render(geneNames, geneStatusData);
    
    // Renderizar controles de paginación
    renderPaginationControls();
}

// Función para renderizar los controles de paginación
function renderPaginationControls() {
    const paginationContainer = document.getElementById('charts-pagination');
    paginationContainer.innerHTML = '';
    
    const itemsPerPage = parseInt(document.getElementById('items-per-page-charts').value || chartsItemsPerPage);
    const totalPages = Math.ceil(filteredGenes.length / itemsPerPage);
    
    if (totalPages <= 1) return;
    
    // Crear contenedor de paginación
    const pagination = document.createElement('nav');
    pagination.setAttribute('aria-label', 'Navegación de páginas');
    
    const paginationList = document.createElement('ul');
    paginationList.className = 'pagination';
    
    // Botón anterior
    const prevItem = createPaginationItem('Anterior', chartsCurrentPage > 1 ? () => {
        chartsCurrentPage--;
        renderChartsPage();
    } : null, chartsCurrentPage === 1);
    paginationList.appendChild(prevItem);
    
    // Números de página
    let startPage = Math.max(1, chartsCurrentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    if (startPage > 1) {
        paginationList.appendChild(createPaginationItem('1', () => {
            chartsCurrentPage = 1;
            renderChartsPage();
        }));
        
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationList.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationList.appendChild(createPaginationItem(i.toString(), () => {
            chartsCurrentPage = i;
            renderChartsPage();
        }, i === chartsCurrentPage));
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationList.appendChild(ellipsis);
        }
        
        paginationList.appendChild(createPaginationItem(totalPages.toString(), () => {
            chartsCurrentPage = totalPages;
            renderChartsPage();
        }));
    }
    
    // Botón siguiente
    const nextItem = createPaginationItem('Siguiente', chartsCurrentPage < totalPages ? () => {
        chartsCurrentPage++;
        renderChartsPage();
    } : null, chartsCurrentPage === totalPages);
    paginationList.appendChild(nextItem);
    
    pagination.appendChild(paginationList);
    paginationContainer.appendChild(pagination);
}

// Función auxiliar para crear elementos de paginación
function createPaginationItem(text, onClick, disabled = false) {
    const item = document.createElement('li');
    item.className = `page-item ${disabled ? 'disabled' : ''}`;
    
    const link = document.createElement('a');
    link.className = 'page-link';
    link.href = '#';
    link.textContent = text;
    
    if (onClick && !disabled) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            onClick();
        });
    }
    
    item.appendChild(link);
    return item;
}

// Función para manejar la búsqueda
function handleSearchCharts() {
    const searchTerm = document.getElementById('gene-search-charts').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredGenes = [...allGenes];
    } else {
        filteredGenes = allGenes.filter(gene => 
            gene.name.toLowerCase().includes(searchTerm)
        );
    }
    
    chartsCurrentPage = 1;
    renderChartsPage();
}

// Función para manejar el cambio de elementos por página
function handleItemsPerPageChange() {
    const newItemsPerPage = parseInt(document.getElementById('items-per-page-charts').value);
    
    if (newItemsPerPage !== chartsItemsPerPage) {
        // Recalcular la página actual
        chartsCurrentPage = 1; // Reiniciar a la primera página tras cambiar el tamaño
        
        // Volver a renderizar
        renderChartsPage();
    }
}







/////---------------------------------
initGeneChartsSection();
    
    // Para pruebas, puedes usar datos de ejemplo:
    const exampleGenes = [
        { name: 'GENE1', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE2', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE3', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE4', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE5', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE6', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE7', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE8', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE9', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE10', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE11', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        // Añade más genes de prueba para que la paginación funcione
        { name: 'GENE12', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE13', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE14', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE15', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE16', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE17', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE18', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE19', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE20', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE21', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE22', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE23', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
        { name: 'GENE24', gene_status_list: [{ gene_status: 'Estado 1', value: 25 }, { gene_status: 'Estado 2', value: 35 }, { gene_status: 'Estado 3', value: 40 }] },
    ];
    
    // Cargar los datos de ejemplo
//      loadGeneCharts(exampleGenes);
});
