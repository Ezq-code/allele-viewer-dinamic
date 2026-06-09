var zoomLevel = 4;
var stick_hidden = false;
var sphere_hidden = false;
var axes_hidden = false;
var label_hidden = false;
var plane_hidden = false;
let viewer;
let viewer2;
let spinState = false;
var children;
var predecessors;
var sucessors;
var selectActual;
let labelOn = false;
// variables para el graficador
let element = $("#container")[0];
let load = document.getElementById("load");
var models = [];
var cont = 0;
var multi_graph = false;
// en esta variable se guardan los datos despues que se cargan de los hijos
var datos;
var globalData;
var sphereRadiusFactor = 12;
var stickRadiusFactor = 0.003;
var nonGeneticBaseSphereRadius = 4.2;
var nonGeneticGroupColorBySerial = {};

const nonGeneticGroupPalette = [
  "#e63946",
  "#3a86ff",
  "#2a9d8f",
  "#f4a261",
  "#8e44ad",
  "#ff006e",
  "#06d6a0",
  "#ffbe0b",
  "#1d3557",
  "#8338ec",
];

var snpModalShowBotton = document.getElementById("snpModalShowBotton");
var ExpandModalShowBotton = document.getElementById("ExpandModalShowBotton");

// Asegura id/name en campos internos de Select2 para evitar warnings de autofill.
function ensureSelect2FieldsHaveIdentity() {
  const fields = document.querySelectorAll(".select2-search__field");
  fields.forEach((field, index) => {
    if (!field.id) {
      field.id = `select2-search-field-${index + 1}`;
    }
    if (!field.name) {
      field.name = field.id;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  ensureSelect2FieldsHaveIdentity();
  $(document).on("select2:open", function () {
    ensureSelect2FieldsHaveIdentity();
  });
});

// Variable con el token
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];

// creación e inicialización del objeto view
viewer = $3Dmol.createViewer(element, {
  defaultcolors: $3Dmol.rasmolElementColors,
  controls: "trackball orbit fps scroll dnd",
});

// ==========================
// CONTROLES DE VISUALIZACION
// ==========================
// Inicio del menú de configuracion

// Bloque para mostrar las esferas
var checkboxsphere = document.getElementById("sphere_hidden");
checkboxsphere.addEventListener("change", function () {
  sphere_hidden = checkboxsphere.checked ? checkboxsphere.value : null;
});

// Bloque para mostrar las conexiones
var checkbox = document.getElementById("stick_hidden");
checkbox.addEventListener("change", function () {
  stick_hidden = checkbox.checked ? checkbox.value : null;
});

// Bloque para mostrar los ejes de coordenadas
var checkboxAxes = document.getElementById("show_axes");
checkboxAxes.addEventListener("change", function () {
  const showAxes = checkboxAxes.checked;
  axes_hidden = showAxes ? checkboxAxes.value : null;
  if (showAxes) {
    a.hidden = false;
    b.hidden = false;
    c.hidden = false;
    XYZLabels(true);
  } else {
    a.hidden = true;
    b.hidden = true;
    c.hidden = true;
    XYZLabels(false);
  }
  viewer.render();
});

// Dibuja un anillo discontinuo usando cilindros en el viewer de $3Dmol
function mostrarAnilloCilindros(viewer, config) {
  // config: { radio, color, grosor, guion, espacio, densidad, label, desplazamiento, labelAngle }
  const radio = config.radio || 5;
  const color = config.color || "#ff922b";
  const grosor = config.grosor || 0.1;
  const guion = config.guion || 5;
  const espacio = config.espacio || 3;
  const densidad = config.densidad || 4;
  const label = config.label || "";
  const eje = config.eje || "x";
  const labelAngle =
    config.labelAngle !== undefined
      ? config.labelAngle
      : Math.random() * 2 * Math.PI;
  const segmentos = Math.floor(2 * Math.PI * radio * densidad);
  for (let i = 0; i < segmentos; i++) {
    if (i % (guion + espacio) < guion) {
      const angulo1 = (i * 2 * Math.PI) / segmentos;
      const angulo2 = ((i + 1) * 2 * Math.PI) / segmentos;
      if (eje == "x") {
        viewer.addCylinder({
          start: {
            x: 0,
            y: radio * Math.cos(angulo1),
            z: radio * Math.sin(angulo1),
          },
          end: {
            x: 0,
            y: radio * Math.cos(angulo2),
            z: radio * Math.sin(angulo2),
          },
          radius: grosor,
          color: color,
          fromCap: 1,
          toCap: 1,
        });
      } else {
        if (eje == "y") {
          viewer.addCylinder({
            start: {
              x: radio * Math.cos(angulo1),
              y: 0,
              z: radio * Math.sin(angulo1),
            },
            end: {
              x: radio * Math.cos(angulo2),
              y: 0,
              z: radio * Math.sin(angulo2),
            },
            radius: grosor,
            color: color,
            fromCap: 1,
            toCap: 1,
          });
        } else {
          viewer.addCylinder({
            start: {
              x: radio * Math.cos(angulo1),
              y: radio * Math.sin(angulo1),
              z: 0,
            },
            end: {
              x: radio * Math.cos(angulo2),
              y: radio * Math.sin(angulo2),
              z: 0,
            },
            radius: grosor,
            color: color,
            fromCap: 1,
            toCap: 1,
          });
        }
      }
    }
  }

  if (!labelOn) {
    // Agregar el label si se especifica (solo una vez)
    if (label) {
      const angle = labelAngle;
      let position;
      if (eje == "x") {
        position = {
          x: 0,
          y: radio * Math.sin(angle),
          z: radio * Math.cos(angle),
        };
      } else if (eje == "y") {
        position = {
          x: radio * Math.cos(angle),
          y: 0,
          z: radio * Math.sin(angle),
        };
      } else {
        position = {
          x: radio * Math.cos(angle),
          y: radio * Math.sin(angle),
          z: 0,
        };
      }
      viewer.addLabel(label, {
        position: position,
        fontSize: 14,
        fontColor: color,
        backgroundColor: "#ffffff",
        opacity: 0.7,
        borderThickness: 1,
        borderColor: color,
      });
    }
  }
}

// Redibuja las etiquetas de escala para los anillos de referencia.
function mostrarLabelsAnillos() {
  // Lista de textos de los labels de los anillos (ajusta si tus textos cambian)
  const textosAnillos = [
    "18.000.000",
    "6.000.000",
    "2.000.000",
    "700.000",
    "300.000",
    "100.000",
    "20.000",
    "2.000",
  ];

  // Radios y colores asociados a cada label (ajusta si cambian)
  const anillos = [
    { radio: 50, color: "#94d82d", label: "18.000.000" },
    { radio: 100, color: "#1e90ff", label: "6.000.000" },
    { radio: 200, color: "#ff922b", label: "2.000.000" },
    { radio: 350, color: "#f72585", label: "700.000" },
    { radio: 500, color: "#4361ee", label: "300.000" },
    { radio: 700, color: "#b5179e", label: "100.000" },
    { radio: 900, color: "#ffbe0b", label: "20.000" },
    { radio: 1000, color: "#00b4d8", label: "2.000" },
  ];

  // Para evitar superposición, asigna un ángulo diferente a cada label
  anillos.forEach((anillo, i) => {
    const angle = (i / anillos.length) * 2 * Math.PI;
    viewer.addLabel(anillo.label, {
      position: {
        x: anillo.radio * Math.cos(angle),
        y: anillo.radio * Math.sin(angle),
        z: 0,
      },
      fontSize: 14,
      fontColor: anillo.color,
      backgroundColor: "#ffffff",
      opacity: 0.7,
      borderThickness: 1,
      borderColor: anillo.color,
    });
  });

  viewer.render();
}

// Dibuja todos los anillos de referencia sobre el eje indicado.
function viewRingsFrom(axis) {
  // Permite visualizar el gráfico desde el eje seleccionado usando 3Dmol.js
  const validAxes = ["x", "y", "z"];
  if (!validAxes.includes(axis)) {
    console.error("Invalid axis. Must be 'x', 'y', or 'z'.");
    return;
  }

  const rings = [
    { radio: 50, color: "#94d82d", label: "18,000,000" },
    { radio: 100, color: "#1e90ff", label: "6,000,000" },
    { radio: 200, color: "#ff922b", label: "2,000.000" },
    { radio: 350, color: "#f72585", label: "700,000" },
    { radio: 500, color: "#4361ee", label: "300,000" },
    { radio: 700, color: "#b5179e", label: "100,000" },
    { radio: 900, color: "#ffbe0b", label: "20,000" },
    { radio: 1000, color: "#00b4d8", label: "2,000" },
  ];

  rings.forEach((ring) => {
    mostrarAnilloCilindros(viewer, {
      radio: ring.radio,
      color: ring.color,
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: ring.label,
      eje: axis,
    });
  });
  labelOn = true;
  viewer.render();
}

// Variante legacy para dibujar anillos por eje con configuración explícita.
function viewRingsFrom2(axis) {
  // Permite visualizar el gráfico desde el eje seleccionado usando 3Dmol.js

  if (axis === "y") {
    mostrarAnilloCilindros(viewer, {
      radio: 50,
      color: "#94d82d",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "18,000,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 100,
      color: "#1e90ff",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "6,000,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 200,
      color: "#ff922b",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "2,000.000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 350,
      color: "#f72585",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "700,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 500,
      color: "#4361ee",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "300,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 700,
      color: "#b5179e",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "100,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 900,
      color: "#ffbe0b",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "20,000",
      eje: "y",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 1000,
      color: "#00b4d8",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "2,000",
      eje: "y",
    });
  } else if (axis === "z") {
    mostrarAnilloCilindros(viewer, {
      radio: 50,
      color: "#94d82d",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "18,000,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 100,
      color: "#1e90ff",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "6,000,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 200,
      color: "#ff922b",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "2,000.000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 350,
      color: "#f72585",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "700,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 500,
      color: "#4361ee",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "300,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 700,
      color: "#b5179e",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "100,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 900,
      color: "#ffbe0b",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "20,000",
      eje: "z",
    });
    mostrarAnilloCilindros(viewer, {
      radio: 1000,
      color: "#00b4d8",
      grosor: 0.5,
      guion: 1,
      espacio: 1,
      densidad: 0.08,
      label: "2,000",
      eje: "z",
    });
  } else {
    console.error("Invalid axis. Must be 'x', 'y', or 'z'.");
  }

  viewer.render();
}

var checkboxPlane = document.getElementById("show_plane");
checkboxPlane.addEventListener("change", function () {
  plane_hidden = checkboxPlane.checked ? checkboxPlane.value : null;
  if (plane_hidden == 0) {
    mostrarOcultarPlanos(false);
    viewer.render();
  } else {
    mostrarOcultarPlanos(true);
    viewer.render();
  }
});

var checkboxMultiGraph = document.getElementById("multi_graph");
checkboxMultiGraph.addEventListener("change", function () {
  multi_graph_enabled = checkboxMultiGraph.checked
    ? checkboxMultiGraph.value
    : null;
  if (multi_graph_enabled == 0) {
    multi_graph = true;
  } else {
    multi_graph = false;
  }
});

// fin del menú de configuracion

// =========================
// INICIALIZACION DE PANTALLA
// =========================
// Inicializar las funciones
$(function () {
  checkInternalStatus();
  coordenadas();
  crearMatriz();
  cargarGenes();
  // poblarListasAllele();
  viewer.removeAllLabels();

  // Suscripción a Pusher para recargar genes automáticamente al subir un nuevo archivo
  if (typeof pusherKey !== "undefined" && typeof pusherCluster !== "undefined") {
    var pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });
    var celery_task_channel = pusher.subscribe("celery-task-channel");
    celery_task_channel.bind("successful-upload-3d-excel", function (data) {
      console.log("New file uploaded, reloading genes...", data);
      const selectGene = document.getElementById("selectGene");
      selectGene.innerHTML = "";
      cargarGenes();
    });
  }
});

