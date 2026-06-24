// variable para gestionar los elementos seleccionados
let selected_id;

// Variable con el token
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];
// url del endpoint principal
const write_url = "/business-gestion/uploaded-files/";
const read_url = write_url + "simple-list/";

// url para obtener genes
const geneUrl = "/business-gestion/gene/list-for-dropdown/";

var load = document.getElementById("load");

// function showFileProcessingMessage() {
//   Swal.fire({
//     title: "Processing",
//     text: "The file is being processed. You will be notified when the upload is finished.",
//     allowOutsideClick: false,
//     allowEscapeKey: false,
//     timer: 4500,
//     timerProgressBar: true,
//     didOpen: () => {
//       Swal.showLoading();
//     },
//   });
// }

// Función para cargar la lista de genes
function loadGenes() {
  axios
    .get(geneUrl)
    .then((response) => {
      const geneSelect = document.getElementById("gene");
      
      // Destruir Select2 antes de actualizar el DOM
      if ($(geneSelect).hasClass('select2-hidden-accessible')) {
        $(geneSelect).select2('destroy');
      }
      
      geneSelect.innerHTML = '<option value="">Select a gene</option>';

      response.data.results.forEach((gene) => {
        const option = document.createElement("option");
        option.value = gene.id;
        option.textContent = gene.name;
        geneSelect.appendChild(option);
      });

      // Reinicializar Select2 después de cargar los genes
      $(geneSelect).select2({
        theme: 'bootstrap4',
        placeholder: 'Select a gene',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#modal-crear-elemento'),
        language: 'es'
      });
    })
    .catch((error) => {
      console.error("Error cargando genes:", error);
    });
}

