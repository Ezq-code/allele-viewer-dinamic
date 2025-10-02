function showGenesModal(id) {
    fetch(`/business-gestion/gene-groups/${id}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('genesModalLabel').textContent = data.name || 'Genes Relacionados';
            
            // Destruir la tabla existente si ya está inicializada
            if ($.fn.DataTable.isDataTable('#genesTable')) {
                $('#genesTable').DataTable().destroy();
            }

            // Inicializar DataTable
            $('#genesTable')
            .addClass("table table-hover")
            .DataTable({
                dom: '<"top"l><"row"<"col-sm-12 col-md-6"B><"col-sm-12 col-md-6"f>>rtip',
                data: data.genes.map(gene => [gene]),
                columns: [
                    { title: "Gen" }
                ], 
                responsive: true,
                ordering: true,
                searching: true,
                paging: true
            });

            const modal = new bootstrap.Modal(document.getElementById('genesModal'));
            modal.show();

        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los genes',
                timer: 3000
            });
        });
}