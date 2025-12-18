// variable para gestionar los elementos seleccionados
let selected_id;

// Variable con el token
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];
// url del endpoint principal
const url = "/business-gestion/uploaded-files/";
// url para obtener genes
const geneUrl = "/business-gestion/gene/";

var load = document.getElementById("load");

// Función para cargar la lista de genes
function loadGenes() {
  axios
    .get(geneUrl, {
            params: {
              ordering: "name",
            },
          })
    .then((response) => {
      const geneSelect = document.getElementById("gene");
      geneSelect.innerHTML = '<option value="">Seleccione un gen</option>';

      response.data.results.forEach((gene) => {
        const option = document.createElement("option");
        option.value = gene.id;
        option.textContent = gene.name;
        geneSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error cargando genes:", error);
    });
}

$(document).ready(function () {
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
        { data: "custom_name", title: "Nombre" },
        { data: "description", title: "Descripción" },
        { data: "gene_name", title: "Gen" },
        { data: "predefined", title: "Predefinido" },
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
    .delete(`${url}${selected_id}/`)
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

  // Resetear el campo gene a la opción por defecto
  document.getElementById("gene").innerHTML =
    '<option value="">Seleccione un gen</option>';
  // Recargar la lista de genes
  loadGenes();
});

let edit_elemento = false;
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
      .get(`${url}${selected_id}/`)
      .then(function (response) {
        // Recibir la respuesta
        const elemento = response.data;
        // Llenar el formulario con los datos del usuario
        form.elements.name.value = elemento.custom_name;
        form.elements.description.value = elemento.description;

        // Asegurar que los genes estén cargados antes de establecer el valor
        if (document.getElementById("gene").options.length > 1) {
          form.elements.gene.value = elemento.gene;
        } else {
          // Si los genes no están cargados, esperar y luego establecer el valor
          loadGenes();
          setTimeout(() => {
            form.elements.gene.value = elemento.gene;
          }, 100);
        }
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
let form = document.getElementById("form-create-elemento");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  var table = $("#tabla-de-Datos").DataTable();
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;

  if (form.checkValidity()) {
    let data = new FormData();
    data.append("system_user", localStorage.getItem("id"));
    data.append("custom_name", document.getElementById("name").value);
    data.append("description", document.getElementById("description").value);
    data.append("gene", document.getElementById("gene").value);
        // ...dentro del submit del formulario...
    data.append("predefined", document.getElementById("predefined").checked);
    // ...resto del código...
    if (document.getElementById("customFile").files[0] != null) {
      data.append(
        "original_file",
        document.getElementById("customFile").files[0]
      );
    }
    const url = "/business-gestion/uploaded-files/";

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
      axios
        .post(url, data)
        .then((response) => {
          if (response.status === 201) {
            load.hidden = true;
            table.ajax.reload();
            Swal.fire({
              icon: "success",
              title: "Elemento creado con éxito",
              showConfirmButton: false,
              timer: 1500,
            });
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
