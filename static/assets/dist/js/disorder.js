// Variables globales para almacenar opciones
let diseaseSubgroupsOptions = [];
let genesOptions = [];
// variable para gestionar los elementos seleccionados
let selected_id;
const csrfToken = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("csrftoken="))
    ?.split("=")[1];
const url = "/business-gestion/disorder/";
var load = document.getElementById("load");

// Función para cargar disease subgroups
async function loadDiseaseSubgroups() {
    try {
        const response = await axios.get('/business-gestion/disease-subgroup/');
        diseaseSubgroupsOptions = response.data.results;

        // Inicializar Select2 para disease subgroups
        $('#disease_subgroup').select2({
            theme: 'bootstrap4',
            data: diseaseSubgroupsOptions.map(subgroup => ({
                id: subgroup.id,
                text: subgroup.name
            })),
            placeholder: 'Select a disease subgroup'
        });
    } catch (error) {
        console.error('Error loading disease subgroups:', error);
    }
}

// Función para cargar genes
async function loadGenes() {
    try {
        const response = await axios.get('/business-gestion/gene/minimal-list/');
        genesOptions = response.data;

        // Inicializar Select2 para genes
        // $('#genes').select2({
        //     theme: 'bootstrap4',
        //     data: genesOptions.map(gene => ({
        //         id: gene.id,
        //         text: gene.name
        //     })),
        //     placeholder: 'Select genes',
        //     allowClear: true
        // });
    } catch (error) {
        console.error('Error loading genes:', error);
    }
}

// Función para cargar todos los select options
async function loadSelectOptions() {
    await loadDiseaseSubgroups();
    await loadGenes();
}

$(document).ready(function () {
    // Inicializar select2
    $('#disease_subgroup').select2({
        theme: 'bootstrap4',
        placeholder: 'Select a disease subgroup'
    });

    // $('#genes').select2({
    //     theme: 'bootstrap4',
    //     placeholder: 'Select genes',
    //     allowClear: true
    // });

    // DataTable initialization
    $("table")
        .addClass("table table-hover")
        .DataTable({
            dom: '<"top"l>Bfrtip',
            buttons: [
                {
                    text: "Add",
                    className: " btn btn-primary btn-info",
                    action: function (e, dt, node, config) {
                        $("#modal-crear-elemento").modal("show");
                    },
                },
                {
                    extend: "excel",
                    text: "Excel",
                },
                {
                    extend: "pdf",
                    text: "PDF",
                },
                {
                    extend: "print",
                    text: "Print",
                },
            ],
            //Adding server-side processing
            serverSide: true,
            search: {
                return: true,
            },
            processing: true,
            ajax: function (data, callback, settings) {
                let dir = "";
                if (data.order[0].dir == "desc") {
                    dir = "-";
                }
                axios
                    .get(url, {
                        params: {
                            page_size: data.length,
                            page: data.start / data.length + 1,
                            search: data.search.value,
                            ordering: dir + data.columns[data.order[0].column].data,
                        },
                    })
                    .then((res) => {
                        callback({
                            recordsTotal: res.data.count,
                            recordsFiltered: res.data.count,
                            data: res.data.results,
                        });
                    })
                    .catch((error) => {
                        alert(error);
                    });
            },
            // En la configuración de DataTables, modifica las columns:
            columns: [
                {data: "name", title: "Name"},
                {data: "description", title: "Description"},
                {
                    data: "disease_subgroup_name",  // Usar el campo nuevo
                    title: "Disease SubGroup",
                    render: function (data, type, row) {
                        return data || '<span class="text-muted">No subgroup</span>';
                    }
                },
                {
                    data: "genes_names",  // Usar el campo nuevo
                    title: "Genes",
                    render: function (data, type, row) {
                        if (data && data.length > 0) {
                            return data.join(', ');
                        }
                        return '<span class="text-muted">No genes</span>';
                    }
                },
                {
                    data: "",
                    title: "Actions",
                    render: (data, type, row) => {
                        return `<div class="btn-group">
                      <button type="button" title="Edit" class="btn bg-info" data-toggle="modal" data-target="#modal-crear-elemento" 
                        data-id="${row.id}" 
                        data-type="edit" 
                        data-name="${row.name}" 
                        data-description="${row.description}" 
                        data-disease_subgroup="${row.disease_subgroup}"  // ID del subgroup
                        data-genes='${JSON.stringify(row.genes || [])}'  // IDs de los genes
                        id="${row.id}">
                        <i class="fas fa-edit"></i>
                      </button>                    
                      <button type="button" title="Delete" class="btn bg-olive" data-toggle="modal" data-target="#modal-eliminar-elemento" data-name="${row.name}" data-id="${row.id}">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>`;
                    },
                },
            ],
            // esto es para truncar el texto de las celdas
            columnDefs: [
                {
                    targets: 1,
                    render: function (data, type, row) {
                        if (data == null || data == "") {
                            return "No Data";
                        } else {
                            return type === "display" && data.length > 80
                                ? data.substr(0, 80) + "…"
                                : data;
                        }
                    },
                },
            ],
        });
});

