// Variables globales para almacenar opciones
let geneGroupsOptions = [];
let diseaseGroupsOptions = [];
let diseaseSubgroupsOptions = [];
let disorderOptions = [];
// variable para gestionar los elementos seleccionados
let selected_id;
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];
const url = "/business-gestion/gene/";
var load = document.getElementById("load");

// Función para cargar DiseaseGroups
async function loadDiseaseGroups() {
  try {
    const response = await axios.get('/business-gestion/disease-group/');
    diseaseGroupsOptions = response.data.results;

    // Inicializar Select2 para disease groups
    $('#disease_group').select2({
      theme: 'bootstrap4',
      data: diseaseGroupsOptions.map(group => ({
        id: group.id,
        text: group.name
      })),
      placeholder: 'Select a disease group'
    });
  } catch (error) {
    console.error('Error loading disease groups:', error);
  }
}

// Función para cargar SubGroups basado en el DiseaseGroup seleccionado
async function loadDiseaseSubGroups(diseaseGroupId) {
  try {
    const response = await axios.get(`/business-gestion/disease-subgroup/?disease_group=${diseaseGroupId}`);
    diseaseSubgroupsOptions = response.data.results;

    // Habilitar y actualizar el selector de subgroups
    $('#disease_subgroup').prop('disabled', false);
    $('#disease_subgroup').empty().append('<option value="">Select a disease subgroup</option>');

    diseaseSubgroupsOptions.forEach(subgroup => {
      $('#disease_subgroup').append(new Option(subgroup.name, subgroup.id, false, false));
    });

    // Resetear disorders cuando cambia el subgroup
    $('#disorders').val(null).trigger('change').prop('disabled', true);

  } catch (error) {
    console.error('Error loading disease subgroups:', error);
  }
}

// Función para cargar Disorders basado en el DiseaseSubGroup seleccionado
async function loadDisorders(diseaseSubgroupId) {
  try {
    const response = await axios.get(`/business-gestion/disorder/?disease_subgroup=${diseaseSubgroupId}`);
    const newDisorders = response.data.results;

    // Habilitar el selector de disorders
    $('#disorders').prop('disabled', false);

    // Limpiar SOLO las opciones que fueron cargadas por la cascada (no las que ya estaban seleccionadas)
    $('#disorders option').each(function() {
      // Remover solo las opciones que no tienen valor (las placeholder) o que no están seleccionadas
      if ($(this).val() === '' || (!$(this).prop('selected') && $(this).val() !== '')) {
        $(this).remove();
      }
    });

    // Agregar nuevos disorders
    newDisorders.forEach(disorder => {
      // Solo agregar si no existe ya
      if ($('#disorders').find(`option[value="${disorder.id}"]`).length === 0) {
        $('#disorders').append(new Option(disorder.name, disorder.id, false, false));
      }
    });

    // Actualizar Select2
    $('#disorders').trigger('change');

  } catch (error) {
    console.error('Error loading disorders:', error);
  }
}

// Función para cargar todos los select options
async function loadSelectOptions() {
  try {
    // Cargar grupos de genes
    const groupsResponse = await axios.get('/business-gestion/gene-groups/minimal-list/');
    geneGroupsOptions = groupsResponse.data;

    // Cargar disease groups
    await loadDiseaseGroups();

    // Inicializar Select2 para grupos de genes
    $('#groups').select2({
      theme: 'bootstrap4',
      data: geneGroupsOptions.map(group => ({
        id: group.id,
        text: group.name
      })),
      placeholder: 'Select groups',
      allowClear: true
    });

    // Inicializar Select2 para disease subgroups
    $('#disease_subgroup').select2({
      theme: 'bootstrap4',
      placeholder: 'Select a disease subgroup'
    });

    // Inicializar Select2 para disorders
    $('#disorders').select2({
      theme: 'bootstrap4',
      placeholder: 'Select disorders',
      allowClear: true
    });

  } catch (error) {
    console.error('Error loading select options:', error);
    Toast.fire({
      icon: 'error',
      title: 'Error loading form options'
    });
  }
}

// Función para resetear completamente la cascada
function resetCascade() {
  $('#disease_group').val(null).trigger('change');
  $('#disease_subgroup').empty().append('<option value="">First select a disease group</option>')
    .prop('disabled', true).trigger('change');
  $('#disorders').empty().prop('disabled', true).trigger('change');
}