// Función para cargar genes en el select
function cargarGenes() {
  load.hidden = false;
  axios
    .get("/business-gestion/gene/list-for-graph/?page_size=1000")
    .then(function (response) {
      const selectGene = document.getElementById("selectGene");
      // selectGene.innerHTML = '<option value="">Selec gen</option>';
      if (response.data.results.length == 0) {
        load.hidden = true;
        return;
      }
      response.data.results.forEach(function (gene) {
        const option = document.createElement("option");
        option.value = gene.id;
        option.textContent = gene.name;
        selectGene.appendChild(option);
      });

      // Si existe selectedGenId en localStorage, selecciona ese gen y llama a poblarArchivosPorGen
      const selectedGenId = localStorage.getItem("selectedGenId");
      if (selectedGenId) {
        selectGene.value = selectedGenId;
        poblarArchivosPorGen(selectedGenId);
      } else {
        // Si hay genes, poblar los archivos del primero
        if (response.data.results.length > 0) {
          poblarArchivosPorGen(response.data.results[0].id);
        }
      }
    })
    .catch(function (error) {
      load.hidden = true;
      console.error("Error loading genes:", error);
      Swal.fire({
        icon: "error",
        title: "Error loading genes",
        text: "Could not load genes. Please try again later.",
        showConfirmButton: true,
      });
    });
}

