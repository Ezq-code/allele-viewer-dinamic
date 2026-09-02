// ==========================
// EXPORT / IMPORT DEL ESTADO DEL VISOR
// ==========================
// Gestiona la descarga de la instantánea del gráfico como JSON y su posterior
// restauración: selección de gen/estudio, carga del PDB, controles, filtros,
// overlays de familias y cámara. Depende de los globals definidos en
// alleleviewer.js (viewer, datos, globalData, ...), por lo que este script
// debe cargarse después.

var importStateFileInput = document.getElementById("importStateFile");

const VIEWER_STATE_SCHEMA_VERSION = 1;

// Espera activa hasta que predicateFn devuelve true o se agota el timeout.
function waitForCondition(predicateFn, timeoutMs = 8000, intervalMs = 120) {
  return new Promise(function (resolve, reject) {
    var startedAt = Date.now();
    var timer = setInterval(function () {
      var isReady = false;
      try {
        isReady = Boolean(predicateFn());
      } catch (error) {
        isReady = false;
      }

      if (isReady) {
        clearInterval(timer);
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        clearInterval(timer);
        reject(new Error("Timeout waiting for condition"));
      }
    }, intervalMs);
  });
}

// Marca un checkbox y dispara su handler "change" para replicar la interacción del usuario.
function setCheckboxState(id, checked) {
  var checkbox = document.getElementById(id);
  if (!checkbox) {
    return;
  }
  checkbox.checked = Boolean(checked);
  checkbox.dispatchEvent(new Event("change", { bubbles: true }));
}

// Valida que el arreglo de vista guardado tenga la forma [px, py, pz, zoom, qx, qy, qz, qw].
function isValidViewerViewArray(viewArray) {
  if (!Array.isArray(viewArray) || viewArray.length < 8) {
    return false;
  }
  return viewArray.every(function (value) {
    return typeof value === "number" && Number.isFinite(value);
  });
}

// Construye la instantánea completa del estado actual del visor.
function buildViewerStateSnapshot() {
  var selectGene = document.getElementById("selectGene");
  var selectfile = document.getElementById("selectfile");
  var zoomSlider = document.getElementById("customRange1");

  return {
    schemaVersion: VIEWER_STATE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    selection: {
      selectedGenId: selectGene ? selectGene.value || null : null,
      selectedStudyId:
        localStorage.getItem("selectedStudyId") ||
        (selectfile ? selectfile.value || null : null),
      uploadFileId: localStorage.getItem("uploadFileId") || null,
      selectedStudyTypeDisplay:
        localStorage.getItem("selectedStudyTypeDisplay") || null,
      selectedPdbId: localStorage.getItem("selectedPdbId") || null,
    },
    camera: {
      view: typeof viewer.getView === "function" ? viewer.getView() : null,
      spinState: spinState,
      zoomLevel: Number(zoomLevel),
    },
    controls: {
      sphereHidden: Boolean(document.getElementById("sphere_hidden")?.checked),
      stickHidden: Boolean(document.getElementById("stick_hidden")?.checked),
      showAxes: Boolean(document.getElementById("show_axes")?.checked),
      showPlane: Boolean(document.getElementById("show_plane")?.checked),
      multiGraph: Boolean(document.getElementById("multi_graph")?.checked),
      showHeatmap: Boolean(document.getElementById("show_heatmap")?.checked),
      heatmapSigma: Number(heatmapsigma),
      heatmapResolution: Number(heatmapRes),
      sphereRadiusSlider: zoomSlider
        ? Number(zoomSlider.value)
        : Number(zoomLevel),
    },
    filters: {
      region: currentRegionFilter,
      search: currentSearchTerm,
      familyActiveTab: familyActiveTab,
    },
    overlays: {
      familiesEnabled:
        Array.isArray(currentFamilyData) && currentFamilyData.length > 0,
      familyVisibility: familyVisibility,
      familyActiveHighlight: familyActiveHighlight,
      orderVisibility: orderVisibility,
      orderActiveHighlight: orderActiveHighlight,
      heatmapEnabled: heatmapEnabled,
    },
  };
}

