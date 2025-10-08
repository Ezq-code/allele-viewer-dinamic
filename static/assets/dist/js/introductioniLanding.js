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
function showGenomicDiseasesModal(id) {
    document.getElementById('global-spinner-overlay').style.display = 'flex';
    // Destruir la tabla existente si ya está inicializada
    if ($.fn.DataTable.isDataTable('#genesTable')) {
        $('#genesTable').DataTable().destroy();
    }

    document.getElementById('genesModalLabel').textContent = 'Genomic: Associated Disorders';

    // Inicializar DataTable con server-side processing
    $('#genesTable')
        .addClass("table table-hover")
        .DataTable({
            serverSide: true,
            processing: true,
            dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
            ajax: function(data, callback, settings) {
                // Determinar dirección de ordenamiento
                const dir = data.order[0].dir === 'asc' ? '' : '-';
                axios.get(`/business-gestion/gene/?groups=${id}`, {
                    params: {
                        page_size: data.length,
                        page: (data.start / data.length) + 1,
                        search: data.search.value,
                        ordering: dir + data.columns[data.order[0].column].data,
                    }
                })
                .then(response => {
                    const geneData = response.data;
                    callback({
                        recordsTotal: geneData.count,
                        recordsFiltered: geneData.count,
                        data: geneData.results
                    });
                    document.getElementById('global-spinner-overlay').style.display = 'none';
                })
                .catch(error => {
                    document.getElementById('global-spinner-overlay').style.display = 'none';
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los datos',
                        timer: 3000
                    });
                    callback({
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: []
                    });
                });
            },
            columns: [
                {
                    title: "Gene",
                    data: "name"
                },
                {
                    title: "Disorders",
                    data: "disorders",
                    render: function(data, type, row) {
                        if (Array.isArray(data) && data.length > 0) {
                            return data.map(disorder => `<span class="badge bg-info text-dark me-1">${disorder}</span>`).join(' ');
                        }
                        return '<span class="badge bg-secondary">None</span>';
                    }
                }
            ],
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
}