// Evento: al cambiar el gen, filtra los archivos asociados
document.getElementById("selectGene").addEventListener("change", function () {
  const geneId = this.value;
  poblarArchivosPorGen(geneId);
});

// Evento: al cambiar el estudio, actualizar metadatos y validar su PDB por defecto.
document.getElementById("selectfile").addEventListener("change", function () {
  actualizarSelectPdbPorStudyId(this.value);
});

// Obtiene el PDB por defecto tolerando formatos de respuesta nuevos y antiguos.
// Obtiene el PDB por defecto de un estudio soportando payload legado y nuevo
function obtenerPdbPorDefectoDelEstudio(study) {
  if (!study) {
    return null;
  }

  if (Array.isArray(study.pdb_files) && study.pdb_files.length > 0) {
    return study.pdb_files[0];
  }

  if (
    study.pdb_files &&
    typeof study.pdb_files === "object" &&
    study.pdb_files.pdb_content
  ) {
    return study.pdb_files;
  }

  if (
    study.pdb_file &&
    typeof study.pdb_file === "object" &&
    study.pdb_file.pdb_content
  ) {
    return study.pdb_file;
  }

  if (study.pdb_content) {
    return {
      id: study.pdb_file_id || null,
      custom_name: study.pdb_file_name || "Default PDB",
      pdb_content: study.pdb_content,
    };
  }

  return null;
}

// Actualiza metadatos en localStorage cuando cambia el estudio seleccionado.
function actualizarSelectPdbPorStudyId(studyId) {
  if (!studyId || !Array.isArray(globalData)) {
    return;
  }

  const studyPosition = findPosition(globalData, studyId);
  if (studyPosition === -1) {
    return;
  }

  const selectedStudy = globalData[studyPosition];
  localStorage.setItem("selectedStudyId", String(selectedStudy.id));
  localStorage.setItem("selectedStudyTypeDisplay", selectedStudy.study_type_display);
  localStorage.setItem("uploadFileId", String(selectedStudy.uploaded_file));
  poblarListasPdb(obtenerPdbPorDefectoDelEstudio(selectedStudy));
  // poblarListasCopy(selectedStudy.id);
}