// Función para determinar el disease group y subgroup de los disorders seleccionados
async function determineDiseaseGroupsFromDisorders(disorderIds) {
  if (!disorderIds || disorderIds.length === 0) return;

  try {
    // Cargar información de los disorders seleccionados
    const disordersInfo = await Promise.all(
      disorderIds.map(id =>
        axios.get(`/business-gestion/disorder/${id}/`).catch(() => null)
      )
    );

    // Encontrar los disease subgroups únicos
    const subgroupIds = [...new Set(
      disordersInfo
        .filter(info => info && info.data)
        .map(info => info.data.disease_subgroup)
    )];

    if (subgroupIds.length > 0) {
      // Cargar información de los subgroups
      const subgroupsInfo = await Promise.all(
        subgroupIds.map(id =>
          axios.get(`/business-gestion/disease-subgroup/${id}/`).catch(() => null)
        )
      );

      // Encontrar los disease groups únicos
      const groupIds = [...new Set(
        subgroupsInfo
          .filter(info => info && info.data)
          .map(info => info.data.disease_group)
      )];

      // Si hay un solo disease group, seleccionarlo y cargar sus subgroups
      if (groupIds.length === 1) {
        $('#disease_group').val(groupIds[0]).trigger('change');

        // Esperar a que se carguen los subgroups y luego seleccionar los correspondientes
        setTimeout(() => {
          $('#disease_subgroup').val(subgroupIds).trigger('change');
        }, 500);
      }
    }
  } catch (error) {
    console.error('Error determining disease groups:', error);
  }
}

$(document).ready(function () {
  // Inicializar TODOS los select2
  $('#groups').select2({
    theme: 'bootstrap4',
    placeholder: 'Select groups',
    allowClear: true
  });

  $('#disease_group').select2({
    theme: 'bootstrap4',
    placeholder: 'Select a disease group'
  });

  $('#disease_subgroup').select2({
    theme: 'bootstrap4',
    placeholder: 'Select a disease subgroup'
  });

  $('#disorders').select2({
    theme: 'bootstrap4',
    placeholder: 'Select disorders',
    allowClear: true
  });

  // Event listeners para la cascada
  $('#disease_group').on('change', function() {
    const diseaseGroupId = $(this).val();
    if (diseaseGroupId) {
      loadDiseaseSubGroups(diseaseGroupId);
    } else {
      $('#disease_subgroup').val(null).trigger('change').prop('disabled', true);
      $('#disorders').val(null).trigger('change').prop('disabled', true);
    }
  });

  $('#disease_subgroup').on('change', function() {
    const diseaseSubgroupId = $(this).val();
    if (diseaseSubgroupId) {
      loadDisorders(diseaseSubgroupId);
    } else {
      $('#disorders').val(null).trigger('change').prop('disabled', true);
    }
  });

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
      columns: [
        { data: "name", title: "Name" },
        { data: "description", title: "Description" },
        {
          data: "status",
          title: "Status",
          render: function (data, type, row) {
            return `<span class="badge badge-info">${data}</span>`;
          },
        },
        {
          data: "groups_names",
          title: "Groups",
          render: function (data, type, row) {
            if (data && data.length > 0) {
              return data.join(', ');
            }
            return '<span class="text-muted">No groups</span>';
          }
        },
        {
          data: "disorders_names",
          title: "Disorders",
          render: function (data, type, row) {
            if (data && data.length > 0) {
              return data.join(', ');
            }
            return '<span class="text-muted">No disorders</span>';
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
                        data-groups='${JSON.stringify(row.groups)}'
                        data-disorders='${JSON.stringify(row.disorders)}'
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
  modal.find(".modal-body").text("Do you want to delete the gene " + dataName + "?");
});

// funcion para eliminar usuario
function function_delete(selected_id) {
  const table = $("#tabla-de-Datos").DataTable();
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .delete(`${url}${selected_id}/`)
    .then((response) => {
      Toast.fire({
        icon: "success",
        title: "Gene deleted successfully",
      });
      table.row(`#${selected_id}`).remove().draw(); // use id selector to remove the row
    })
    .catch((error) => {
      Toast.fire({
        icon: "error",
        title: "Gene was not deleted",
      });
    });
}

// Modificar el event handler del modal para resetear la cascada
$("#modal-crear-elemento").on("hide.bs.modal", (event) => {
  const form = event.currentTarget.querySelector("form");
  form.reset();
  edit_elemento = false;

  // Resetear completamente la cascada
  resetCascade();

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
  if (geneGroupsOptions.length === 0) {
    await loadSelectOptions();
  }

  if (button.data("type") == "edit") {
    var dataName = button.data("name");
    var dataId = button.data("id");
    var dataDescription = button.data("description");
    var dataGroups = button.data("groups") || [];
    var dataDisorders = button.data("disorders") || [];

    selected_id = dataId;
    edit_elemento = true;
    modal.find(".modal-title").text("Edit " + dataName);
    form.elements.name.value = dataName;
    form.elements.description.value = dataDescription;

    // Establecer valores seleccionados en multiselects
    $('#groups').val(dataGroups).trigger('change');

    // En modo edición, cargar todos los disorders disponibles
    try {
      const disordersResponse = await axios.get('/business-gestion/disorder/minimal-list/');
      disorderOptions = disordersResponse.data;

      $('#disorders').empty().prop('disabled', false);
      disorderOptions.forEach(disorder => {
        $('#disorders').append(new Option(disorder.name, disorder.id, false, false));
      });

      // Establecer los valores seleccionados
      $('#disorders').val(dataDisorders).trigger('change');

      // Determinar y establecer los disease groups y subgroups correspondientes
      await determineDiseaseGroupsFromDisorders(dataDisorders);

    } catch (error) {
      console.error('Error loading disorders for edit:', error);
    }

  } else {
    modal.find(".modal-title").text("Create Gene");
    form.reset();
    // Limpiar multiselects y resetear cascada
    $('#groups').val(null).trigger('change');
    resetCascade();
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
      status: {
        required: true,
      },
    },
    messages: {
      name: {
        required: "Name is required",
      },
      status: {
        required: "Status is required",
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
      groups: $('#groups').val() || [], // Array de IDs de grupos
      disorders: $('#disorders').val() || [] // Array de IDs de desórdenes
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
              title: "Gene edited successfully",
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
            title: "Error editing Gene",
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
              title: "Gene created successfully",
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
            title: "Error creating Gene",
            text: textError,
            showConfirmButton: true,
          });
        });
    }
  }
});