$("#modal-eliminar-elemento").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var dataName = button.data("name"); // Extract info from data-* attributes
    selected_id = button.data("id"); // Extract info from data-* attributes
    var modal = $(this);
    modal.find(".modal-body").text("Do you want to delete the disorder " + dataName + "?");
});

// funcion para eliminar disorder
function function_delete(selected_id) {
    const table = $("#tabla-de-Datos").DataTable();
    axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
    axios
        .delete(`${url}${selected_id}/`)
        .then((response) => {
            Toast.fire({
                icon: "success",
                title: "Disorder deleted successfully",
            });
            table.row(`#${selected_id}`).remove().draw(); // use id selector to remove the row
        })
        .catch((error) => {
            Toast.fire({
                icon: "error",
                title: "Disorder was not deleted",
            });
        });
}

// Modificar el event handler del modal para resetear
$("#modal-crear-elemento").on("hide.bs.modal", (event) => {
    const form = event.currentTarget.querySelector("form");
    form.reset();
    edit_elemento = false;

    const elements = [...form.elements];
    elements.forEach((elem) => elem.classList.remove("is-invalid"));
});

let edit_elemento = false;
// Modificar el event handler del modal para manejar la edición
$("#modal-crear-elemento").on("show.bs.modal", async function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);
    var form = modal.find("form")[0];

    // Cargar opciones si es la primera vez
    if (diseaseSubgroupsOptions.length === 0) {
        await loadSelectOptions();
    }

    if (button.data("type") == "edit") {
        var dataName = button.data("name");
        var dataId = button.data("id");
        var dataDescription = button.data("description");
        var dataDiseaseSubgroup = button.data("disease_subgroup");
        var dataGenes = button.data("genes") || [];

        selected_id = dataId;
        edit_elemento = true;
        modal.find(".modal-title").text("Edit " + dataName);
        form.elements.name.value = dataName;
        form.elements.description.value = dataDescription;

        // Establecer disease subgroup
        $('#disease_subgroup').val(dataDiseaseSubgroup).trigger('change');

        // Establecer genes
        $('#genes').val(dataGenes).trigger('change');

    } else {
        modal.find(".modal-title").text("Create Disorder");
        form.reset();
        $('#disease_subgroup').val(null).trigger('change');
        $('#genes').val(null).trigger('change');
    }
});

$(function () {
    bsCustomFileInput.init();
});

// form validator
$(function () {
    $.validator.setDefaults({
        language: "en",
        submitHandler: function () {
            // alert("Form successful submitted!");
        },
    });

    $("#form-create-elemento").validate({
        rules: {
            name: {
                required: true,
            },
            disease_subgroup: {
                required: true,
            },
        },
        messages: {
            name: {
                required: "Name is required",
            },
            disease_subgroup: {
                required: "Disease subgroup is required",
            },
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass("is-invalid");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass("is-invalid");
        },
    });
});

// crear elemento
let form = document.getElementById("form-create-elemento");
form.addEventListener("submit", function (event) {
    event.preventDefault();
    var table = $("#tabla-de-Datos").DataTable();
    axios.defaults.headers.common["X-CSRFToken"] = csrfToken;

    if (form.checkValidity()) {
        let data = {
            name: form.elements.name.value,
            description: form.elements.description.value,
            disease_subgroup: $('#disease_subgroup').val(),
            genes: $('#genes').val() || []
        };

        if (edit_elemento) {
            $("#modal-crear-elemento").modal("hide");
            load.hidden = false;
            axios
                .patch(`${url}${selected_id}/`, data)
                .then((response) => {
                    if (response.status === 200) {
                        load.hidden = true;
                        table.ajax.reload();
                        Swal.fire({
                            icon: "success",
                            title: "Disorder edited successfully",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        edit_elemento = false;
                    }
                })
                .catch((error) => {
                    load.hidden = true;
                    let dict = error.response.data;
                    let textError = "Details: ";
                    for (const key in dict) {
                        textError += key + ": " + dict[key];
                    }
                    Swal.fire({
                        icon: "error",
                        title: "Error editing Disorder",
                        text: textError,
                        showConfirmButton: false,
                        timer: 5000,
                    });
                });
        } else {
            $("#modal-crear-elemento").modal("hide");
            load.hidden = false;
            axios
                .post(url, data)
                .then((response) => {
                    if (response.status === 201) {
                        load.hidden = true;
                        table.ajax.reload();
                        Swal.fire({
                            icon: "success",
                            title: "Disorder created successfully",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                .catch((error) => {
                    load.hidden = true;
                    let dict = error.response.data;
                    let textError = "Please check the following fields: ";
                    for (const key in dict) {
                        textError += " " + key + ": " + dict[key];
                    }
                    Swal.fire({
                        icon: "error",
                        title: "Error creating Disorder",
                        text: textError,
                        showConfirmButton: true,
                    });
                });
        }
    }
});