// Función para poblar archivos según el gen seleccionado
function poblarArchivosPorGen(geneId) {
  load.hidden = false;
  const selectfile = document.getElementById("selectfile");
  selectfile.innerHTML = "";
  if (!geneId) {
    // Si no hay gen seleccionado, limpiar y salir
    load.hidden = true;
    return;
  }
  axios
    .get("/business-gestion/study/?uploaded_file__gene=" + geneId)
    .then(function (response) {
      globalData = response.data.results;
      localStorage.setItem("globalData", JSON.stringify(globalData));
        response.data.results.forEach(function (study) {
        const option = document.createElement("option");
        option.value = study.id;
        option.textContent = study.study_type_display;
        selectfile.appendChild(option);
      });
      // Si hay archivos, poblar los pdb del primero
      if (response.data.results.length > 0) {
        const firstStudyId = response.data.results[0].id;
        selectfile.value = firstStudyId;
        actualizarSelectPdbPorStudyId(firstStudyId);
      } else {
        load.hidden = true;
        Swal.fire({
          icon: "warning",
          title: "No files",
          text: "No files available for the selected gene.",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    })
    .catch(function (error) {
      load.hidden = true;
      console.error("Error loading files:", error);
      Swal.fire({
        icon: "error",
        title: "Error loading files",
        text: "Could not load files. Please try again later.",
        showConfirmButton: true,
      });
    });
}

// Valida disponibilidad del PDB por defecto y dispara carga automática cuando aplique
function poblarListasPdb(pdbDefault) {
  load.hidden = false;

  if (!pdbDefault || !pdbDefault.pdb_content) {
    load.hidden = true;
    Swal.fire({
      icon: "warning",
      title: "No PDB files",
      text: "No PDB files available.",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }
  
  let autoLoad = localStorage.getItem("autoLoad");

  if (autoLoad == `true`) {
    selectUrl();
    localStorage.setItem("autoLoad", "false");
  }
  load.hidden = true;
}

// Carga el PDB activo en el viewer y habilita acciones de interacción.
function selectUrl() {
  try {
    if (!multi_graph) {
      viewer.clear();
    }
    labelOn = false;
    zoom.value = 0;
    var $selectfile = document.getElementById("selectfile");
    var idFile = $selectfile.value;
    
    // Validar que hay estudio seleccionado
    if (!idFile) {
      load.hidden = true;
      Swal.fire({
        icon: "warning",
        title: "Select a file",
        text: "Please select a gene and file.",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
    
    document.getElementById("animation").disabled = false;
    document.getElementById("filter_region").disabled = false;

    const elemento = globalData[findPosition(globalData, $selectfile.value)];
console.log('✌️elemento --->', elemento);
    
    if (!elemento) {
      load.hidden = true;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "The selected file could not be found.",
        showConfirmButton: true,
      });
      return;
    }
    
    const pdbDefault = obtenerPdbPorDefectoDelEstudio(elemento);

    if (!pdbDefault || !pdbDefault.pdb_content) {
      load.hidden = true;
      Swal.fire({
        icon: "warning",
        title: "No PDB files",
        text: "No PDB files available for the selected file.",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    let versionAllele = pdbDefault.pdb_content;
    localStorage.setItem("selectedStudyId", String(idFile));
    localStorage.setItem("uploadFileId", String(elemento.uploaded_file));
    if (pdbDefault.id) {
      localStorage.setItem("selectedPdbId", String(pdbDefault.id));
    }
    localStorage.setItem("pdb", versionAllele);
    graficar_string(versionAllele);
    snpModalShowBotton.disabled = false;
    ExpandModalShowBotton.disabled = false;
  } catch (error) {
    load.hidden = true;
    console.error("Error in selectUrl:", error);
    Swal.fire({
      icon: "error",
      title: "Error loading the file",
      text: "An unexpected error occurred. Please try again later.",
      showConfirmButton: true,
    });
  }
}

// Busca la posición de un elemento por id dentro de un arreglo.
function findPosition(data, id) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      return i;
    }
  }
  return -1;
}

// ==========================
// INTERACCIONES CON UN NODO
// ==========================

// Consulta datos del nodo clickeado y muestra un toast con acciones contextuales.
async function showInfo(atom) {
  $(".showalleleinfo").toast("hide");

  const atomNumber = atom.serial;

  load.hidden = false;
  const toastClass = seleccionarEstiloAleatorio();
  const selectedStudyId = localStorage.getItem("selectedStudyId");
   const selectedStudyTypeDisplay = localStorage.getItem("selectedStudyTypeDisplay");

  let specific_node_url = ""
  if (selectedStudyTypeDisplay == 'Genetic Allele') {
    specific_node_url='allele-nodes'
console.log('✌️specific_node_url --->', specific_node_url);
  }
  else{
    specific_node_url='protein-nodes'
console.log('✌️specific_node_url --->', specific_node_url+" "+selectedStudyId+" "+atomNumber);
  }
  const url = `/business-gestion/${specific_node_url}/${selectedStudyId}-${atomNumber}/`;
console.log('✌️url --->', url);

  axios
    .get(url)
    .then((response) => {
      const elemento = response.data;
console.log('✌️elemento --->', elemento);

      // const imageHtml = `
      //   <img class="attachment-img" src="/static_output/assets/dist/img/adn.gif" alt="User Avatar" style="border-radius: 14px; width: -webkit-fill-available"/>
      // `;

      const map = `<div id="world-map3" style="width: 320px; height: 200px; margin: 0 auto; background-color: #fff;"></div>
        <!-- Map card -->
            <div class="location-label" style="background-color: #a5bfdd; color: #666666; padding-left: 2px;">
  <i class="fas fa-circle"></i>
  <span class="ml-2">Selected Region: ${elemento.region}</span>
</div>`;

      children = elemento.children;
      predecessors = elemento.predecessors;
      sucessors = elemento.sucessors;
      console.log("Children:", children);
      console.log("Predecessors:", predecessors);
      console.log("Sucessors:", sucessors);
      const buttons = `<div class="btn-group btn-shadow">
        <button type="button" class="btn  btn-danger" data-toggle="tooltip" title="Show RS" onclick="mostrarRS('${
          elemento.rs
        }')">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-info"   data-target="#timelineModal" data-toggle="tooltip" title="Formation" onclick="showFormation('${
          elemento.allele
        }')">
          <i class="fas fa-stream"></i>
        </button>
        <button type="button" class="btn  btn-warning" data-toggle="tooltip" title="Bookmark" onclick="marcar(${
          atom.x
        }, ${atom.y}, ${atom.z})">
          <i class="fas fa-bookmark"></i>
        </button>
              
        <button type="button" class="btn  bg-lime" data-toggle="tooltip" title="Descendant" onclick="genealogicalTree(${
          elemento.number
        })">
          <i class="fas fa-sitemap"></i>
        </button>
        ${
          elemento.region != "nan"
            ? `<button type="button" class="btn  btn-primary" data-toggle="tooltip" title="Stand Out ${elemento.region}" onclick="standOutRegionEspecific('${elemento.region}')">
                <i class="fas fa-globe"></i>
              </button>`
            : ""
        }
      </div>`;
      //   <button type="button" class="btn  bg-lime" data-toggle="tooltip" title="Descendant" onclick="loadFamily(${elemento.number})">
      //   <i class="fas fa-sitemap"></i>
      // </button>
      const additionalInfo =
        elemento.children_qty === 0
          ? `<hr> Data for control (temporary):<br> X ${atom.x} | Y ${atom.y} | Z ${atom.z} #: ${elemento.number}`
          : `<hr> Data Control(temp):<br> X: ${atom.x} | Y ${atom.y} | Z ${atom.z} #: ${elemento.number}<br> Appeared: ${elemento.timeline_appearence}`;

      const subtitle =
        elemento.children_qty === 0
          ? `${elemento.allele} - ${elemento.children_qty}`
          : `${elemento.number} <span class="badge badge-danger">Childs ${elemento.children_qty}</span>`;

      $(document).Toasts("create", {
        class: toastClass,
        title: elemento.allele,
        subtitle: subtitle,
        body:
          // imageHtml +
          map + `<div class="card-body">${buttons}${additionalInfo}</div>`,
        position: "bottomRight",
      });

      initializeWorldMap("#world-map3", elemento.region);
      // paintRegionEspecific(elemento.region);
    })
    .catch((error) => {
      Toast.fire({
        icon: "error",
        title: `${error.response.data.detail}`,
      });
    })
    .finally(() => {
      load.hidden = true;
    });
}

  // Muestra en un modal la lista de RS asociada al nodo.
function mostrarRS(rsList) {
  Swal.fire({
    title: "RS List",
    text: rsList,
    icon: "info",
    confirmButtonText: "Ok",
  });
}

// Selecciona aleatoriamente el estilo visual del toast de información.
function seleccionarEstiloAleatorio() {
  const estilos = [
    "bg-info showalleleinfo",
    "bg-success showalleleinfo",
    "bg-warning showalleleinfo",
    "bg-danger showalleleinfo",
    "bg-maroon showalleleinfo",
  ];
  const indiceAleatorio = Math.floor(Math.random() * estilos.length);
  return estilos[indiceAleatorio];
}

// Dispara la búsqueda usando el valor actual del input de texto.
function callBuscar() {
  const inputValue = document.getElementById("buscar").value;
  buscar(inputValue);
}

// Indica si el estudio actual usa el modo de tamaño uniforme para esferas.
function isNonGeneticStudy() {
  return localStorage.getItem("selectedStudyTypeDisplay") !== "Genetic Allele";
}

// Verifica si el nodo está marcado como final para alelo.
function isFinalAlleleNode(node) {
  return node.is_final_for_allele === true || node.is_final_for_allele === "true";
}

// Calcula el radio efectivo de la esfera según tipo de estudio y estado final.
function resolveSphereRadius(node, zoomMultiplier = 1) {
  if (isNonGeneticStudy()) {
    const baseRadius = isFinalAlleleNode(node)
      ? nonGeneticBaseSphereRadius * 2
      : nonGeneticBaseSphereRadius;
    return baseRadius * zoomMultiplier;
  }

  return (node.sphere_radius || nonGeneticBaseSphereRadius) * zoomMultiplier;
}

// Devuelve el color base de la esfera para el nodo según el grupo conectado.
function resolveSphereColor(node) {
  if (!isNonGeneticStudy()) {
    return null;
  }
  return nonGeneticGroupColorBySerial[node.number] || "#3a86ff";
}

// Devuelve el color base del stick para el nodo actual.
function resolveStickColor(node) {
  if (!isNonGeneticStudy()) {
    return "spectrum";
  }
  return nonGeneticGroupColorBySerial[node.number] || "#3a86ff";
}

// Calcula grupos conectados (componentes) y asigna un color distinto por grupo.
function assignNonGeneticGroupColors() {
  nonGeneticGroupColorBySerial = {};
  if (!isNonGeneticStudy() || !Array.isArray(datos) || datos.length === 0) {
    return;
  }

  const model = viewer.getModel();
  if (!model || !Array.isArray(model.atoms)) {
    return;
  }

  const nodesSerialSet = new Set(datos.map((node) => Number(node.number)));
  const atomsBySerial = new Map();

  model.atoms.forEach((atom, atomIndex) => {
    if (!atom || !nodesSerialSet.has(Number(atom.serial))) {
      return;
    }
    atomsBySerial.set(Number(atom.serial), { atom, atomIndex });
  });

  const visited = new Set();
  let groupIndex = 0;

  nodesSerialSet.forEach((serial) => {
    if (visited.has(serial)) {
      return;
    }

    const groupColor =
      nonGeneticGroupPalette[groupIndex % nonGeneticGroupPalette.length];
    groupIndex++;

    const queue = [serial];
    visited.add(serial);

    while (queue.length > 0) {
      const currentSerial = queue.shift();
      nonGeneticGroupColorBySerial[currentSerial] = groupColor;

      const current = atomsBySerial.get(currentSerial);
      if (!current || !Array.isArray(current.atom.bonds)) {
        continue;
      }

      current.atom.bonds.forEach((bondedAtomIndex) => {
        const bondedAtom = model.atoms[bondedAtomIndex];
        if (!bondedAtom) {
          return;
        }

        const bondedSerial = Number(bondedAtom.serial);
        if (!nodesSerialSet.has(bondedSerial) || visited.has(bondedSerial)) {
          return;
        }

        visited.add(bondedSerial);
        queue.push(bondedSerial);
      });
    }
  });
}

// Filtra y resalta nodos en el viewer según un término de búsqueda.
function buscar(params) {
  load.hidden = false;
  var searchurl =
    "/business-gestion/uploaded-files/" +
    localStorage.getItem("uploadFileId") +
    "/allele-node-by-uploaded-file/?search=" +
    params;

  axios
    .get(searchurl)
    .then(function (response) {
      const elemento = response.data;
      let atomData = elemento.results;
      const highlightColor = "#ffaa02";
      datos.forEach((element) => {
        const stickRadius = element.stick_radius;
        const sphereRadius = resolveSphereRadius(element);
        if (atomData.some((item) => item.number == element.number)) {
          viewer.setStyle(
            { serial: element.number },
            {
              sphere: { color: "#ff1414", radius: sphereRadius },
              stick: {
                color: "#fcfcfc",
                radius: stickRadius,
                showNonBonded: false,
              },
            }
          );
        } else {
          viewer.setStyle(
            { serial: element.number },
            {
              sphere: { color: "#fcfcfc", radius: sphereRadius },
              stick: {
                color: "#fcfcfc",
                radius: stickRadius,
                showNonBonded: false,
              },
            }
          );
        }
      });
      viewer.render();
      load.hidden = true;
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response.data.detail}`,
      });
    });
}

// Wrapper para cargar familia usando el nodo seleccionado actualmente.
function loadFamilyClean() {
  childFamily(selectActual);
}

// Wrapper para cargar la familia visible de un nodo dado.
function loadFamily(id) {
  childFamily(id);
}

// Wrapper legacy para mantener compatibilidad de llamadas completas.
function loadFamilyFull(id) {
  childFamily(id);
}

// Resalta visualmente el nodo objetivo y sus hijos directos.
function family(id) {
  const highlightColor = "#ffaa02";

  datos.forEach((element) => {
    const isTarget = children.some((item) => item.number === element.number) || element.number === id;
    
    if (isTarget) {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: { color: highlightColor, radius: resolveSphereRadius(element), hidden: false },
          stick: { color: highlightColor, radius: element.stick_radius, showNonBonded: false, hidden: false },
        }
      );
    } else {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: { color: "#eae8e8", radius: resolveSphereRadius(element), hidden: false },
          stick: { color: "#eae8e8", radius: element.stick_radius, showNonBonded: false, hidden: false },
        }
      );
    }
  });

  viewer.render();
}

// Devuelve un átomo por serial usando los átomos seleccionados del modelo.
function getAtomBySerial(serial) {
  var atoms = viewer.getModel().selectedAtoms();

  for (var i = 0; i < atoms.length; i++) {
    if (atoms[i].serial === serial) {
      return atoms[i];
    }
  }

  return false; // Si no se encuentra el átomo con el serial especificado
}


// Agrega labels en nodos finales cuando el estudio no es tipo Genetic Allele.
function addFinalAlleleLabelsIfNeeded() {
  const selectedStudyTypeDisplay = localStorage.getItem(
    "selectedStudyTypeDisplay"
  );

  if (selectedStudyTypeDisplay === "Genetic Allele") {
    return;
  }

  datos.forEach((node) => {
    const isFinalNode = isFinalAlleleNode(node);

    if (!isFinalNode || !node.allele) {
      return;
    }

    const atom = obtenerAtomoDesdeViewer(viewer, node.number);
    if (!atom) {
      return;
    }

    viewer.addLabel(String(node.allele), {
      position: {
        x: atom.x,
        y: atom.y,
        z: atom.z,
      },
      fontSize: 12,
      fontColor: "#111111",
      backgroundColor: "#ffffff",
      opacity: 0.85,
      borderThickness: 1,
      borderColor: "#ff6b6b",
    });
  });
}

// Aplica estilo base a todos los nodos del estudio y centra la escena.
function child() {
  viewer.removeAllLabels();
  const selectedStudyId = localStorage.getItem("selectedStudyId");

  const elemento = globalData[findPosition(globalData, selectedStudyId)];
  if (!elemento) {
    load.hidden = true;
    return;
  }
  datos = elemento.allele_nodes;
  assignNonGeneticGroupColors();

  datos.forEach((element) => {
    const sphereColor = resolveSphereColor(element);
    const stickColor = resolveStickColor(element);
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: {
          radius: resolveSphereRadius(element),
          color: sphereColor || undefined,
        },
        stick: {
          color: stickColor,
          radius: element.stick_radius,
          showNonBonded: false,
        },
      }
    );
  });

  addFinalAlleleLabelsIfNeeded();

  viewer.zoomTo();
  viewer.zoom(5, 1000);
  viewer.render();
  load.hidden = true;
}

// Solicita y muestra el árbol familiar completo del nodo seleccionado.
function childFull(id) {
  var data = {
    pdb: localStorage.getItem("uploadFileId"),
    allele_node: id,
  };
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .post("/business-gestion/extract-allele-full-family-tree/", data)
    .then(function (response) {
      let atomData = response.data;
      datos.forEach((element) => {
        const isVisible =
          atomData.some((item) => item === element.number) ||
          element.number === id;
        if (isVisible) {
          viewer.setStyle(
            { serial: element.number },
            {
              sphere: {
                hidden: false, // Ocultar esfera
              },
              stick: {
                hidden: false, // Ocultar stick
              },
            }
          );
        } else {
          viewer.setStyle(
            { serial: element.number },
            {
              sphere: {
                hidden: true, // Ocultar esfera
              },
              stick: {
                hidden: true, // Ocultar stick
              },
            }
          );
        }
      });
      viewer.render();
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response}`,
      });
    });
}

  // Muestra solo el nodo actual y sus descendientes inmediatos.
function childFamily(id) {
  datos.forEach((element) => {
    const isVisible =
      children.some((item) => item.number === element.number) ||
      element.number === id;

    if (isVisible) {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            hidden: false, // Ocultar esfera
          },
          stick: {
            hidden: false, // Ocultar stick
          },
        }
      );
    } else {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            hidden: true, // Ocultar esfera
          },
          stick: {
            hidden: true, // Ocultar stick
          },
        }
      );
    }
  });
  viewer.render();
}

