// variable para gestionar los elementos seleccionados
let selected_id;

// Variable con el token
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];

// url para obtener genes
const geneUrl = "/business-gestion/gene/";

// Variables para la paginación
let currentPage = 1;
const genesPerPage = 16; // 4x4 matriz
let allGenes = [];
let totalPages = 1;

// Función para cargar genes desde la API
async function loadGenes() {
  try {
    // Mostrar indicador de carga
    const matrixContainer = document.getElementById('genes-matrix');
    matrixContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Cargando genes...</div>';
    
    const response = await axios.get(geneUrl, {
      params: {
        page_size: 1000, // Obtener todos los genes para la paginación
        page: 1
      }
    });
    
    allGenes = response.data.results;
    totalPages = Math.ceil(allGenes.length / genesPerPage);
    
    // Actualizar contador de genes
    document.getElementById('genes-count').textContent = `Total de genes: ${allGenes.length}`;
    
    if (allGenes.length === 0) {
      matrixContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No se encontraron genes</div>';
      updatePaginationControls();
      return;
    }
    
    // Renderizar la primera página
    renderGenesMatrix();
    updatePaginationControls();
  } catch (error) {
    console.error("Error cargando genes:", error);
    const matrixContainer = document.getElementById('genes-matrix');
    matrixContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: red;">
        <i class="fas fa-exclamation-triangle fa-2x"></i><br>
        Error cargando genes<br>
        <button onclick="loadGenes()" class="button special color2" style="margin-top: 15px;">
          Reintentar
        </button>
      </div>
    `;
  }
}

// Función para renderizar la matriz de genes
function renderGenesMatrix() {
  const matrixContainer = document.getElementById('genes-matrix');
  const startIndex = (currentPage - 1) * genesPerPage;
  const endIndex = startIndex + genesPerPage;
  const pageGenes = allGenes.slice(startIndex, endIndex);
  
  // Crear la matriz solo con los genes existentes
  let matrixHTML = '';
  
  // Si hay menos de 16 genes en esta página, solo mostrar los existentes
  const genesToShow = Math.min(pageGenes.length, 16);
  
  for (let i = 0; i < genesToShow; i++) {
    const gene = pageGenes[i];
    const buttonClass = gene.status === 'C' ? 'button special color2' : 'button color2';
    const statusText = gene.status === 'C' ? 'Completado' : 'Incompleto';
    const icon = gene.status === 'C' ? 'fa-check-circle' : 'fa-clock';
    
    matrixHTML += `
      <li>
        <a href="#" class="${buttonClass} icon ${icon}" 
           title="${gene.name} - ${statusText}"
           >
          ${gene.name}
           
        </a>
      </li>
    `;
  }
  
  matrixContainer.innerHTML = `<ul class="actions">${matrixHTML}</ul>`;
}

// Función para actualizar los controles de paginación
function updatePaginationControls() {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const pageNumbers = document.getElementById('page-numbers');
  
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  
  // Generar números de página
  let pageNumbersHTML = '';
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    pageNumbersHTML += `<button onclick="goToPage(1)" class="button" style="margin: 0 2px; padding: 5px 10px; font-size: 12px;">1</button>`;
    if (startPage > 2) {
      pageNumbersHTML += `<span style="margin: 0 5px; color: #666;">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const buttonClass = i === currentPage ? 'button special color2' : 'button';
    pageNumbersHTML += `<button onclick="goToPage(${i})" class="${buttonClass}" style="margin: 0 2px; padding: 5px 10px; font-size: 12px;">${i}</button>`;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbersHTML += `<span style="margin: 0 5px; color: #666;">...</span>`;
    }
    pageNumbersHTML += `<button onclick="goToPage(${totalPages})" class="button" style="margin: 0 2px; padding: 5px 10px; font-size: 12px;">${totalPages}</button>`;
  }
  
  pageNumbers.innerHTML = pageNumbersHTML;
}

// Función para ir a la página anterior
function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderGenesMatrix();
    updatePaginationControls();
  }
}

// Función para ir a la página siguiente
function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderGenesMatrix();
    updatePaginationControls();
  }
}

// Función para ir a una página específica
function goToPage(pageNumber) {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    renderGenesMatrix();
    updatePaginationControls();
  }
}

// Event listeners para la paginación
document.addEventListener('DOMContentLoaded', function() {
  // Cargar genes al inicializar la página
  loadGenes();
  
  // Agregar event listeners para los botones de paginación
  document.getElementById('prev-page').addEventListener('click', goToPreviousPage);
  document.getElementById('next-page').addEventListener('click', goToNextPage);
});

// Función para mostrar detalles del gen
function showGeneDetails(geneName, status, description) {
  // Crear un modal simple para mostrar los detalles del gen
  const modalHTML = `
    <div id="gene-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <h3 style="color: #333; margin-bottom: 20px;">${geneName}</h3>
        <p style="
          background: ${status === 'Completado' ? '#4CAF50' : '#FF9800'};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 20px;
        ">${status}</p>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">${description}</p>
        <button onclick="closeGeneModal()" style="
          background: #666;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        ">Cerrar</button>
      </div>
    </div>
  `;
  
  // Agregar el modal al body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para cerrar el modal del gen
function closeGeneModal() {
  const modal = document.getElementById('gene-modal');
  if (modal) {
    modal.remove();
  }
}

// Función para refrescar la matriz de genes
function refreshGenesMatrix() {
  loadGenes();
}

