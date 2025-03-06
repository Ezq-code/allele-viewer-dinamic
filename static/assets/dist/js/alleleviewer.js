var zoomLevel = 4;
var stick_hidden = false;
var sphere_hidden = false;
var axes_hidden = false;
var plane_hidden = false;
let viewer;
let spinState = false;
var children;
var selectActual;
// variables para el graficador
let element = $("#container")[0];
let load = document.getElementById("load");
var models = [];
var cont = 0;
// en esta variable se guardan los datos despues que se cargan de los hijos
var datos;
var sphereRadiusFactor = 12;
var stickRadiusFactor = 0.003;

var snpModalShowBotton = document.getElementById("snpModalShowBotton");
var ExpandModalShowBotton = document.getElementById("ExpandModalShowBotton");
// Variable con el token
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];

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
  axes_hidden = checkboxAxes.checked ? checkboxAxes.value : null;
  if (axes_hidden == 0) {
    a.hidden = false;
    b.hidden = false;
    c.hidden = false;
    XYZLabels(true);
    viewer.render();
  } else {
    a.hidden = true;
    b.hidden = true;
    c.hidden = true;
    XYZLabels(false);
    viewer.render();
  }
});

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

// fin del menú de configuracion

// Inicializar las funciones
$(function () {
  checkInternalStatus();
  coordenadas();
  crearMatriz();
  poblarListasAllele();
  fillAllRegions();
});

// Función para poblar la lista desplegable del documento
function poblarListasAllele() {
  var $selectfile = document.getElementById("selectfile");
  axios.get("/business-gestion/uploaded-files/").then(function (response) {
    response.data.results.forEach(function (element) {
      var option = new Option(element.custom_name, element.id);
      $selectfile.add(option);
    });
    poblarListasPdb(response.data.results[0].pdb_files);
    console.log("✌️file --->");

    poblarListasCopy(response.data.results[0].id);
  });
}
// Función para poblar la lista desplegable de los pdb
function poblarListasPdb(versionAllele) {
  var $selectPdb = document.getElementById("selectPdb");

  $selectPdb.innerHTML = "";
  versionAllele.forEach(function (element) {
    var option = new Option(element.custom_name, element.id);
    $selectPdb.add(option);
  });
}

function poblarListasCopy(uploadFileId) {
  if (
    localStorage.getItem("id") &&
    localStorage.getItem("id") !== "null" &&
    localStorage.getItem("id") !== ""
  ) {
    var userId = localStorage.getItem("id");
    var url =
      "/business-gestion/working-copy-of-original-file-for-user/?system_user=" +
      userId +
      "&uploaded_file=" +
      uploadFileId;
    var $selectCopy = document.getElementById("selectCopy");
    var $inputGroup = document.getElementById("inputGroupCopy");
    $selectCopy.innerHTML = "";
    // Mostrar un mensaje de carga
    var loadingOption = new Option("Cargando...", "");
    $selectCopy.add(loadingOption);
    axios
      .get(url)
      .then(function (response) {
        // Limpiar opciones de carga
        $selectCopy.innerHTML = "";
        if (response.data.results.length > 0) {
          response.data.results.forEach(function (element) {
            var option = new Option(
              "Personal Copy # " + element.id,
              element.id
            );
            $selectCopy.add(option);
            $inputGroup.hidden = false;
          });
        } else {
          $inputGroup.hidden = true;
        }
      })
      .catch(function (error) {
        console.error("Error al obtener los datos:", error);
        var errorOption = new Option("Error al cargar", "");
        $selectCopy.add(errorOption);
      });
  }
}

// creación e inicialización del objeto view
viewer = $3Dmol.createViewer(element, {
  defaultcolors: $3Dmol.rasmolElementColors,
  controls: "trackball orbit fps scroll dnd",
});