// Localiza un átomo en el modelo completo a partir del serial.
function obtenerAtomoDesdeViewer(viewer, serial) {
  // 1. Acceder a la estructura molecular
  const estructura = viewer.getModel().atoms;
  // 2. Buscar en la jerarquía de componentes
  return estructura.find((item) => item.serial === serial) || null;
}

// Pinta el árbol genealógico separando nodo principal, predecesores y sucesores.
function genealogicalTree(id) {
  console.log("sucessors:", sucessors);
  console.log("predecessors:", predecessors);
  console.log("id:", id);
  console.log("datos:", datos.map(e => e.number));
  
  // Eliminar TODAS las etiquetas del viewer
  viewer.removeAllLabels();
  if (labelOn) {
    mostrarLabelsAnillos();
  }

  let sucesorLabel,
    predecesorLabel = false;

  load.hidden = false;
  datos.forEach((element) => {
    const elementNumber = Number(element.number);
    const isPredecessor = predecessors.some((item) => Number(item) === elementNumber);
    const isSuccessor = sucessors.some((item) => Number(item) === elementNumber);
    const isSelected = elementNumber === Number(id);

    // Aplicar estilos específicos para el nodo principal
    if (isSelected) {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            color: "#ff0000", // Color rojo para destacar
            radius: resolveSphereRadius(element),
            hidden: false,
          },
          stick: {
            color: "#ff0000", // Color rojo para las conexiones
            radius: element.stick_radius, // Mantener radio original
            hidden: false,
          },
        }
      );
      let atomoEncontrado = obtenerAtomoDesdeViewer(viewer, element.number);
      // Agregar un label al nodo original
      var labelfamily = viewer.addLabel("Selected allele", {
        position: {
          x: atomoEncontrado.x,
          y: atomoEncontrado.y,
          z: atomoEncontrado.z,
        },
        fontSize: 12,
        fontColor: "#ff0000",
        backgroundColor: "#150101",
        opacity: 0.8,
        borderThickness: 1,
        borderColor: "#ff0000",
      });
    } else if (isPredecessor) {
      // Pintar predecesores de verde
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            color: "#00ff00", // Color verde
            radius: resolveSphereRadius(element),
            hidden: false,
          },
          stick: {
            color: "#00ff00", // Color verde para las conexiones
            radius: element.stick_radius, // Mantener radio original
            hidden: false,
          },
        }
      );
      if (!predecesorLabel) {
        // Si el nodo tiene hijos, mostrar un label
        let atomoEncontradoPredecessors = obtenerAtomoDesdeViewer(
          viewer,
          element.number
        );
        // Agregar un label al nodo original
        viewer.addLabel("Predecessor alleles", {
          position: {
            x: atomoEncontradoPredecessors.x,
            y: atomoEncontradoPredecessors.y,
            z: atomoEncontradoPredecessors.z,
          },
          fontSize: 12,
          fontColor: "#00ff00",
          backgroundColor: "#150101",
          opacity: 0.8,
          borderThickness: 1,
          borderColor: "#00ff00",
        });
        predecesorLabel = true;
      }
    } else if (isSuccessor) {
      // Pintar sucesores de amarillo
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            color: "#ffff00", // Color amarillo
            radius: resolveSphereRadius(element),
            hidden: false,
          },
          stick: {
            color: "#ffff00", // Color amarillo para las conexiones
            radius: element.stick_radius, // Mantener radio original
            hidden: false,
          },
        }
      );
      if (!sucesorLabel) {
        let atomoSucessorsEncontrado = obtenerAtomoDesdeViewer(
          viewer,
          element.number
        );
        // Agregar un label al nodo original
        viewer.addLabel("Successor alleles", {
          position: {
            x: atomoSucessorsEncontrado.x,
            y: atomoSucessorsEncontrado.y,
            z: atomoSucessorsEncontrado.z,
          },
          fontSize: 12,
          fontColor: "#ffff00",
          backgroundColor: "#150101",
          opacity: 0.8,
          borderThickness: 1,
          borderColor: "#ffff00",
        });
        sucesorLabel = true;
      }
    } else {
      // Ocultar nodos no relacionados
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            hidden: true,
          },
          stick: {
            hidden: true,
          },
        }
      );
    }
  });
  viewer.render();
  load.hidden = true;
}

