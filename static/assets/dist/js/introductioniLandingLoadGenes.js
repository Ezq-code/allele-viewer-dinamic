document.addEventListener("DOMContentLoaded", function () {
  // --- 1. DOM ELEMENT REFERENCES ---
  const container = document.getElementById("gene-buttons-container");
  const geneMatrix = document.getElementById("gene-matrix");
  const matrixTitle = document.getElementById("selected-group-name");
  const searchInput = document.getElementById("gene-search-input");
  const spinner = document.createElement("div");
  spinner.className = "spinner-border spinner-border-sm text-light";
  spinner.setAttribute("role", "status");
  spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
  
  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");

  // --- 2. STATE VARIABLES ---
  let currentPage = 1;
  const pageSize = 49;
  let activeGroupId = null;
  let searchQuery = '';

  // --- 3. MAIN LOADING FUNCTION ---
  function loadGroupGenes(groupId, groupName) {
    if (!groupId) return;
    
    activeGroupId = groupId;
    currentPage = 1;
    searchQuery = '';
    searchInput.value = '';

    matrixTitle.textContent = groupName;
    container.innerHTML = '';
    container.appendChild(spinner);
    spinner.style.display = "block";
    paginationControls.classList.add("d-none");

    if (geneMatrix.hasAttribute("hidden")) {
      geneMatrix.removeAttribute("hidden");
    }
    geneMatrix.scrollIntoView({ behavior: 'smooth' });

    fetchAndRenderGenes();
  }

  // --- 4. EVENT LISTENER FOR LOAD BUTTONS ---
  const loadButtons = document.querySelectorAll('.load-genes-btn');
  loadButtons.forEach(button => {
    button.addEventListener('click', function() {
      const groupId = this.dataset.groupId;
      const groupName = this.dataset.groupName;
      loadGroupGenes(groupId, groupName);
    });
  });

  // --- SEARCH INPUT EVENT LISTENER ---
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchQuery = this.value.trim();
      currentPage = 1;
      fetchAndRenderGenes();
    }
  });

  searchInput.addEventListener('search', function() {
      if (this.value === '') {
          searchQuery = '';
          currentPage = 1;
          fetchAndRenderGenes();
      }
  });

  // --- 5. FETCH AND RENDER FUNCTION ---
  function fetchAndRenderGenes() {
    if (!activeGroupId) return;
    let url = `/business-gestion/gene/?groups=${activeGroupId}&page=${currentPage}&page_size=${pageSize}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    axios.get(url)
      .then((response) => {
        spinner.style.display = "none";
        const data = response.data;
        if (data.results && data.results.length > 0) {
          renderGeneButtons(data.results);
          updatePaginationControls(data);
        } else {
          const noResultsMessage = searchQuery 
            ? `<p class="text-light">No genes found for "${searchQuery}".</p>`
            : '<p class="text-light">No genes found for this group.</p>';
          container.innerHTML = noResultsMessage;
          paginationControls.classList.add("d-none");
        }
      })
      .catch((error) => {
        console.error("Error loading genes:", error);
        spinner.style.display = "none";
        container.innerHTML = '<p class="text-danger">Error loading genes.</p>';
        paginationControls.classList.add("d-none");
      });
  }

  // --- 6. FUNCTION TO RENDER GENE BUTTONS ---
function renderGeneButtons(genes) {
    container.innerHTML = '';
    genes.forEach((gene) => {
        const button = document.createElement("button");
        button.className = "btn btn-outline-light gene-btn";
        button.textContent = gene.name;
        button.addEventListener("click", () => showGeneDetails(gene));
        container.appendChild(button);
    });
}

// --- 7. NEW FUNCTION TO SHOW DETAILS IN BOOTSTRAP MODAL ---
function showGeneDetails(gene) {
    const modalTitle = document.getElementById('genesModalLabel');
    const dashboardContainer = document.getElementById('gene-dashboard-container');
    dashboardContainer.innerHTML = '';
    modalTitle.textContent = `Details for ${gene.name}`;

    let dashboardHtml = `
            <div class="row mb-4">
                    <div class="col-md-12">
                            ${gene.description ? `<p>${gene.description}</p>` : ''}
                    </div>
            </div>`;

   

    // Status section
    dashboardHtml += `<div class="row">`;
    const statusList = gene.gene_status_list || [];
    if (statusList.length > 0) {
            statusList.forEach((status) => {
                    const percent = parseFloat(status.value);
                    let knobColor = "#6c757d";
                    if (!isNaN(percent)) {
                            if (percent >= 0 && percent <= 25) knobColor = "#dc3545";
                            else if (percent >= 26 && percent <= 50) knobColor = "#ffc107";
                            else if (percent >= 51 && percent <= 75) knobColor = "#17a2b8";
                            else if (percent > 75 && percent <= 100) knobColor = "#28a745";
                    }

                    dashboardHtml += `
                            <div class="col-md-6 col-lg-4 mb-4 text-center">
                                    <input type="text" class="knob mb-2" value="${status.value}" 
                                                 data-width="100" data-height="100" data-fgColor="${knobColor}" 
                                                 data-thickness=".2" data-readOnly="true" data-angleOffset="-125" data-angleArc="250">
                                    <h6 class="mb-1">${status.gene_status}</h6>
                                    ${status.evidence ? `
                                            <button class="btn btn-sm btn-outline-secondary" data-toggle="tooltip" data-placement="top" 
                                                            title="Download Evidence" 
                                                            onclick="downloadEvidence('${encodeURIComponent(status.evidence)}')">
                                                    <i class="bi bi-download"></i>
                                            </button>
                                    ` : ''}
                            </div>
                    `;
            });
    } else {
            dashboardHtml += `
                    <div class="col-12">
                            <p class="text-muted">No status information available for this gene.</p>
                    </div>
            `;
    }
     // Add disorders section if they exist
    if (gene.disorders && gene.disorders.length > 0) {
            dashboardHtml += `
            <div class="row mb-4">
                    <div class="col-12">
                            <div class="card card-primary">
                                    <div class="card-header">
                                            <h3 class="card-title">Associated Disorders</h3>
                                    </div>
                                    <div class="card-body">
                                            <div class="row">
                                                    ${gene.disorders.map((disorder, index) => {
                                                        // Array of Bootstrap background classes
                                                        const bgColors = ['bg-info', 'bg-success', 'bg-warning', 'bg-danger', 'bg-primary', 'bg-secondary'];
                                                        // Get color by index, cycling through the array
                                                        const bgColor = bgColors[index % bgColors.length];
                                                        
                                                        return `
                                                            <div class="col-md-4">
                                                                    <div class="info-box ${bgColor}">
                                                                            <span class="info-box-icon">
                                                                                    <i class="bi bi-clipboard2-pulse"></i>
                                                                            </span>
                                                                            <div class="info-box-content">
                                                                                    ${disorder ? 
                                                                                        `<span class="info-box-number">${disorder}</span>` : 
                                                                                        ''}
                                                                            </div>
                                                                    </div>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                            </div>
                                    </div>
                            </div>
                    </div>
            </div>`;
    }
    dashboardHtml += `</div>`;

    dashboardContainer.innerHTML = dashboardHtml;
    $('#genesModal').modal('show');

    $('#genesModal').on('shown.bs.modal', function () {
            $('.knob').knob();
            $('[data-toggle="tooltip"]').tooltip();
    });
}
  // --- 8. FUNCTION TO UPDATE PAGINATION ---
  function updatePaginationControls(data) {
    paginationControls.classList.remove("d-none");
    pageInfo.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = !data.previous;
    nextPageBtn.disabled = !data.next;
  }

  // --- 9. PAGINATION EVENT LISTENERS ---
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndRenderGenes();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchAndRenderGenes();
  });
});