$(document).ready(function () {
  // Inicializar Select2 antes de cargar genes
  $('#gene').select2({
    theme: 'bootstrap4',
    placeholder: 'Select a gene',
    allowClear: true,
    width: '100%',
    dropdownParent: $('#modal-crear-elemento'),
    language: 'es'
  });
  
  // Cargar la lista de genes
  loadGenes();

  $("table")
    .addClass("table table-hover")
    .DataTable({
      dom: '<"top"l>Bfrtip',
      buttons: [
        {
          text: " Agregar",
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
          text: "Imprimir",
        },
      ],
      //Adding server-side processing
      serverSide: true,
      search: {
        return: true,
      },
      processing: true,
      ajax: function (data, callback, settings) {
        dir = "";
        if (data.order[0].dir == "desc") {
          dir = "-";
        }

        axios
          .get(read_url, {
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
        { data: "custom_name", title: "Nombre" },
        { data: "description", title: "Descripción" },
        { data: "gene_name", title: "Gen" },
        { data: "predefined", title: "Predefinido" },
        {
          data: "studies",
          title: "Estudios Cargados",
          render: (data, type, row) => {
            if (!data || data.length === 0) {
              return '<span class="badge badge-secondary">Sin estudios</span>';
            }

            const total = data.length;
            const ok = data.filter((s) => s.successfull_load).length;
            const btnClass = ok === total ? 'btn-success' : ok === 0 ? 'btn-danger' : 'btn-warning';
            const uniqueId = 'studies-detail-' + row.id;

            const detailHtml = data.map((study) => {
              const icon = study.successfull_load
                ? '<i class="fas fa-check-circle" style="color: green;"></i>'
                : '<i class="fas fa-times-circle" style="color: red;"></i>';
              const statusClass = study.successfull_load ? 'badge-success' : 'badge-danger';
              const status = study.successfull_load ? 'Exitoso' : 'Error';
              const date = new Date(study.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });

              let html = `<div style="margin-bottom: 8px;">
                <div>${icon} <strong>${study.study_type_display}</strong></div>
                <span class="badge ${statusClass}">${status}</span>
                <span class="badge badge-info" style="margin-left: 5px;">${date}</span>`;

              if (study.extra_info) {
                html += `<div style="font-size: 0.85em; margin-top: 4px; color: #666;">${study.extra_info}</div>`;
              }

              html += '</div>';
              return html;
            }).join('');

            return `<button type="button" class="btn btn-sm ${btnClass}" onclick="toggleStudies('${uniqueId}', this)" style="white-space: nowrap;">
                      <i class="fas fa-flask"></i> ${total} estudio(s) <i class="fas fa-chevron-down"></i>
                    </button>
                    <div id="${uniqueId}" style="display:none; margin-top: 8px;">${detailHtml}</div>`;
          },
        },
        {
          data: "",
          title: "Acciones",
          render: (data, type, row) => {
            return `<div class="btn-group">
                        <button type="button" title="Edit" class="btn bg-info" data-toggle="modal" data-target="#modal-crear-elemento" data-id="${row.id}" data-type="edit" data-name="${row.custom_name}" id="${row.id}"  >
                          <i class="fas fa-edit"></i></button>                    
                        <button type="button" title="Delete" class="btn bg-olive" data-toggle="modal" data-target="#modal-eliminar-elemento" data-name="${row.custom_name}" data-id="${row.id}">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>`;
          },
        },
      ],
      //  esto es para truncar el texto de las celdas
      columnDefs: [
        {
          targets: 1,
          render: function (data, type, row) {
            if (data == null || data == "") {
              return (data = "Sin Datos");
            } else {
              return type === "display" && data.length > 80
                ? data.substr(0, 80) + "…"
                : data;
            }
          },
        },
        {
          targets: 2,
          render: function (data, type, row) {
            if (data == null || data == "") {
              return "Sin Gen";
            } else {
              return data;
            }
          },
        },
      ],
    });
    
  // Configuración de Pusher
  if (
    typeof pusherKey !== "undefined" &&
    typeof pusherCluster !== "undefined"
  ) {
    var pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    var celery_task_channel = pusher.subscribe("celery-task-channel");
    // The realtime update may contain task or alert data (or both).
    celery_task_channel.bind("study-processed", function (data) {
      console.log("New study processed:", data);
      
      if ($.fn.DataTable.isDataTable("#tabla-de-Datos")) {
        $("#tabla-de-Datos").DataTable().ajax.reload(null, false);
      }
    });
  } else {
    console.warn(
      "Pusher keys no definidas. Las alertas en tiempo real no funcionarán."
    );
  }
});

$("#modal-eliminar-elemento").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var dataName = button.data("name"); // Extract info from data-* attributes
  selected_id = button.data("id"); // Extract info from data-* attributes
  var modal = $(this);
  modal.find(".modal-body").text("Do you want to delete " + dataName + "?");
});

// funcion para eliminar usuario
function function_delete(selected_id) {
  const table = $("#tabla-de-Datos").DataTable();
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .delete(`${write_url}${selected_id}/`)
    .then((response) => {
      Toast.fire({
        icon: "success",
        title: "The element was successfully deleted",
      });
      table.row(`#${selected_id}`).remove().draw(); // use id selector to remove the row
    })
    .catch((error) => {
      Toast.fire({
        icon: "error",
        title: "The element was not deleted",
      });
    });
}

$("#modal-crear-elemento").on("hide.bs.modal", (event) => {
  // The form element is selected from the event trigger and its value is reset.
  const form = event.currentTarget.querySelector("form");
  form.reset();
  // The 'edit_elemento' flag is set to false.
  edit_elemento = false;
  // An array 'elements' is created containing all the HTML elements found inside the form element.
  const elements = [...form.elements];
  // A forEach loop is used to iterate through each element in the array.
  elements.forEach((elem) => elem.classList.remove("is-invalid"));

  // Resetear Select2 sin destruir la instancia
  $('#gene').val(null).trigger('change');
  document.getElementById("predefined").checked = false;
});

let edit_elemento = false;
let form = document.getElementById("form-create-elemento");