// ==========================
// FILTROS Y TRANSFORMACIONES
// ==========================

// Abre un selector modal para filtrar nodos por región geográfica.
function filter_Region() {
  Swal.fire({
    title: "Select a Region",
    input: "select",
    inputOptions: {
      Africa: "Africa",
      Europe: "Europe",
      "East-Asia": "East-Asia",
      "South-Asia": "South-Asia",
      America: "America",
      "Middle-East": "Middle-East",
      "Central-Asia": "Central-Asia",
      Australian: "Australian",
    },
    inputPlaceholder: "Select a region",
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve();
        } else {
          resolve("You need to select a region");
        }
      });
    },
  }).then((result) => {
    if (result.isConfirmed) {
      applyRegionFilter(result.value);
    }
  });
}

// Aplica el filtro de región ocultando nodos fuera de la selección.
function applyRegionFilter(region) {
  resetGraficView();
  datos.forEach((element) => {
    const isVisible = element.region === region;

    if (!isVisible) {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            hidden: true, // Ocultar esfera
          },
          stick: {
            hidden: true, // Ocultar stick
          },
        }
      );
    }
  });
  viewer.render();
}

// Restablece la visibilidad completa de nodos y conexiones.
function resetGraficView() {
  datos.forEach((element) => {
    const sphereColor = resolveSphereColor(element);
    const stickColor = resolveStickColor(element);
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: {
          color: sphereColor || undefined,
          hidden: false, // Ocultar esfera
        },
        stick: {
          color: stickColor,
          hidden: false, // Ocultar stick
        },
      }
    );
  });
  // viewer.render();
}

