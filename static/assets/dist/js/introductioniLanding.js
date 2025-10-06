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
                            title: "Gen",
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
console.log('✌️statusValue --->', statusValue);
                                
                              if (statusValue.evidence) {
                                return `<span class="badge ${badgeClass}" title="Evidencia: ${statusValue.evidence}">${valueWithPercent}</span>`;
                              }
                              return `<span class="badge ${badgeClass}">${valueWithPercent}</span> `;
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