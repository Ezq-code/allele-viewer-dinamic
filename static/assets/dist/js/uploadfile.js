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
const studyTypeUrl = "/business-gestion/study-types/";

var load = document.getElementById("load");
let availableStudyTypes = [];
let detectedExcelSheets = [];
let currentSheetAssignments = {};

function getExcelSheetsContainer() {
  return document.getElementById("excel-sheets-container");
}

function getExcelSheetsList() {
  return document.getElementById("excel-sheets-list");
}

function clearExcelSheetsList() {
  const container = getExcelSheetsContainer();
  const list = getExcelSheetsList();
  if (list) list.innerHTML = "";
  if (container) container.classList.add("d-none");
}

function renderExcelSheetsList(sheetNames) {
  const container = getExcelSheetsContainer();
  const list = getExcelSheetsList();
  if (!container || !list) return;

  detectedExcelSheets = Array.isArray(sheetNames) ? sheetNames : [];
  list.innerHTML = "";

  if (!detectedExcelSheets.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.className = "text-warning";
    cell.textContent = "No se han encontrado hojas en este fichero.";
    row.appendChild(cell);
    list.appendChild(row);
    container.classList.remove("d-none");
    return;
  }

  detectedExcelSheets.forEach((sheetName) => {
    const row = document.createElement("tr");
    const sheetCell = document.createElement("td");
    sheetCell.textContent = sheetName;
    const studyCell = document.createElement("td");
    const select = document.createElement("select");
    select.className = "form-control form-control-sm excel-sheet-study-select";
    select.dataset.sheetName = sheetName;
    if (!currentSheetAssignments[sheetName]) {
      const bestMatch = findBestStudyTypeForSheet(sheetName);
      if (bestMatch) currentSheetAssignments[sheetName] = bestMatch;
    }
    populateStudySelect(select, currentSheetAssignments[sheetName] || "");
    select.addEventListener("change", function () {
      if (this.value) {
        currentSheetAssignments[sheetName] = this.value;
      } else {
        delete currentSheetAssignments[sheetName];
      }
    });
    studyCell.appendChild(select);
    row.appendChild(sheetCell);
    row.appendChild(studyCell);
    list.appendChild(row);
  });

  container.classList.remove("d-none");
}