// Variante directa del filtro por región para reutilización interna.
function filterByRegion(region) {
  datos.forEach((element) => {
    const isVisible = element.region === region;

    if (!isVisible) {
      viewer.setStyle(
        { serial: element.number },
        {
          sphere: {
            hidden: true, // Ocultar esfera
          },
          stick: {
            hidden: true, // Ocultar stick
          },
        }
      );
    }
  });
  viewer.render();
}

// Reescala radios de esfera según el nivel de zoom personalizado.
function childZoom() {
  datos.forEach((element) => {
    const stickRadius = element.stick_radius;
    const sphereRadius = resolveSphereRadius(element, zoomLevel);
    const sphereColor = resolveSphereColor(element);
    const stickColor = resolveStickColor(element);
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: { radius: sphereRadius, color: sphereColor || undefined },
        stick: { color: stickColor, radius: stickRadius, showNonBonded: false },
      }
    );
  });
  viewer.render();
  load.hidden = true;
}

var zoom = document.getElementById("customRange1");
zoom.addEventListener("input", function () {
  let load = document.getElementById("load");
  zoomLevel = zoom.value;
  childZoom();
});

// displaySNPModal
snpModalShowBotton.addEventListener("click", function () {
  displaySNPData();
});

var addchangessnp = document.getElementById("addchangessnp");
addchangessnp.addEventListener("click", function () {
  sendRSControlValues();
});

// Carga los valores actuales de expansión XYZ del archivo activo.
function loadOriginalXYZ() {
  axios
    .get(
      "/business-gestion/xyz-expansion/" + localStorage.getItem("uploadFileId")
    )
    .then(function (response) {
      currX.innerText = response.data.x_value;
      currY.innerText = response.data.y_value;
      currZ.innerText = response.data.z_value;
      myRangeX.value = response.data.x_value;
      myRangeY.value = response.data.y_value;
      myRangeZ.value = response.data.z_value;
    });
}

var expandAplicate = document.getElementById("ExpandAplicateButton");
expandAplicate.addEventListener("click", function () {
  sendExpantionValues();
});

var currX = document.getElementById("currX");
var myRangeX = document.getElementById("myRangeX");
var currY = document.getElementById("currY");
var myRangeY = document.getElementById("myRangeY");
var currZ = document.getElementById("currZ");
var myRangeZ = document.getElementById("myRangeZ");

myRangeX.addEventListener("change", () => {
  currX.innerText = myRangeX.valueAsNumber;
});
myRangeY.addEventListener("change", () => {
  currY.innerText = myRangeY.valueAsNumber;
});
myRangeZ.addEventListener("change", () => {
  currZ.innerText = myRangeZ.valueAsNumber;
});