// Descarga el estado actual del visor como archivo JSON.
function exportViewerState() {
  try {
    var state = buildViewerStateSnapshot();
    var payload = JSON.stringify(state, null, 2);
    var blob = new Blob([payload], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    var studySuffix = state.selection.selectedStudyId
      ? "study-" + state.selection.selectedStudyId
      : "state";

    anchor.href = url;
    anchor.download =
      "allele-viewer-" + studySuffix + "-" + Date.now() + ".json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Revocar de forma diferida: revocarlo síncrono puede cancelar la descarga en algunos navegadores.
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    Swal.fire({
      icon: "success",
      title: "State exported",
      text: "The viewer state JSON was downloaded.",
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error exporting viewer state:", error);
    Swal.fire({
      icon: "error",
      title: "Export failed",
      text: "Could not export viewer state.",
      showConfirmButton: true,
    });
  }
}

// Abre el selector de archivos para importar un estado previamente exportado.
function importViewerState() {
  if (!importStateFileInput) {
    Swal.fire({
      icon: "error",
      title: "Import unavailable",
      text: "State import input was not found.",
      showConfirmButton: true,
    });
    return;
  }
  importStateFileInput.value = "";
  importStateFileInput.click();
}

// Garantiza que el listado de genes esté cargado antes de restaurar (arranque en frío).
function ensureGenesLoaded() {
  var selectGeneEl = document.getElementById("selectGene");
  var alreadyLoaded =
    selectGeneEl && selectGeneEl.options && selectGeneEl.options.length > 0;
  if (alreadyLoaded) {
    return Promise.resolve();
  }

  try {
    cargarGenes();
  } catch (error) {
    // No fatal: si los datos nunca llegan, waitForCondition fallará con mensaje claro.
  }

  return waitForCondition(function () {
    var sg = document.getElementById("selectGene");
    return Boolean(sg && sg.options && sg.options.length > 0);
  });
}

// Selecciona el gen del estado importado y espera a que su estudio esté disponible.
function waitForGeneStudies(geneId, studyId) {
  localStorage.setItem("selectedGenId", String(geneId));
  var selectGene = document.getElementById("selectGene");
  if (selectGene) {
    selectGene.value = String(geneId);
  }
  poblarArchivosPorGen(String(geneId));

  return waitForCondition(function () {
    var sf = document.getElementById("selectfile");
    var hasDesired =
      sf &&
      Array.from(sf.options || []).some(function (opt) {
        return String(opt.value) === String(studyId);
      });
    var hasGlobalStudy =
      Array.isArray(globalData) &&
      globalData.some(function (study) {
        return String(study.id) === String(studyId);
      });
    return Boolean(hasDesired && hasGlobalStudy);
  });
}

// Restaura los sliders de sigma/resolución del heatmap antes de dibujarlo.
function restoreHeatmapControls(controls) {
  if (typeof controls.heatmapSigma === "number") {
    heatmapsigma = controls.heatmapSigma;
    var sigmaSlider = document.getElementById("heatmapSigma");
    if (sigmaSlider) {
      sigmaSlider.value = String(controls.heatmapSigma);
      document.getElementById("heatmapSigmaVal").textContent = String(
        controls.heatmapSigma
      );
    }
  }

  if (typeof controls.heatmapResolution === "number") {
    heatmapRes = controls.heatmapResolution;
    var resSlider = document.getElementById("heatmapResolution");
    if (resSlider) {
      resSlider.value = String(controls.heatmapResolution);
      document.getElementById("heatmapResVal").textContent = String(
        controls.heatmapResolution
      );
    }
  }
}

// Aplica la cámara guardada tras validarla.
// IMPORTANTE: primero zoomTo() y luego setView(). En esta versión de 3Dmol solo
// zoomTo() recalcula los planos de recorte (slabNear/slabFar) según la geometría;
// durante la restauración child() omite zoomTo (flag isRestoringViewerState) y, si se
// llamara solo a setView, la escena se recortaría con los planos por defecto del
// constructor (slab ±50) mostrando una vista corrupta. El zoomTo inicial fija los
// planos y setView sobreescribe después posición/rotación/zoom con el valor guardado.
function applySavedCamera(camera) {
  if (camera && isValidViewerViewArray(camera.view)) {
    viewer.zoomTo();
    viewer.setView(camera.view.slice());
  } else {
    // Fallback seguro cuando la cámara persistida es inválida o no existe.
    viewer.zoomTo();
    viewer.zoom(5, 0);
  }
}

// Restaura por completo el visor a partir de un estado exportado.
async function restoreViewerState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Invalid state payload");
  }
  if (!state.selection || !state.selection.selectedStudyId) {
    throw new Error("State is missing selectedStudyId");
  }

  var selection = state.selection;
  var controls = state.controls || {};
  var filters = state.filters || {};
  var overlays = state.overlays || {};

  isRestoringViewerState = true;
  try {
    // 1. Genes disponibles (evita el arranque en frío sin opciones).
    try {
      await ensureGenesLoaded();
    } catch (error) {
      throw new Error("Could not load the gene list");
    }

    // 2. Gen del estado + sus estudios cargados en el select.
    if (selection.selectedGenId != null && selection.selectedGenId !== "") {
      try {
        await waitForGeneStudies(
          selection.selectedGenId,
          selection.selectedStudyId
        );
      } catch (error) {
        throw new Error("Could not load the studies of the imported gene");
      }
    }

    // 3. El estudio debe existir realmente en el servidor.
    var selectfile = document.getElementById("selectfile");
    if (!selectfile) {
      throw new Error("Study selector was not found");
    }

    var desiredStudyId = String(selection.selectedStudyId);
    var hasStudyOption = Array.from(selectfile.options || []).some(function (
      opt
    ) {
      return String(opt.value) === desiredStudyId;
    });
    if (!hasStudyOption) {
      throw new Error("The study in the imported state is not available");
    }

    // 4. Carga del grafo (PDB) del estudio.
    selectfile.value = desiredStudyId;
    actualizarSelectPdbPorStudyId(desiredStudyId);
    selectUrl();

    try {
      await waitForCondition(function () {
        return Array.isArray(datos) && datos.length > 0;
      });
    } catch (error) {
      throw new Error("The study graph could not be loaded for this state");
    }

    // 5. Parámetros y controles (antes del heatmap para que lo use al dibujarse).
    restoreHeatmapControls(controls);

    setCheckboxState("sphere_hidden", controls.sphereHidden);
    setCheckboxState("stick_hidden", controls.stickHidden);
    setCheckboxState("show_axes", controls.showAxes);
    setCheckboxState("show_plane", controls.showPlane);
    setCheckboxState("multi_graph", controls.multiGraph);

    if (typeof controls.sphereRadiusSlider === "number") {
      var zoomSlider = document.getElementById("customRange1");
      if (zoomSlider) {
        zoomSlider.value = String(controls.sphereRadiusSlider);
        zoomSlider.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // 6. Filtros guardados.
    if (typeof filters.search === "string") {
      var searchInput = document.getElementById("buscar");
      if (searchInput) {
        searchInput.value = filters.search;
      }
      if (filters.search.trim() !== "") {
        var searchResult = await buscar(filters.search);
        currentSearchTerm =
          searchResult && searchResult.applied ? filters.search : "";
      }
    }

    if (typeof filters.region === "string" && filters.region.trim() !== "") {
      if (!applyRegionFilter(filters.region, true)) {
        currentRegionFilter = null;
      }
    }

    // 7. Overlays: heatmap y familias/órdenes.
    setCheckboxState("show_heatmap", controls.showHeatmap || overlays.heatmapEnabled);

    if (overlays.familiesEnabled) {
      showFamilies();
      if (overlays.familyVisibility && typeof overlays.familyVisibility === "object") {
        familyVisibility = Object.assign({}, overlays.familyVisibility);
        applyFamilyVisibility();
      }
      if (overlays.familyActiveHighlight) {
        highlightFamily(overlays.familyActiveHighlight);
      }
      if (overlays.orderVisibility && typeof overlays.orderVisibility === "object") {
        orderVisibility = Object.assign({}, overlays.orderVisibility);
        applyOrderVisibility();
      }
      if (overlays.orderActiveHighlight) {
        highlightOrder(overlays.orderActiveHighlight);
      }
      if (filters.familyActiveTab === "order" || filters.familyActiveTab === "families") {
        switchFamilyTab(filters.familyActiveTab);
      }
    }

    // 8. La cámara se aplica AL FINAL: ninguna otra sección debe reencuadrar la escena después.
    applySavedCamera(state.camera);

    viewer.render();
  } finally {
    isRestoringViewerState = false;
  }
}

// Lee el archivo JSON seleccionado y lanza la restauración del estado.
function handleViewerStateFileImport(event) {
  var file = event?.target?.files?.[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();

  reader.onload = async function (loadEvent) {
    load.hidden = false;
    try {
      var parsed = JSON.parse(loadEvent.target.result);

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid file: expected a JSON object");
      }
      if (!parsed.schemaVersion) {
        throw new Error("Invalid file: missing schemaVersion");
      }
      if (parsed.schemaVersion > VIEWER_STATE_SCHEMA_VERSION) {
        throw new Error("The state file uses a newer schema version");
      }

      await restoreViewerState(parsed);

      Swal.fire({
        icon: "success",
        title: "State restored",
        text: "Viewer state was restored successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error importing viewer state:", error);
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: error.message || "Could not restore viewer state.",
        showConfirmButton: true,
      });
    } finally {
      isRestoringViewerState = false;
      load.hidden = true;
    }
  };

  reader.onerror = function () {
    Swal.fire({
      icon: "error",
      title: "Import failed",
      text: "The state file could not be read.",
      showConfirmButton: true,
    });
  };

  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", function () {
  if (importStateFileInput) {
    importStateFileInput.addEventListener("change", handleViewerStateFileImport);
  }
});