var data1;
function displaySNPData() {
  // Datos proporcionados
  load.hidden = false;
  axios
    .get(
      "/business-gestion/uploaded-files/" +
        localStorage.getItem("uploadFileId") +
        "/initial-file-data/"
    )
    .then(function (response) {
      data1 = response.data.results;
      var table = document.getElementById("snptable");
      if (!table.querySelector("thead") && !table.querySelector("tbody")) {
        // Crear el encabezado de la tabla
        var thead = document.createElement("thead");
        var headerRow = document.createElement("tr");

        var headers = ["Allele", "Marker", "Equalizer"];
        for (var i = 0; i < headers.length; i++) {
          var th = document.createElement("th");
          th.classList.add("col-3"); // Agregar la clase "col-3"
          th.textContent = headers[i];
          headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Crear el cuerpo de la tabla
        var tbody = document.createElement("tbody");
        for (var i = 0; i < data1.length; i++) {
          var row = document.createElement("tr");

          var alleleCell = document.createElement("td");
          alleleCell.textContent = data1[i].allele;
          row.appendChild(alleleCell);

          var markerCell = document.createElement("td");
          markerCell.textContent = data1[i].marker;
          row.appendChild(markerCell);

          var controlCell = document.createElement("td");
          var input = document.createElement("input");
          input.type = "text";
          input.class = "rs_control";
          input.name = "rs_control" + i;
          input.id = "rs_control" + data1[i].id;
          input.value = data1[i].current_percent;
          controlCell.appendChild(input);
          row.appendChild(controlCell);

          tbody.appendChild(row);
        }
        table.appendChild(tbody);
      }
      for (var i = 0; i < data1.length; i++) {
        $(`#rs_control${data1[i].id}`).ionRangeSlider({
          min: 0,
          max: 100,
          type: "single",
          step: 0.001,
          postfix: "%",
          prettify: false,
          hasGrid: true,
        });
      }
      load.hidden = true;
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response.data.detail}`,
      });
      load.hidden = true;
    });
  // Obtener la referencia de la tabla HTML
}

function sendRSControlValues() {
  var rsControlInputs = document.querySelectorAll(".irs-hidden-input");
  var values = [];
  for (var i = 0; i < rsControlInputs.length; i++) {
    var inputValue = rsControlInputs[i].value;
    var inputId = parseInt(rsControlInputs[i].id.replace("rs_control", ""), 10);
    values.push({
      initial_filedata_id: inputId,
      new_percent_value: inputValue,
    });
  }

  var fileId = localStorage.getItem("uploadFileId");
  var data = {
    values: values,
    file_id: fileId,
  };

  load.hidden = false;
  $("#modal-xl").modal("hide");
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .post("/business-gestion/new-coordinate-processor/", data)
    .then(function (response) {
      // console.log("mi data:", response.data.pdb_content);
      graficar_string(response.data.pdb_content);
      load.hidden = true;
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response.data.detail}`,
      });
      load.hidden = true;
    });
}

function selectPdbContainer() {
  zoom.value = 0;
  var $selectfile = document.getElementById("selectfile");
  var idFile = $selectfile.value;
  axios
    .get("/business-gestion/uploaded-files/" + idFile + "/")
    .then(function (response) {
      const elemento = response.data;
      let versionAllele = elemento.pdb_files;
      poblarListasPdb(versionAllele);
      poblarListasCopy(elemento.id);
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response.data.detail}`,
      });
    });
}

function selectUrl() {
  zoom.value = 0;
  var $selectfile = document.getElementById("selectfile");
  var $selectPdb = document.getElementById("selectPdb");
  var idFile = $selectfile.value;
  document.getElementById("animation").disabled = false;
  document.getElementById("filter_region").disabled = false;
  console.log(" idFile:", idFile);
  axios
    .get("/business-gestion/uploaded-files/" + idFile + "/")
    .then(function (response) {
      const elemento = response.data;
      let pos = findPosition(elemento.pdb_files, $selectPdb.value);
      let versionAllele = elemento.pdb_files[pos].pdb_content;
      localStorage.setItem("uploadFileId", idFile);
      graficar_string(versionAllele);
      // To enable the button
      loadOriginalXYZ();
      snpModalShowBotton.disabled = false;
      ExpandModalShowBotton.disabled = false;
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: `${error.response}`,
      });
    });
}

function findPosition(data, id) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      return i;
    }
  }
  return -1;
}

function showInfo(atom) {
  $(".showalleleinfo").toast("hide");

  const atomNumber = atom.serial;
  //load.hidden = false;
  const toastClass = seleccionarEstiloAleatorio();
  const uploadFileId = localStorage.getItem("uploadFileId");
  const url = `/business-gestion/allele-nodes/${uploadFileId}-${atomNumber}/`;

  axios
    .get(url)
    .then((response) => {
      const elemento = response.data;
      const imageHtml = `
        <img class="attachment-img" src="/static_output/assets/dist/img/adn.gif" alt="User Avatar" style="border-radius: 14px; width: -webkit-fill-available"/>
      `;
      children = elemento.children;
      const buttons = `
        <button type="button" class="btn btn-block btn-info" onclick="mostrarRS('${
          elemento.rs
        }')">Show RS</button>
        <button type="button" class="btn btn-block btn-secondary" onclick="marcar(${
          atom.x
        }, ${atom.y}, ${atom.z})">Bookmark</button>
        <button type="button" class="btn btn-block bg-teal" onclick="childFull(${
          elemento.number
        })">Parents</button>
        <button type="button" class="btn btn-block bg-lime" onclick="loadFamily(${
          elemento.number
        })">Descendant</button>
        ${
          elemento.region != "nan"
            ? `<button type="button" class="btn btn-block btn-primary" onclick="getCountriesByRegion('${elemento.region}')">Region ${elemento.region}</button>`
            : ""
        }
      `;

      const additionalInfo =
        elemento.children_qty === 0
          ? `<hr> Data for control (temporary):<br> X ${atom.x} | Y ${atom.y} | Z ${atom.z} #: ${elemento.number}`
          : `<hr> Data Control(temp):<br> X: ${atom.x} | Y ${atom.y} | Z ${atom.z} #: ${elemento.number}<br> Appeared: ${elemento.timeline_appearence}`;

      const subtitle =
        elemento.children_qty === 0
          ? `${elemento.custom_element_name} - ${elemento.children_qty}`
          : `${elemento.number} <span class="badge badge-danger">Childs ${elemento.children_qty}</span>`;

      $(document).Toasts("create", {
        class: toastClass,
        title: elemento.custom_element_name,
        subtitle: subtitle,
        body:
          imageHtml +
          `<div class="card-body">${buttons}${additionalInfo}</div>`,
        position: "bottomRight",
      });
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

