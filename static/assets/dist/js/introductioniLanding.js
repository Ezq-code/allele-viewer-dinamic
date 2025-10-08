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

function showGenesModal(id) {
    // Primero obtenemos los estados disponibles
    fetch('/business-gestion/gene-status/')
        .then(response => response.json())
        .then(statusData => {
            // Una vez que tenemos los estados, obtenemos los genes
            fetch(`/business-gestion/gene/?groups=${id}`)
                .then(response => response.json())
                .then(geneData => {
                    document.getElementById('genesModalLabel').textContent = 'Genomic: Development Stages';
                    
                    // Destruir la tabla existente si ya está inicializada
                    if ($.fn.DataTable.isDataTable('#genesTable')) {
                        $('#genesTable').DataTable().destroy();
                    }

                    // Preparar las columnas
                    const columns = [
                        { 
                            title: "Gene",
                            data: "name"
                        }
                    ];

                    // Agregar una columna para cada estado
                    statusData.results.forEach(status => {
                        columns.push({
                          title: status.name,
                          data: null,
                          render: function(data, type, row) {
                            const statusValue = row.gene_status_list.find(
                              sl => sl.gene_status === status.name
                            );
                            if (statusValue) {
                              let badgeClass = "bg-secondary";
                              const percent = parseFloat(statusValue.value);
                              if (!isNaN(percent)) {
                                if (percent >= 0 && percent <= 25) badgeClass = "bg-danger";
                                else if (percent >= 26 && percent <= 50) badgeClass = "bg-warning";
                                else if (percent >= 51 && percent <= 75) badgeClass = "bg-primary";
                                else if (percent > 75 && percent <= 100) badgeClass = "bg-success";
                              }
                              const valueWithPercent = `${statusValue.value}%`;

                                
                                if (statusValue.evidence) {
                                return `
                                  <span class="badge ${badgeClass}" title="Evidence: ${statusValue.evidence}">${valueWithPercent}</span>
                                  <button class="btn btn-sm btn-outline-secondary ms-1" title="Download evidence" onclick="downloadEvidence('${encodeURIComponent(statusValue.evidence)}')">
                                  <i class="bi bi-download"></i>
                                  </button>
                                  <div class="progress progress-xs" style="height: 5px; margin-top: 2px;">
                                  <div class="progress-bar ${badgeClass}" style="width: ${valueWithPercent}"></div>
                                  </div>
                                `;
                                }
                              return `<span class="badge ${badgeClass}">${valueWithPercent}</span> <div class="progress progress-xs" style="height: 5px; margin-top: 2px;">
                                  <div class="progress-bar ${badgeClass}" style="width: ${valueWithPercent}"></div>
                                  </div> `;
                            }
                            return '<span class="badge bg-secondary">N/A</span>';
                          }
                        });
                    });

                    // Inicializar DataTable
                    $('#genesTable')
                    .addClass("table table-hover")
                    .DataTable({
                        dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
                        data: geneData.results,
                        columns: columns,
                        buttons: [
                            {
                                extend: 'excel',
                                text: 'Excel'
                            },
                            {
                                extend: 'pdf',
                                text: 'PDF'
                            },
                            {
                                extend: 'print',
                                text: 'Imprimir'
                            }
                        ],
                                               
                        responsive: true,
                        ordering: true,
                        searching: true,
                        paging: true
                    });

                    const modal = new bootstrap.Modal(document.getElementById('genesModal'));
                    modal.show();
                });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos',
                timer: 3000
            });
        });
}
function showGenomicDiseasesModal2(id) {
    document.getElementById('global-spinner-overlay').style.display = 'flex';
    
    if ($.fn.DataTable.isDataTable('#genomicDiseasesTable')) {
        $('#genomicDiseasesTable').DataTable().destroy();
    }

    document.getElementById('genesModalLabel').textContent = 'Genomic: Associated Disorders';

    $('#genomicDiseasesTable')
        .addClass("table table-hover")
        .DataTable({
            serverSide: true,
            processing: true,
            dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
            ajax: {
                url: '/business-gestion/gene/get-all-info/',
                type: 'GET',
                data: function(d) {
                    return {
                        page_size: d.length,
                        page: (d.start / d.length) + 1,
                        search: d.search.value,
                        ordering: d.order[0].dir === 'asc' ? d.columns[d.order[0].column].data : '-' + d.columns[d.order[0].column].data
                    };
                },
                dataSrc: function(json) {
                    document.getElementById('global-spinner-overlay').style.display = 'none';
                    // Agrupar por nombre de gen
                    const groupedData = json.results.reduce((acc, curr) => {
                        const existing = acc.find(item => item.name === curr.name);
                        if (existing) {
                            // Combinar disorders sin duplicados
                            curr.disorders.forEach(disorder => {
                                if (!existing.disorders.find(d => d.id === disorder.id)) {
                                    existing.disorders.push(disorder);
                                }
                            });
                        } else {
                            acc.push({...curr});
                        }
                        return acc;
                    }, []);
                    
                    return groupedData;
                }
            },
            columns: [
                {
                    title: "Gene",
                    data: "name",
                    className: 'dt-body-center'
                },
                {
                    title: "Disorders by Group",
                    data: "disorders",
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (Array.isArray(data) && data.length > 0) {
                                const groupedDisorders = data.reduce((acc, curr) => {
                                    if (!acc[curr.disease_group]) {
                                        acc[curr.disease_group] = [];
                                    }
                                    acc[curr.disease_group].push(curr);
                                    return acc;
                                }, {});

                                return Object.entries(groupedDisorders).map(([group, disorders]) => `
                                    <div class="disorder-group mb-2">
                                        <span class="badge bg-primary mb-1">${group}</span>
                                        <div class="disorder-items">
                                            ${disorders.map(d => `
                                                <div class="disorder-item">
                                                    <span class="badge bg-info text-dark me-1" 
                                                          style="cursor: pointer;"
                                                          onclick="showDisorderDetails('${d.name}', '${d.disease_group}', '${d.disease_subgroup}')">
                                                        ${d.name}
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('');
                            }
                            return '<span class="badge bg-secondary">None</span>';
                        }
                        return data;
                    }
                }
            ],
            buttons: [
                {
                    extend: 'excel',
                    text: 'Excel',
                    exportOptions: {
                        columns: [0, 1],
                        format: {
                            body: function(data, row, column, node) {
                                // Limpiar tags HTML para la exportación
                                if (column === 1) {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = data;
                                    return temp.textContent || temp.innerText;
                                }
                                return data;
                            }
                        }
                    }
                },
                {
                    extend: 'pdf',
                    text: 'PDF'
                },
                {
                    extend: 'print',
                    text: 'Print'
                }
            ],
            language: {
                processing: "Loading...",
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            },
            responsive: true,
            ordering: true,
            searching: true,
            paging: true,
            pageLength: 10,
            order: [[0, 'asc']],
            rowGroup: {
                dataSrc: 'name'
            }
        });

    const modal = new bootstrap.Modal(document.getElementById('genomicDiseasesModal'));
    modal.show();
}