$("#modal-crear-elemento").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var modal = $(this);
  if (button.data("type") == "edit") {
    var dataName = button.data("name"); // Extract info from data-* attributes
    var dataId = button.data("id"); // Extract info from data-* attributes
    selected_id = button.data("id"); // Extract info from data-* attributes
    edit_elemento = true;
    modal.find(".modal-title").text("Editar " + dataName);
    // Realizar la petición con Axios
    axios
      .get(`${write_url}${selected_id}/`)
      .then(function (response) {
        // Recibir la respuesta
        const elemento = response.data;
        // Llenar el formulario con los datos del usuario
        form.elements.name.value = elemento.custom_name;
        form.elements.description.value = elemento.description;
        $('#gene').val(elemento.gene).trigger('change');
        document.getElementById("predefined").checked = elemento.predefined;
      })
      .catch(function (error) {});
  } else {
    modal.find(".modal-title").text("Subir Fichero");
  }
});

$(function () {
  bsCustomFileInput.init();
});

// form validator
$(function () {
  $.validator.setDefaults({
    language: "es",
    submitHandler: function () {
      // alert("Form successful submitted!");
    },
  });

  $("#form-create-elemento").validate({
    rules: {
      name: {
        required: true,
      },
      customFile: {
        required: function () {
          return !edit_elemento; // Solo requerido si no se está editando
        },
      },
      gene: {
        required: true,
      },
    },
    submitHandler: function (form) {},

    messages: {
      name: {
        required: "El nombre es requerido",
      },
      customFile: {
        required: "El fichero es obligatorio al crear un nuevo elemento",
      },
      gene: {
        required: "El gen es obligatorio",
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
form.addEventListener("submit", function (event) {
  event.preventDefault();
  var table = $("#tabla-de-Datos").DataTable();
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;

  if (form.checkValidity()) {
    let data = new FormData();
    data.append("system_user", localStorage.getItem("id"));
    data.append("custom_name", document.getElementById("name").value);
    data.append("description", document.getElementById("description").value);
    data.append("gene", $('#gene').val());
        // ...dentro del submit del formulario...
    data.append("predefined", document.getElementById("predefined").checked);
    // ...resto del código...
    if (document.getElementById("customFile").files[0] != null) {
      data.append(
        "original_file",
        document.getElementById("customFile").files[0]
      );
    }

    if (edit_elemento) {
      $("#modal-crear-elemento").modal("hide");
      load.hidden = false;
      axios
        .patch(`${write_url}${selected_id}/`, data)
        .then((response) => {
          if (response.status === 200) {
            load.hidden = true;
            table.ajax.reload();
            Swal.fire({
              icon: "success",
              title: "Elemento creado con éxito",
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
            title: "Error creating element",
            text: textError,
            showConfirmButton: false,
            timer: 5000,
          });
        });
    } else {
      $("#modal-crear-elemento").modal("hide");
      load.hidden = false;
      // showFileProcessingMessage(); UNNECESARY FOR THE MOMMENT
      axios
        .post(write_url, data)
        .then((response) => {
          if (response.status === 201) {
            load.hidden = true;
            // The success message and table refresh are handled by Pusher
            // event "successful-upload-3d-excel".
            $("#tabla-de-Datos").DataTable().ajax.reload(null, false);
          }
        })
        .catch((error) => {
          load.hidden = true;
          let dict = error.response.data;

          let textError = "An error occurred while saving the file: ";
          for (const key in dict) {
            if (key === "0") {
              textError += dict[key];
            } else {
              textError += " " + key + ": " + dict[key];
            }
          }

          Swal.fire({
            icon: "error",
            title: "Error al crear elemento",
            text: textError,
            showConfirmButton: true,
            // timer: 3000
          });
        });
    }
  }
});

function toggleStudies(uniqueId, btn) {
  const div = document.getElementById(uniqueId);
  const icon = btn.querySelector('i.fa-chevron-down, i.fa-chevron-up');
  if (div.style.display === 'none') {
    div.style.display = 'block';
    if (icon) { icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); }
  } else {
    div.style.display = 'none';
    if (icon) { icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); }
  }
}

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
        .get(`${read_url}${id}/recalculate/`)
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