function extractStudyTypeList(payload) {
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

function hasSelect2() {
  return typeof $.fn.select2 === "function";
}

function initGeneSelect2() {
  if (!hasSelect2()) return;
  $('#gene').select2({
    theme: 'bootstrap4',
    placeholder: 'Select a gene',
    allowClear: true,
    width: '100%',
    dropdownParent: $('#modal-crear-elemento'),
    language: 'es'
  });
}

function populateStudySelect(selectElement, selectedStudyId) {
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "Ninguno";
  selectElement.appendChild(noneOption);
  selectElement.disabled = false;

  if (!availableStudyTypes.length) {
    const loadingOption = document.createElement("option");
    loadingOption.value = "";
    loadingOption.textContent = "No hay tipos de estudios disponibles";
    loadingOption.disabled = true;
    selectElement.appendChild(loadingOption);
    selectElement.value = "";
    return;
  }

  availableStudyTypes.forEach((studyType) => {
    const option = document.createElement("option");
    option.value = String(studyType.id);
    option.textContent = studyType.name
      ? `${studyType.name} (${studyType.sheet_name})`
      : `Tipo de estudio ${studyType.id}`;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedStudyId ? String(selectedStudyId) : "";
}

function refreshExcelSheetsStudyControls() {
  if (!detectedExcelSheets.length) return;
  renderExcelSheetsList(detectedExcelSheets);
}

function serializeSheetStudyAssignments() {
  return detectedExcelSheets.map((sheetName) => {
    const studyType = currentSheetAssignments[sheetName] || "";
    return {
      sheet_name: sheetName,
      study_type: studyType ? parseInt(studyType, 10) : null,
    };
  });
}

function getStudyTypeByIdMap() {
  const map = new Map();
  availableStudyTypes.forEach((st) => map.set(String(st.id), st));
  return map;
}

function normalizeForComparison(str) {
  return String(str)
    .toLowerCase()
    .replace(/[+\-_]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Similitud por bigramas sobre la cadena solo en minúsculas (preserva +, -, _)
// para distinguir valores que difieren únicamente en esos caracteres.
function computeBigramSimilarity(a, b) {
  const na = String(a).toLowerCase().replace(/\s+/g, " ").trim();
  const nb = String(b).toLowerCase().replace(/\s+/g, " ").trim();
  if (na === nb) return 1.0;
  if (na.length < 2 || nb.length < 2) return 0;
  const toBigrams = (s) => {
    const bg = [];
    for (let i = 0; i < s.length - 1; i++) bg.push(s.slice(i, i + 2));
    return bg;
  };
  const biA = toBigrams(na);
  const biB = toBigrams(nb);
  const countA = new Map();
  biA.forEach((bi) => countA.set(bi, (countA.get(bi) || 0) + 1));
  let intersection = 0;
  biB.forEach((bi) => {
    if (countA.get(bi) > 0) {
      intersection++;
      countA.set(bi, countA.get(bi) - 1);
    }
  });
  return (2 * intersection) / (biA.length + biB.length);
}

function computeSimilarity(a, b) {
  // Coincidencia exacta (sin distinción de mayúsculas/minúsculas)
  if (String(a).toLowerCase().trim() === String(b).toLowerCase().trim()) return 1.0;
  const na = normalizeForComparison(a);
  const nb = normalizeForComparison(b);
  const wordsA = new Set(na.split(" ").filter(Boolean));
  const wordsB = new Set(nb.split(" ").filter(Boolean));
  let jaccard = 0;
  if (wordsA.size && wordsB.size) {
    let intersection = 0;
    wordsA.forEach((w) => { if (wordsB.has(w)) intersection++; });
    jaccard = intersection / (wordsA.size + wordsB.size - intersection);
  }
  // Combinar Jaccard (nivel de palabras) + bigramas (nivel de caracteres)
  // El componente de bigramas diferencia cadenas como "STUDY-1" vs "STUDY+1"
  // que serían idénticas con solo Jaccard tras normalización.
  const bigram = computeBigramSimilarity(a, b);
  return 0.6 * jaccard + 0.4 * bigram;
}

function findBestStudyTypeForSheet(sheetName) {
  if (!availableStudyTypes.length) return null;
  const THRESHOLD = 0.25;
  let bestId = null;
  let bestScore = 0;
  availableStudyTypes.forEach((studyType) => {
    const score = Math.max(
      computeSimilarity(sheetName, studyType.name || ""),
      computeSimilarity(sheetName, studyType.sheet_name || "")
    );
    if (score > bestScore) {
      bestScore = score;
      bestId = String(studyType.id);
    }
  });
  return bestScore >= THRESHOLD ? bestId : null;
}

function validateSheetAssignmentsBeforeSubmit() {
  if (!detectedExcelSheets.length) return { isValid: true };

  const assignments = serializeSheetStudyAssignments();
  const studyTypeById = getStudyTypeByIdMap();
  const renamePairs = [];
  const missingStudyTypes = [];

  assignments.forEach(({ sheet_name: source, study_type }) => {
    if (!study_type) return;
    const studyType = studyTypeById.get(String(study_type));
    if (!studyType) { missingStudyTypes.push(source); return; }
    const target = studyType.sheet_name;
    if (source !== target) renamePairs.push({ source, target });
  });

  if (missingStudyTypes.length) {
    return {
      isValid: false,
      message: "Hay estudios seleccionados que ya no existen o no se pudieron cargar. Vuelve a seleccionarlos antes de subir el archivo.",
    };
  }

  const targetToSources = new Map();
  renamePairs.forEach(({ source, target }) => {
    if (!targetToSources.has(target)) targetToSources.set(target, []);
    targetToSources.get(target).push(source);
  });

  const duplicatedTargets = [];
  targetToSources.forEach((sources, target) => {
    if (sources.length > 1) duplicatedTargets.push(`'${target}' <- ${sources.join(", ")}`);
  });

  if (duplicatedTargets.length) {
    return {
      isValid: false,
      message: "Conflicto: varias hojas intentan usar el mismo nombre destino. " + duplicatedTargets.join(" | "),
    };
  }

  const existingSheetNames = new Set(detectedExcelSheets);
  const renamedSources = new Set(renamePairs.map((p) => p.source));
  const hardCollisions = renamePairs.filter(
    ({ source, target }) => existingSheetNames.has(target) && target !== source && !renamedSources.has(target)
  );

  if (hardCollisions.length) {
    return {
      isValid: false,
      message: "Conflicto: ya existe una hoja con el nombre destino. " + hardCollisions.map(({ source, target }) => `'${source}' -> '${target}'`).join(" | "),
    };
  }

  return { isValid: true };
}

function loadAllStudies() {
  return axios.get(studyTypeUrl)
    .then((response) => {
      availableStudyTypes = extractStudyTypeList(response.data);
      refreshExcelSheetsStudyControls();
      return availableStudyTypes;
    })
    .catch((error) => {
      console.error("Error cargando estudios:", error);
      availableStudyTypes = [];
      return [];
    });
}

function readFileAsArrayBuffer(file) {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function extractSheetNamesFromExcel(file) {
  const extension = ((file && file.name) || "").split(".").pop().toLowerCase();
  if (extension === "xls") {
    renderExcelSheetsList(["No se pueden listar hojas de archivos XLS antiguos."]);
    return;
  }
  const buffer = await readFileAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(buffer);
  const workbookFile = zip.file("xl/workbook.xml");
  if (!workbookFile) throw new Error("No se encontró workbook.xml.");
  const workbookXml = await workbookFile.async("string");
  const xmlDocument = new DOMParser().parseFromString(workbookXml, "application/xml");
  if (xmlDocument.querySelector("parsererror")) throw new Error("No se pudo leer el XML del Excel.");
  const sheetNames = Array.from(xmlDocument.querySelectorAll("sheets sheet"))
    .map((s) => s.getAttribute("name")).filter(Boolean);
  renderExcelSheetsList(sheetNames);
}

function handleExcelFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    clearExcelSheetsList();
    detectedExcelSheets = [];
    return;
  }
  currentSheetAssignments = {};
  extractSheetNamesFromExcel(file).catch((error) => {
    console.error("Error leyendo las hojas del Excel:", error);
    renderExcelSheetsList(["No se pudieron leer las hojas de este archivo."]);
  });
  loadAllStudies();
}

function showFileProcessingMessage() {
  Swal.fire({
    title: "Processing",
    text: "The file is being processed. You will be notified when the upload is finished.",
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer: 4500,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

// Función para cargar la lista de genes
function loadGenes() {
  axios
    .get(geneUrl)
    .then((response) => {
      const geneSelect = document.getElementById("gene");
      
      // Destruir Select2 antes de actualizar el DOM
      if (hasSelect2() && $(geneSelect).hasClass('select2-hidden-accessible')) {
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
      initGeneSelect2();
    })
    .catch((error) => {
      console.error("Error cargando genes:", error);
    });
}

$(document).ready(function () {
  // Inicializar Select2 antes de cargar genes
  initGeneSelect2();
  
  // Cargar la lista de genes
  loadGenes();
  $("#gene").on("change", function () {
    loadAllStudies();
  });

  loadAllStudies();

  $("#tabla-de-Datos")
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
    celery_task_channel.bind("successful-upload-3d-excel", function (data) {
      console.log("Successful upload 3D Excel:", data);
      Swal.fire({ icon: "success", title: "Success", text: "File uploaded successfully." });
      if ($.fn.DataTable.isDataTable("#tabla-de-Datos")) {
        $("#tabla-de-Datos").DataTable().ajax.reload(null, false);
      }
    });
    celery_task_channel.bind("failed-upload-3d-excel", function (data) {
      console.log("Failed upload 3D Excel:", data);
      const errorDetail = data && data.error_detail ? data.error_detail : "Unknown error";
      Swal.close();
      Swal.fire({ icon: "error", title: "Upload failed", text: "The file could not be processed. " + errorDetail });
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
  clearExcelSheetsList();
  detectedExcelSheets = [];
  availableStudyTypes = [];
  currentSheetAssignments = {};
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
  const customFileInput = document.getElementById("customFile");
  if (customFileInput) {
    customFileInput.addEventListener("change", handleExcelFileChange);
  }
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
    const sheetAssignmentValidation = validateSheetAssignmentsBeforeSubmit();
    if (!sheetAssignmentValidation.isValid) {
      Swal.fire({
        icon: "error",
        title: "Error en asignaciones de hojas",
        text: sheetAssignmentValidation.message,
        showConfirmButton: true,
      });
      return;
    }

    const serializedAssignments = serializeSheetStudyAssignments();

    if (!edit_elemento && serializedAssignments.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No se detectaron hojas",
        text: "Selecciona un archivo Excel válido para cargar sus hojas antes de enviar.",
        showConfirmButton: true,
      });
      return;
    }

    let data = new FormData();
    data.append("system_user", localStorage.getItem("id"));
    data.append("custom_name", document.getElementById("name").value);
    data.append("description", document.getElementById("description").value);
    data.append("gene", $('#gene').val());
    data.append("predefined", document.getElementById("predefined").checked);
    data.set("sheet_study_assignments", JSON.stringify(serializedAssignments));

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
             table.ajax.reload();
            load.hidden = true;
            // The success message and table refresh are handled by Pusher
            // event "successful-upload-3d-excel".
          }
        })
        .catch((error) => {
          load.hidden = true;
          let dict = (error.response && error.response.data) || {};

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
