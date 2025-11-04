// --- VARIABLES GLOBALES (sin cambios) ---
let chartsCurrentPage = 1;
const chartsItemsPerPage = 12;
let activeGroupIdForCharts = null;
let chartsSearchQuery = '';
let geneChartInstance = null;
let geneStatusData = [];

// Función loadGeneStatusData (sin cambios)
async function loadGeneStatusData() {
    try {
        const response = await fetch('/business-gestion/gene-status/');
        if (!response.ok) throw new Error('Failed to fetch gene status data');
        const data = await response.json();
        geneStatusData = data.results.map(status => ({
            label: status.name,
            color: status.color || '#808080'
        }));
        console.log('Gene status data loaded:', geneStatusData);
        return true;
    } catch (error) {
        console.error('Error loading gene status data:', error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM loaded, initializing...');
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
        console.log('Gene charts section initialized');
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
        console.log('🧹 clearCharts: Destroying previous instance...');
        if (geneChartInstance) {
            // Si la librería tuviera un método destroy, lo llamaríamos aquí.
            // Por ejemplo: geneChartInstance.destroy();
            // Como no estamos seguros, simplemente la anulamos.
            geneChartInstance = null;
        }
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
                    updatePaginationControls({ count: 0, next: null, previous: null });
                }
            })
            .catch((error) => {
                console.error("Error loading chart genes:", error);
                document.getElementById('loading-spinner').classList.add('d-none');
                document.getElementById('error-message').classList.remove('d-none');
                document.getElementById('error-message').textContent = `Error: ${error.message || 'Unknown error'}`;
            });
    }

    // --- CAMBIO CLAVE 2: Lógica más robusta para obtener los datos ---
 