// Envía al backend los factores XYZ y repinta el PDB resultante.
function sendExpantionValues() {
  var fileId = localStorage.getItem("uploadFileId");

  var data = {
    uploaded_file: fileId,
    x_value: myRangeX.valueAsNumber,
    y_value: myRangeY.valueAsNumber,
    z_value: myRangeZ.valueAsNumber,
  };

  load.hidden = false;
  $("#modal-xyz").modal("hide");
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .post("/business-gestion/xyz-expansion/", data)
    .then(function (response) {
      graficar_string(response.data.pdb_content);
      load.hidden = true;
    })
    .catch(function (error) {
      load.hidden = true;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.response.data.detail}`,
        footer:
          '<a class="nav-link" href="./login" role="button">Go to the login page</a>',
      });
    });
}

  // Inicializa el modo animación ocultando nodos y mostrando controles.
function animation() {
  viewer.removeAllLabels();
  currentAnimationLabel = null;
  $(".controlpanel").toast("hide");
  load.hidden = false;
  console.log("datos", datos);
  datos.forEach((element) => {
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: {
          hidden: true, // Ocultar esfera
        },
        stick: {
          hidden: true, // Ocultar stick
        },
      }
    );
  });

  viewer.render();
  load.hidden = true;
  $(".controlpanel").toast("hide");
  clearTimeout(timeoutId);
  pausa = true; // Inicia en pausa hasta que el usuario pulse Play
  indiceActual = 0;
  currentSpeedIndex = 0;
  // let ordenada=ordenarPorTimeline(datos);
  animationWindows();
  const speedButton = document.getElementById("speedButton");
  if (speedButton) {
    speedButton.innerHTML = `${speeds[currentSpeedIndex].label}`;
  }
}
// function ordenarPorTimeline(lista) {
//   // Ordenar la lista por la propiedad timeline_appearence
//   const listaOrdenada = lista.sort((a, b) => a.timeline_appearence - b.timeline_appearence);

//   // Retornar la lista ordenada
//   return listaOrdenada;
// }

let pausa = false; // Variable de control para pausar
let indiceActual = 0; // Índice del elemento actual
let timeoutId; // Para almacenar el timeout
let currentAnimationLabel = null; // Label activo durante la animación

// Reproduce la animación paso a paso mostrando nodos por timeline.
function mostrarElementos(lista, tiempo) {
  if (indiceActual >= lista.length) {
    if (currentAnimationLabel) {
      viewer.removeLabel(currentAnimationLabel);
      currentAnimationLabel = null;
      viewer.render();
    }
    $(".controlpanel").toast("hide");
    return;
  } // Si ya se mostraron todos los elementos

  const element = lista[indiceActual];
  const stickRadius = element.stick_radius;
  const sphereRadius = resolveSphereRadius(element);
  const stickColor = resolveStickColor(element);

  viewer.setStyle(
    { serial: element.number },
    {
      sphere: { radius: sphereRadius, hidden: false },
      stick: {
        color: stickColor,
        radius: stickRadius,
        showNonBonded: false,
        hidden: false,
      },
    }
  );

  if (currentAnimationLabel) {
    viewer.removeLabel(currentAnimationLabel);
    currentAnimationLabel = null;
  }

  const atom = obtenerAtomoDesdeViewer(viewer, element.number);
  if (atom) {
    const nodeLabel =
      element.allele ||
      element.allele ||
      `Node ${element.number}`;
    currentAnimationLabel = viewer.addLabel(nodeLabel, {
      position: {
        x: atom.x,
        y: atom.y,
        z: atom.z,
      },
      fontSize: 12,
      fontColor: "#ffffff",
      backgroundColor: "#150101",
      opacity: 0.8,
      borderThickness: 1,
      borderColor: "#6c757d",
    });
  }

  viewer.render();
  document.getElementById("yearshow").textContent = element.timeline_appearence;
  indiceActual++;

  // Solo continuar si no está en pausa
  if (!pausa) {
    timeoutId = setTimeout(
      () => mostrarElementos(lista, tiempo),
      tiempo * 1000
    );
  }
}

// Retrocede un paso en la animación ocultando el nodo previo.
function retroceder(lista) {
  if (indiceActual > 0) {
    indiceActual--;
    if (currentAnimationLabel) {
      viewer.removeLabel(currentAnimationLabel);
      currentAnimationLabel = null;
    }
    // Mostrar el elemento anterior inmediatamente
    const element = datos[indiceActual];
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: {
          hidden: true, // Ocultar esfera
        },
        stick: {
          hidden: true, // Ocultar stick
        },
      }
    );

    viewer.render();
    document.getElementById("yearshow").textContent =
      element.timeline_appearence;
    // mostrarElementos(lista, 0);
  }
}

// Avanza un paso en la animación de manera inmediata.
function avanzar(lista) {
  if (indiceActual < lista.length) {
    mostrarElementos(lista, 0); // Mostrar el siguiente elemento inmediatamente
  }
}

// Variable global para la velocidad
let currentSpeedIndex = 0;
const speeds = [
  { label: "x0.5", value: 1.0 },
  { label: "x1", value: 0.5 },
  { label: "x2", value: 0.25 },
  { label: "x3", value: 0.1 },
  { label: "x4", value: 0.05 },
];

// Construye el panel toast con controles de reproducción de la animación.
function animationWindows() {
  $(document).Toasts("create", {
    class: "bg-lightblue controlpanel",
    title: "Animation Control",
    position: "bottomLeft",
    icon: "nav-icon fas fa-vr-cardboard",

    body: ` <div class=" d-flex justify-content-center"><h3 id='yearshow'>years</h3></div>
    <div class="btn-group d-flex justify-content-center mb-2">
                    <button
                      type="button"
                      class="btn btn-warning"
                      title="backward"
                      onclick="retroceder(datos)"
                    >
                      <i class="nav-icon fas fa-backward"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-success"
                      title="Play"
                      onclick="playStopAnimation(this)"
                    >
                      <i class="nav-icon fas fa-play"></i>
                    </button>
                     <button
                      type="button"
                      class="btn btn-info"
                      id='speedButton'
                      title="Change Speed"
                      onclick="changeSpeed()"
                    >
                      x1
                    </button>
                    <button
                      type="button"
                      class="btn btn-warning"
                      id='animation'
                      title="forward"
                      onclick="avanzar(datos)"
                    >
                      <i class="nav-icon fas fa-forward"></i>
                    </button>                   

                  </div>`,
  });
}

// Cambia la velocidad de reproducción entre presets configurados.
function changeSpeed() {
  // Incrementar el índice de velocidad
  currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;

  // Obtener la nueva velocidad
  const newSpeed = speeds[currentSpeedIndex];

  // Actualizar el texto del botón
  const speedButton = document.getElementById("speedButton");
  speedButton.innerHTML = `${newSpeed.label}`;
  // Si está reproduciendo, aplicar la nueva velocidad al siguiente paso.
  if (!pausa) {
    clearTimeout(timeoutId);
    mostrarElementos(datos, newSpeed.value);
  }
}

// Alterna entre pausar y reanudar la animación temporal.
function playStopAnimation(button) {
  pausa = !pausa; // Cambiar el estado de pausa
  if (!pausa) {
    mostrarElementos(datos, speeds[currentSpeedIndex].value); // Reiniciar la visualización si se reanuda
  } else {
    clearTimeout(timeoutId); // Limpiar el timeout si se pausa
  }
  togglePauseButton(button);
}

// Reencuadra el contenido del viewer al centro de la escena.
function centerGrafig() {
  viewer.zoomTo();
  viewer.zoom(2, 1000);
  viewer.render();
}

// Limpia el viewer completo eliminando modelos y estilos activos.
function selectClear() {
  viewer.clear();
  viewer.render();
}