function ia_algorithms_recalculate(id, name) {
  Swal.fire({
    title: "Recalculate Algorithms",
    text: `Are you sure you want to recalculate the algorithms for the element ${name}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, recalculate",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .get(`${url}${id}/recalculate/`)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Algorithms Recalculated",
              text: "Algorithms recalculated successfully",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error recalculating Algorithms",
            text: error.response.data.detail,
            showConfirmButton: false,
            timer: 3000,
          });
        });
    }
  });
}

function showGraphChangesForm() {
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .get("/business-gestion/compute-graph-changes/")
    .then((response) => {
      const data = response.data;

      Swal.fire({
        width: "30%",
        title: "Modify Graph Parameters",
        html: `
                <hr>  
                <div class="form-group">
                    <label for="nx_graph_training_iterations">Training Iterations</label>    
                    <input id="nx_graph_training_iterations" class="form-control form-control-border" placeholder="Training Iterations" type="number" value="${data.nx_graph_training_iterations}">
                 </div>
                 <div class="form-group">
                    <label for="nx_graph_k">K</label> 
                    <input id="nx_graph_k" class="form-control form-control-border" placeholder="K" type="number" step="0.1" value="${data.nx_graph_k}">
                 </div>
                
                <div class="form-group">
                    <label for="nx_graph_scale">Scale</label> 
                    <input id="nx_graph_scale" class="form-control form-control-border" placeholder="Scale" type="number" value="${data.nx_graph_scale}">
                </div>
                </div>
                
                
                `,
        focusConfirm: false,
        showCancelButton: true,

        preConfirm: () => {
          return {
            nx_graph_training_iterations: parseInt(
              document.getElementById("nx_graph_training_iterations").value
            ),
            nx_graph_k: parseFloat(document.getElementById("nx_graph_k").value),
            nx_graph_scale: parseInt(
              document.getElementById("nx_graph_scale").value
            ),
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post("/business-gestion/compute-graph-changes/", result.value)
            .then((response) => {
              if (response.status === 202) {
                Swal.fire({
                  icon: "success",
                  title: "Parameters Modified",
                  text: "The graph parameters have been modified successfully.",
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                icon: "error",
                title: "Error Modifying Parameters",
                text: error.response.data.detail,
                showConfirmButton: false,
                timer: 3000,
              });
            });
        }
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error Fetching Data",
        text: error.response.data.detail,
        showConfirmButton: false,
        timer: 3000,
      });
    });
}