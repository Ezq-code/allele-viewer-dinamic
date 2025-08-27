function showFormation(custom_element_name) {
  // // Mostrar la modal del timeline
  $("#timelineModal").modal("show");
  // // Actualizar el título de la modal con el nombre del elemento
  document.getElementById("timelineModalLabel").innerText =
    "Allele: " + custom_element_name;

  const modalBody = document.getElementById("timelineModalBody");
  modalBody.innerHTML = `<div class="form-group"><label for="formationTypeSelect">Formation type:</label>
      <select id="formationTypeSelect" class="form-control">
        <option value="ancester_formation">Ancestral Formation</option>
        <option value="location_formation">Location Formation</option>
      </select>
    </div>
    <blockquote>
    <p id="alleleRs" style="word-wrap: break-word;overflow: hidden;" ></p>
    <small>Structure <cite title="Source Title">Allele RS</cite></small>
    </blockquote>
    <hr>
    <ul id="timelineContent" class="timeline"></ul>
  `;
  let location_formation = document.getElementById("formationTypeSelect");
  // Llama al endpoint para obtener la información de formación
  axios
    .get("/allele-formation/allele-snp-info/", {
      params: { allele: custom_element_name },
    })
    .then((response) => {
      const data = response.data.results[0];
      let formationType = location_formation.value;

      let formationData = data[formationType] || [];

      // Renderiza inicialmente con Ancestral Formation
      renderDynamicTimeline(formationType, data);

      // Maneja el cambio de tipo de formación
      document
        .getElementById("formationTypeSelect")
        .addEventListener("change", function () {
          renderDynamicTimeline(this.value, data);
        });
    })
    .catch((error) => {
      const timelineContent = document.getElementById("timelineContent");
      if (timelineContent) {
        timelineContent.innerHTML = "<li>Error loading data.</li>";
      }
      Toast.fire({
        icon: "error",
        title:
          error.response?.data?.detail ||
          "No allele SNP formation data available",
      });
    });
}

// Function to render the timeline according to the selected type
function renderDynamicTimeline(type, data) {
  const timelineContent = document.getElementById("timelineContent");
  const alleleRs = document.getElementById("alleleRs");
  timelineContent.innerHTML = "";
  alleleRs.innerHTML = "";

  const items = data[type] || [];
  if (items.length === 0) {
    timelineContent.innerHTML = "<li>No data available.</li>";
    return;
  }

  let currentIndex = 0;

  let animationInterval = null;
  let isPlaying = false;

  function scrollToLastTimelineItem() {
    // Busca el último .timeline-item visible (antes de los controles)
    const timelineItems = timelineContent.querySelectorAll(".timeline-item");
    if (timelineItems.length > 0) {
      // El último elemento antes de los controles es el último dato mostrado
      // Si hay controles, el penúltimo es el último dato
      let targetIndex = timelineItems.length - 1;
      // Si el último tiene controles, retrocede uno
      if (timelineItems[targetIndex].querySelector("#playTimelineBtn")) {
        targetIndex--;
      }
      if (targetIndex >= 0) {
        timelineItems[targetIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }

  function renderItems(upToIndex) {
    timelineContent.innerHTML = "";
    for (let i = 0; i <= upToIndex; i++) {
      const item = items[i];
      const formationLines = item.formation.split(",").join(",<br>");
      timelineContent.innerHTML += `
                <li class="timeline-item">
                    <div class="timeline-badge" style="background:${item.color};-webkit-box-shadow: 0 1px 6px rgba(0, 0, 0, 0.175);"><i class="nav-icon fas fa-dna"></i></div>
                    <div class="timeline-panel">
                        <div class="timeline-heading">
                            <h4 class="timeline-title" style="word-break:break-word;white-space:normal;color:${item.color};">Order ${item.order}</h4>
                        </div>
                        <div class="timeline-body">
                            <p style="word-wrap:break-word;overflow:hidden;color:${item.color};">${formationLines}</p>
                        </div>
                    </div>
                </li>
            `;
    }
    // Update alleleRs with the last shown
    const lastItem = items[upToIndex];
    alleleRs.innerHTML = `<span style="color:${lastItem.color};">${lastItem.formation}</span>`;

    // Animation controls
    let controls = `
            <div class="d-flex justify-content-between mt-2">
                <div>
                    <button id="prevTimelineItemBtn" class="btn btn-secondary" ${
                      upToIndex === 0 ? "disabled" : ""
                    }>Previous</button>
                </div>
                <div>
                    <button id="playTimelineBtn" class="btn btn-success">${
                      isPlaying ? "Pause" : "Play"
                    }</button>
                </div>
                <div>
                    <button id="nextTimelineItemBtn" class="btn btn-primary" ${
                      upToIndex === items.length - 1 ? "disabled" : ""
                    }>Next</button>
                </div>
            </div>
        `;

    timelineContent.innerHTML += `
            <li class="timeline-item">
                ${controls}
            </li>
        `;

    // Final badge if at end
    if (upToIndex === items.length - 1) {
      timelineContent.innerHTML += `
                <li class="timeline-item">
                  <div class="timeline-badge">
                    <i class="nav-icon fas fa-dot-circle"></i>
                  </div>
                </li>
            `;
    }

    // Button handlers
    document.getElementById("prevTimelineItemBtn").onclick = function () {
      stopAnimation();
      renderItems(Math.max(0, upToIndex - 1));
    };
    document.getElementById("nextTimelineItemBtn").onclick = function () {
      stopAnimation();
      renderItems(Math.min(items.length - 1, upToIndex + 1));
    };
    document.getElementById("playTimelineBtn").onclick = function () {
      if (isPlaying) {
        stopAnimation();
      } else {
        startAnimation(upToIndex);
      }
    };

    // Scroll to the last shown timeline item
    scrollToLastTimelineItem();
  }

  function startAnimation(startIndex) {
    if (isPlaying) return;
    isPlaying = true;
    renderItems(startIndex);
    animationInterval = setInterval(() => {
      if (startIndex < items.length - 1) {
        startIndex++;
        renderItems(startIndex);
      } else {
        stopAnimation();
      }
    }, 1000); // 1 second interval
  }

  function stopAnimation() {
    isPlaying = false;
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    // Update controls to show "Play" again
    const playBtn = document.getElementById("playTimelineBtn");
    if (playBtn) playBtn.innerText = "Play";
  }

  renderItems(currentIndex);
}