function processAndRenderCharts(genes) {
console.log('✌️genes --->', genes);
    if (!genes || genes.length === 0) return;

    try {
        // 1. Preparar los datos para cada gen individualmente
        const geneData = genes.map(gene => {
            // Procesar los estados para este gen específico
            const statusData = (gene.gene_status_list || [])
                .map(status => {
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
                })
                .filter(item => !isNaN(item.value));

            return {
                name: gene.name,
                statusData: statusData
            };
        });

        // 2. Asegurarse de que la instancia de la librería existe
        if (!geneChartInstance) {
            if (typeof GeneDonutChart !== 'undefined') {
                geneChartInstance = new GeneDonutChart({
                    containerId: 'gene-charts-container',
                    chartWidth: 237,
                    chartHeight: 237,
                    legendTitle: 'Estados de Genes 222',
                    showLegend: false
                });
                console.log('✅ GeneDonutChart instance created.');
            } else {
                console.error("❌ GeneDonutChart library is not loaded.");
                return;
            }
        }

        // 3. Renderizar con los datos específicos de cada gen
        geneChartInstance.render(
            geneData.map(g => g.name),
            geneData.map(g => g.statusData)
        );

        console.log('✅ Renderizado completado con datos específicos por gen.');
        
    } catch (error) {
        console.error('💥 Error al procesar y renderizar gráficas:', error);
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


// function showGenesModal(id) {
//     const $spinner = $('#global-spinner-overlay');
//       $spinner.css('display', 'flex');
//     // Primero obtenemos los estados disponibles
//     fetch('/business-gestion/gene-status/')
//         .then(response => response.json())
//         .then(statusData => {
//             // Una vez que tenemos los estados, obtenemos los genes
//             fetch(`/business-gestion/gene/?groups=${id}`)
//                 .then(response => response.json())
//                 .then(geneData => {
//                     document.getElementById('genesModalLabel').textContent = 'Genomic: Development Stages';
                    
//                     // Destruir la tabla existente si ya está inicializada
//                     if ($.fn.DataTable.isDataTable('#genesTable')) {
//                         $('#genesTable').DataTable().destroy();
//                     }

//                     // Preparar las columnas
//                     const columns = [
//                         { 
//                             title: "Gene",
//                             data: "name"
//                         }
//                     ];

//                     // Agregar una columna para cada estado
//                     statusData.results.forEach(status => {
//                         columns.push({
//                           title: status.name,
//                           data: null,
//                           render: function(data, type, row) {
//                             const statusValue = row.gene_status_list.find(
//                               sl => sl.gene_status === status.name
//                             );
//                             if (statusValue) {
//                               let badgeClass = "bg-secondary";
//                               const percent = parseFloat(statusValue.value);
//                               if (!isNaN(percent)) {
//                                 if (percent >= 0 && percent <= 25) badgeClass = "bg-danger";
//                                 else if (percent >= 26 && percent <= 50) badgeClass = "bg-warning";
//                                 else if (percent >= 51 && percent <= 75) badgeClass = "bg-primary";
//                                 else if (percent > 75 && percent <= 100) badgeClass = "bg-success";
//                               }
//                               const valueWithPercent = `${statusValue.value}%`;

                                
//                                 if (statusValue.evidence) {
//                                 return `
//                                   <span class="badge ${badgeClass}" title="Evidence: ${statusValue.evidence}">${valueWithPercent}</span>
//                                   <button class="btn btn-sm btn-outline-secondary ms-1" title="Download evidence" onclick="downloadEvidence('${encodeURIComponent(statusValue.evidence)}')">
//                                   <i class="bi bi-download"></i>
//                                   </button>
//                                   <div class="progress progress-xs" style="height: 5px; margin-top: 2px;">
//                                   <div class="progress-bar ${badgeClass}" style="width: ${valueWithPercent}"></div>
//                                   </div>
//                                 `;
//                                 }
//                               return `<span class="badge ${badgeClass}">${valueWithPercent}</span> <div class="progress progress-xs" style="height: 5px; margin-top: 2px;">
//                                   <div class="progress-bar ${badgeClass}" style="width: ${valueWithPercent}"></div>
//                                   </div> `;
//                             }
//                             return '<span class="badge bg-secondary">N/A</span>';
//                           }
//                         });
//                     });

//                     // Inicializar DataTable
//                     $('#genesTable')
//                     .addClass("table table-hover")
//                     .DataTable({
//                         dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
//                         data: geneData.results,
//                         columns: columns,
//                         buttons: [
//                             {
//                                 extend: 'excel',
//                                 text: 'Excel'
//                             },
//                             {
//                                 extend: 'pdf',
//                                 text: 'PDF'
//                             },
//                             {
//                                 extend: 'print',
//                                 text: 'Print'
//                             }
//                         ],
                                 
//                         responsive: true,
//                         ordering: true,
//                         searching: true,
//                         paging: true
//                     });
//                     $spinner.css('display', 'none');             
//                     const modal = new bootstrap.Modal(document.getElementById('genesModal'));
//                     modal.show();

//                 });
//         })
//         .catch(error => {
//             $spinner.css('display', 'none');
//             console.error('Error:', error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'Could not load data',
//                 timer: 3000
//             });
//         });
// }


// // La función ya no necesita recibir un 'id'
// function showGenomicDiseasesModal() {
//     const $spinner = $('#global-spinner-overlay');
//     const $table = $('#genomicDiseasesTable');

//     $spinner.css('display', 'flex');

//     if ($.fn.DataTable.isDataTable($table)) {
//         $table.DataTable().destroy();
//         $table.empty();
//     }

//     $('#genesModalLabel').text('Genomic: Associated Disorders');

//     const dataTable = $table.DataTable({
//         serverSide: true,
//         processing: true,
//         dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
//         ajax: {
//             url: '/business-gestion/gene/get-all-info/',
//             type: 'GET',
//             data: function(d) {
//                 // Objeto de datos sin el 'gene_id'.
//                 // El servidor ahora paginará sobre todos los genes.
//                 return {
//                     page_size: d.length,
//                     page: (d.start / d.length) + 1,
//                     search: d.search.value,
//                     ordering: d.order.length ? (d.order[0].dir === 'asc' ? d.columns[d.order[0].column].data : '-' + d.columns[d.order[0].column].data) : null
//                 };
//             },
//             dataSrc: function(json) {
//                 // Esta parte no cambia. Sigue esperando los datos del servidor.
//                 json.recordsTotal = json.count;
//                 json.recordsFiltered = json.count;
//                 return json.results;
//             }
//         },
//         columns: [
//             {
//                 title: "Gene",
//                 data: "name",
//                 className: 'dt-body-center'
//             },
//             {
//                 title: "Disorders by Group",
//                 data: "disorders",
//                 orderable: false,
//                 // La función render no necesita ningún cambio.
//                 render: function(data, type, row) {
//                     if (type === 'display' && Array.isArray(data) && data.length > 0) {
//                         const groupedDisorders = data.reduce((acc, curr) => {
//                             const group = curr.disease_group || 'Uncategorized';
//                             if (!acc[group]) {
//                                 acc[group] = [];
//                             }
//                             acc[group].push(curr);
//                             return acc;
//                         }, {});

//                         return Object.entries(groupedDisorders).map(([group, disorders]) => `
//                             <div class="disorder-group mb-2">
//                                 <strong class="badge bg-primary mb-1">${group}</strong>
//                                 <div class="disorder-items">
//                                     ${disorders.map(d => `
//                                         <div class="disorder-item">
//                                             <span class="badge bg-info text-dark me-1" 
//                                                   style="cursor: pointer;"
//                                                   onclick="showDisorderDetails('${d.name}', '${d.disease_group}', '${d.disease_subgroup}')">
//                                                 ${d.name}
//                                             </span>
//                                         </div>
//                                     `).join('')}
//                                 </div>
//                             </div>
//                         `).join('');
//                     }
//                     return '<span class="badge bg-secondary">None</span>';
//                 }
//             }
//         ],
//         // El resto de la configuración (botones, idioma, etc.) no cambia.
//         buttons: [
//             {
//                 extend: 'excel',
//                 text: 'Excel',
//                 exportOptions: {
//                     columns: [0, 1],
//                     format: {
//                         body: function(data, row, column, node) {
//                             if (column === 1) {
//                                 const temp = document.createElement('div');
//                                 temp.innerHTML = data;
//                                 return Array.from(temp.querySelectorAll('.disorder-group')).map(group => {
//                                     const groupName = group.querySelector('strong').textContent;
//                                     const items = Array.from(group.querySelectorAll('.disorder-item span')).map(item => item.textContent.trim()).join(', ');
//                                     return `${groupName}: ${items}`;
//                                 }).join('\n');
//                             }
//                             return data;
//                         }
//                     }
//                 }
//             },
//             'pdf', 'print'
//         ],
//         language: { processing: "Loading...", search: "Search:", lengthMenu: "Show _MENU_ entries", info: "Showing _START_ to _END_ of _TOTAL_ entries", infoEmpty: "Showing 0 to 0 of 0 entries", paginate: { first: "First", last: "Last", next: "Next", previous: "Previous" } },
//         responsive: true,
//         ordering: true,
//         searching: true,
//         paging: true,
//         pageLength: 10,
//         order: [[0, 'asc']]
//     });
    
//     dataTable.on('preXhr.dt', function () {
//         $spinner.css('display', 'flex');
//     }).on('xhr.dt', function () {
//         $spinner.css('display', 'none');
//     });

//     const modal = new bootstrap.Modal($('#genomicDiseasesModal')[0]);
//     modal.show();
// }

// function showDisorderDetails(name, group, subgroup) {
//     const Toast = Swal.mixin({
//         toast: true,
//         position: 'top-end',
//         showConfirmButton: false,
//         timer: 5000,
//         timerProgressBar: true,
//         didOpen: (toast) => {
//             toast.addEventListener('mouseenter', Swal.stopTimer)
//             toast.addEventListener('mouseleave', Swal.resumeTimer)
//         }
//     });

//     Toast.fire({
//         icon: 'info',
//         title: `${name}`,
//         html: `
//             <div class="mt-2">
//                 <strong>Disease Group:</strong> ${group}<br>
//                 <strong>Disease Subgroup:</strong> ${subgroup}
//             </div>
//         `
//     });
// }