// La función ya no necesita recibir un 'id'
function showGenomicDiseasesModal() {
    const $spinner = $('#global-spinner-overlay');
    const $table = $('#genomicDiseasesTable');

    $spinner.css('display', 'flex');

    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
        $table.empty();
    }

    $('#genesModalLabel').text('Genomic: Associated Disorders');

    const dataTable = $table.DataTable({
        serverSide: true,
        processing: true,
        dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
        ajax: {
            url: '/business-gestion/gene/get-all-info/',
            type: 'GET',
            data: function(d) {
                // Objeto de datos sin el 'gene_id'.
                // El servidor ahora paginará sobre todos los genes.
                return {
                    page_size: d.length,
                    page: (d.start / d.length) + 1,
                    search: d.search.value,
                    ordering: d.order.length ? (d.order[0].dir === 'asc' ? d.columns[d.order[0].column].data : '-' + d.columns[d.order[0].column].data) : null
                };
            },
            dataSrc: function(json) {
                // Esta parte no cambia. Sigue esperando los datos del servidor.
                json.recordsTotal = json.count;
                json.recordsFiltered = json.count;
                return json.results;
            }
        },
        columns: [
            {
                title: "Gene",
                data: "name",
                className: 'dt-body-center'
            },
            {
                title: "Disorders by Group",
                data: "disorders",
                orderable: false,
                // La función render no necesita ningún cambio.
                render: function(data, type, row) {
                    if (type === 'display' && Array.isArray(data) && data.length > 0) {
                        const groupedDisorders = data.reduce((acc, curr) => {
                            const group = curr.disease_group || 'Uncategorized';
                            if (!acc[group]) {
                                acc[group] = [];
                            }
                            acc[group].push(curr);
                            return acc;
                        }, {});

                        return Object.entries(groupedDisorders).map(([group, disorders]) => `
                            <div class="disorder-group mb-2">
                                <strong class="badge bg-primary mb-1">${group}</strong>
                                <div class="disorder-items">
                                    ${disorders.map(d => `
                                        <div class="disorder-item">
                                            <span class="badge bg-info text-dark me-1" 
                                                  style="cursor: pointer;"
                                                  onclick="showDisorderDetails('${d.name}', '${d.disease_group}', '${d.disease_subgroup}')">
                                                ${d.name}
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('');
                    }
                    return '<span class="badge bg-secondary">None</span>';
                }
            }
        ],
        // El resto de la configuración (botones, idioma, etc.) no cambia.
        buttons: [
            {
                extend: 'excel',
                text: 'Excel',
                exportOptions: {
                    columns: [0, 1],
                    format: {
                        body: function(data, row, column, node) {
                            if (column === 1) {
                                const temp = document.createElement('div');
                                temp.innerHTML = data;
                                return Array.from(temp.querySelectorAll('.disorder-group')).map(group => {
                                    const groupName = group.querySelector('strong').textContent;
                                    const items = Array.from(group.querySelectorAll('.disorder-item span')).map(item => item.textContent.trim()).join(', ');
                                    return `${groupName}: ${items}`;
                                }).join('\n');
                            }
                            return data;
                        }
                    }
                }
            },
            'pdf', 'print'
        ],
        language: { processing: "Loading...", search: "Search:", lengthMenu: "Show _MENU_ entries", info: "Showing _START_ to _END_ of _TOTAL_ entries", infoEmpty: "Showing 0 to 0 of 0 entries", paginate: { first: "First", last: "Last", next: "Next", previous: "Previous" } },
        responsive: true,
        ordering: true,
        searching: true,
        paging: true,
        pageLength: 10,
        order: [[0, 'asc']]
    });
    
    dataTable.on('preXhr.dt', function () {
        $spinner.css('display', 'flex');
    }).on('xhr.dt', function () {
        $spinner.css('display', 'none');
    });

    const modal = new bootstrap.Modal($('#genomicDiseasesModal')[0]);
    modal.show();
}

function showDisorderDetails(name, group, subgroup) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: 'info',
        title: `${name}`,
        html: `
            <div class="mt-2">
                <strong>Disease Group:</strong> ${group}<br>
                <strong>Disease Subgroup:</strong> ${subgroup}
            </div>
        `
    });
}