function mostrarRS(rsList) {
  Swal.fire({
    title: "RS List",
    text: rsList,
    icon: "info",
    confirmButtonText: "Ok",
  });
}

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

function callBuscar() {
  const inputValue = document.getElementById("buscar").value;
  buscar(inputValue);
}

function buscar(params) {
  load.hidden = false;
  var searchurl =
    "/business-gestion/uploaded-files/" +
    localStorage.getItem("uploadFileId") +
    "/allele-node-by-uploaded-file/?";

  if (params[0] === "=") {
    searchurl += "custom_element_name=" + params.substring(1);
  } else {
    searchurl += "search=" + params;
  }
  axios
    .get(searchurl)
    .then(function (response) {
      const elemento = response.data;
      let atomData = elemento.results;
      const highlightColor = "#ffaa02";
      datos.forEach((element) => {
        const stickRadius =
          element.children_qty === 0 ? 0.5 : 0.5 + element.children_qty * 0.005;
        const sphereRadius = stickRadius * 8 * zoomLevel;
        if (atomData.some((item) => item.number === element.number)) {
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

function loadFamilyClean() {
  childFamily(selectActual);
}
function loadFamily(id) {
  childFamily(id);
}
function loadFamilyFull(id) {
  childFamily(id);
}

function family(id) {
  const highlightColor = "#ffaa02";

  viewer.setStyle(
    {},
    {
      sphere: { color: "#eae8e8" },
      stick: { color: "#eae8e8", showNonBonded: false },
    }
  );

  viewer.setStyle(
    { serial: id },
    {
      sphere: { color: highlightColor },
      stick: { color: highlightColor, showNonBonded: false },
    }
  );

  for (let index = 0; index < children.length; index++) {
    const element = children[index].number;

    viewer.setStyle(
      { serial: element },
      {
        sphere: { color: highlightColor },
        stick: { color: highlightColor, showNonBonded: false },
      }
    );
  }

  viewer.render();
}

function getAtomBySerial(serial) {
  var atoms = viewer.getModel().selectedAtoms();

  for (var i = 0; i < atoms.length; i++) {
    if (atoms[i].serial === serial) {
      return atoms[i];
    }
  }

  return false; // Si no se encuentra el átomo con el serial especificado
}

function child() {
  console.log("localStorage.getItem :", localStorage.getItem("uploadFileId"));
  axios
    .get(
      `/business-gestion/uploaded-files/${localStorage.getItem(
        "uploadFileId"
      )}/allele-node-by-uploaded-file/?ordering=timeline_appearence`
    )
    .then(function (response) {
      const elemento = response.data;
      let atomData = elemento.results;
      datos = atomData;

      atomData.forEach((element) => {
        const stickRadius = element.stick_radius;
        const sphereRadius = element.sphere_radius;
        viewer.setStyle(
          { serial: element.number },
          {
            sphere: { radius: sphereRadius },
            stick: {
              color: "spectrum",
              radius: stickRadius,
              showNonBonded: false,
            },
          }
        );
      });
      viewer.zoomTo();
      viewer.zoom(2, 1000);
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
function childFull(id) {
  var data = {
    pdb: localStorage.getItem("uploadFileId"),
    allele_node: id,
  };
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  axios
    .post("/business-gestion/extract-allele-parents-tree/", data)
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

function resetGraficView() {
  datos.forEach((element) => {
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
  });
  // viewer.render();
}

function filterByRegion(region) {
  console.log("✌️datos --->", datos);
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

function childZoom() {
  datos.forEach((element) => {
    const stickRadius = element.stick_radius;
    const sphereRadius = element.sphere_radius * zoomLevel;
    viewer.setStyle(
      { serial: element.number },
      {
        sphere: { radius: sphereRadius },
        stick: { color: "spectrum", radius: stickRadius, showNonBonded: false },
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

function sendExpantionValues() {
  var fileId = localStorage.getItem("uploadFileId");

  var data = {
    uploaded_file: fileId,
    x_value: myRangeX.valueAsNumber,
    y_value: myRangeY.valueAsNumber,
    z_value: myRangeZ.valueAsNumber,
  };

  console.log(data);
  load.hidden = false;
  $("#modal-xyz").modal("hide");
  axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
  console.log("token", csrfToken);
  axios
    .post("/business-gestion/xyz-expansion/", data)
    .then(function (response) {
      console.log("mi data:", response.data.pdb_content);
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

function animation() {
  $(".controlpanel").toast("hide");
  load.hidden = false;
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

  // console.log("zoomLevel :", zoomLevel);
  viewer.render();
  load.hidden = true;
  $(".controlpanel").toast("hide");
  pausa = false; // Variable de control para pausar
  indiceActual = 0;
  // let ordenada=ordenarPorTimeline(datos);
  animationWindows();
  mostrarElementos(datos, 0.1);
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

function mostrarElementos(lista, tiempo) {
  if (indiceActual >= lista.length) {
    $(".controlpanel").toast("hide");
    return;
  } // Si ya se mostraron todos los elementos

  const element = lista[indiceActual];
  const stickRadius = element.stick_radius;
  const sphereRadius = element.sphere_radius * zoomLevel;

  viewer.setStyle(
    { serial: element.number },
    {
      sphere: { radius: sphereRadius, hidden: false },
      stick: {
        color: "spectrum",
        radius: stickRadius,
        showNonBonded: false,
        hidden: false,
      },
    }
  );

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

function retroceder(lista) {
  if (indiceActual > 0) {
    indiceActual--;
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

function avanzar(lista) {
  if (indiceActual < lista.length) {
    mostrarElementos(lista, 0); // Mostrar el siguiente elemento inmediatamente
  }
}

// Variable global para la velocidad
let currentSpeedIndex = 0;
const speeds = [
  { label: "x1", value: 0.5 },
  { label: "x2", value: 0.25 },
  { label: "x3", value: 0.1 },
  { label: "x4", value: 0.05 },
  { label: "x5", value: 0.025 },
];

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
                      <i class="nav-icon fas fa-pause"></i>
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

function changeSpeed() {
  // Incrementar el índice de velocidad
  currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;

  // Obtener la nueva velocidad
  const newSpeed = speeds[currentSpeedIndex];

  // Actualizar el texto del botón
  const speedButton = document.getElementById("speedButton");
  speedButton.innerHTML = `${newSpeed.label}`;
  console.log("✌️newSpeed.value --->", newSpeed.value);
  // Si hay una animación en curso, actualizarla con la nueva velocidad
  // if (/* tu condición para verificar si la animación está en curso */) {
  mostrarElementos(datos, newSpeed.value);

  //}
}

function playStopAnimation(button) {
  pausa = !pausa; // Cambiar el estado de pausa
  if (!pausa) {
    mostrarElementos(datos, speeds[currentSpeedIndex]); // Reiniciar la visualización si se reanuda
  } else {
    clearTimeout(timeoutId); // Limpiar el timeout si se pausa
  }
  togglePauseButton(button);
}


function centerGrafig() {
 viewer.zoomTo();
 viewer.zoom(2, 1000);
  viewer.render();
}