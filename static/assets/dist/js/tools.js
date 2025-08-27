function graficar_string(pdb_content) {
  load.hidden = false;
  // viewer.removeAllModels();
  // viewer.render();
  //  models[cont] = viewer.addModel(pdb_content, "pdb", { assignBonds: false });
  //  cont++;
  viewer.addModel(pdb_content, "pdb", { assignBonds: false });
  viewer.setClickable({}, true, function (atom, viewer, event, container) {
    showInfo(atom);
  });

  // Crear los objetos de línea para los ejes de coordenadas
  viewer.setCameraParameters({ fov: 2, z: 300 });
  child();
  viewer.spin(new $3Dmol.Vector3(1, 0, 0), 0.02); // Girar alrededor del eje X a una velocidad de 0.01 radianes por cuadro
  viewer.spin(false);
}

// Función para iniciar la animación del atomo
function playStop(button) {
  if (spinState) {
    viewer.spin(false);
    spinState = false;
  } else {
    viewer.spin(new $3Dmol.Vector3(1, 0, 0), 0.08);
    spinState = true;
  }
  togglePauseButton(button);
}

// Función para pausar la animación del atomo
function togglePauseButton(button) {
  var icon = button.querySelector(".nav-icon");

  if (icon.classList.contains("fa-play")) {
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  } else if (icon.classList.contains("fa-pause")) {
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  }
}
var a, b, c;
// funcion para mostrar las coordenadas
function coordenadas() {
  // Eje X
  var startX = -1000;
  var endX = 1000;
  a = viewer.addLine({
    start: { x: startX, y: 0, z: 0 },
    end: { x: endX, y: 0, z: 0 },
    color: "red",
    hidden: true,
  });

  // Eje Y
  var startY = -1000;
  var endY = 1000;
  b = viewer.addLine({
    start: { x: 0, y: startY, z: 0 },
    end: { x: 0, y: endY, z: 0 },
    color: "green",
    hidden: true,
  });

  // Eje Z
  var startZ = -1000;
  var endZ = 1000;
  c = viewer.addLine({
    start: { x: 0, y: 0, z: startZ },
    end: { x: 0, y: 0, z: endZ },
    color: "blue",
    hidden: true,
  });

  viewer.render();
}

var labelX, labelY, labelZ;
function XYZLabels(state) {
  if (state) {
    labelX = viewer.addLabel("X", { position: { x: 1000, y: 0, z: 0 } }); // Etiqueta del eje X
    labelY = viewer.addLabel("Y", { position: { x: 0, y: 1000, z: 0 } }); // Etiqueta del eje Y
    labelZ = viewer.addLabel("Z", { position: { x: 0, y: 0, z: 1000 } }); // Etiqueta del eje Z
  } else {
    viewer.removeLabel(labelX);
    viewer.removeLabel(labelY);
    viewer.removeLabel(labelZ);
  }
}

// Array global para almacenar las líneas
var lineas = [];
function crearMatriz() {
  var startX = -1000;
  var endX = 1000;
  var startY = -1000;
  var endY = 1000;
  var startZ = -1000;
  var endZ = 1000;
  var numLineas = 20; // Número de líneas en cada eje

  // Plano XY
  for (var i = 0; i <= numLineas; i++) {
    var x = startX + (endX - startX) * (i / numLineas);
    var lineObject = viewer.addLine({
      start: { x: x, y: startY, z: 0 },
      end: { x: x, y: endY, z: 0 },
      color: "rgba(15, 191, 88, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array global
  }

  for (var j = 0; j <= numLineas; j++) {
    var y = startY + (endY - startY) * (j / numLineas);
    var lineObject = viewer.addLine({
      start: { x: startX, y: y, z: 0 },
      end: { x: endX, y: y, z: 0 },
      color: "rgba(15, 191, 88, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array global
  }

  // Plano XZ
  for (var k = 0; k <= numLineas; k++) {
    var x = startX + (endX - startX) * (k / numLineas);
    var lineObject = viewer.addLine({
      start: { x: x, y: 0, z: startZ },
      end: { x: x, y: 0, z: endZ },
      color: "rgba(255, 0, 255, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array global
  }

  for (var l = 0; l <= numLineas; l++) {
    var z = startZ + (endZ - startZ) * (l / numLineas);
    var lineObject = viewer.addLine({
      start: { x: startX, y: 0, z: z },
      end: { x: endX, y: 0, z: z },
      color: "rgba(255, 0, 255, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array global
  }
  // Plano YZ
  for (var m = 0; m <= numLineas; m++) {
    var y = startY + (endY - startY) * (m / numLineas);
    var lineObject = viewer.addLine({
      start: { x: 0, y: y, z: startZ },
      end: { x: 0, y: y, z: endZ },
      color: "rgba(0, 255, 255, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array
  }

  for (var n = 0; n <= numLineas; n++) {
    var z = startZ + (endZ - startZ) * (n / numLineas);
    var lineObject = viewer.addLine({
      start: { x: 0, y: startY, z: z },
      end: { x: 0, y: endY, z: z },
      color: "rgba(0, 255, 255, 0)",
      lineWidth: 8,
      hidden: true,
    });
    lineas.push(lineObject); // Agregar la línea al array
  }
}

function mostrarOcultarPlanos(mostrar) {
  lineas.forEach(function (lineObject) {
    lineObject.hidden = mostrar;
  });
}

let arrows = [];

function marcar(xcord, ycord, zcord) {
  const arrow = viewer.addArrow({
    start: { x: xcord + 100, y: ycord + 100, z: zcord + 100 },
    end: { x: xcord, y: ycord, z: zcord },
    radius: 8.0,
    radiusRadio: 8.0,
    // wireframe:true,
    mid: 8.0,
    clickable: true,
    color: getRandomColor(),
    callback: function () {
      Swal.fire({
        title: "Do you want to hide this arrow?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          ocultarFlecha(arrows.indexOf(arrow));
        }
      });
    },
  });
  arrows.push(arrow);
  viewer.render();
}

function ocultarFlecha(index) {
  if (index >= 0 && index < arrows.length) {
    arrows[index].hidden = true;

    viewer.render();
  } else {
    console.error("Índice de flecha no válido");
  }
}

function getRandomColor() {
  // Genera valores aleatorios para los componentes rojo, verde y azul
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  // Convierte los valores a formato hexadecimal
  var rHex = r.toString(16).padStart(2, "0");
  var gHex = g.toString(16).padStart(2, "0");
  var bHex = b.toString(16).padStart(2, "0");
  // Construye el valor hexadecimal del color
  var colorHex = "#" + rHex + gHex + bHex;
  return colorHex;
}
function checkInternalStatus() {
  // Verificar si 'internal_status' existe en localStorage
  if (localStorage.getItem("internal_status") !== null) {
    // Obtener el valor de 'internal_status'
    const status = localStorage.getItem("internal_status");

    // Verificar si el valor es 'p'
    if (status === "P") {
      console.log("El valor de internal_status es 'p'.");
      ExpandModalShowBotton.hidden = false;
      snpModalShowBotton.hidden = false;
      // Aquí puedes agregar más lógica si es necesario
    } else {
      console.log("El valor de internal_status no es 'p'.");
    }
  } else {
    console.log("internal_status no existe en localStorage.");
  }
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
        console.log("✌️corte5");
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
        load.hidden = true;
        console.error("Error al obtener los datos:", error);
        var errorOption = new Option("Error al cargar", "");
        $selectCopy.add(errorOption);
      });
  }
}

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
