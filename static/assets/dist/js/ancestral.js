// variable para gestionar los elementos seleccionados
let selected_id;
const csrfToken = document.cookie
  .split(";")
  .find((c) => c.trim().startsWith("csrftoken="))
  ?.split("=")[1];
const url = "/business-gestion/gene/";
var load = document.getElementById("load");

// Datos de ejemplo para el organigrama de formación de alelo CYP2D6
var datascource = {
  'id': 'cyp2d6_root',
  'collapsed': false,
  'className': 'top-level',
  'nodeTitlePro': 'CYP2D6*1 (Alelo Salvaje)',
  'nodeContentPro': 'Alelo de referencia estándar',
  'relationship': '011',
  'children': [
    { 
      'id': 'cyp2d6_2',
      'nodeTitlePro': 'CYP2D6*2', 
      'nodeContentPro': 'Variante funcional con actividad normal', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_2a',
          'nodeTitlePro': 'CYP2D6*2A', 
          'nodeContentPro': 'Sustitución C2938T en exon 1', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_2b',
          'nodeTitlePro': 'CYP2D6*2B', 
          'nodeContentPro': 'Sustitución G4268C en exon 9', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_3',
      'nodeTitlePro': 'CYP2D6*3', 
      'nodeContentPro': 'Variante no funcional (deletión A2549)', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_3a',
          'nodeTitlePro': 'CYP2D6*3A', 
          'nodeContentPro': 'Deletión A2549 en exon 5', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_3b',
          'nodeTitlePro': 'CYP2D6*3B', 
          'nodeContentPro': 'Deletión A2549 + C2938T', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_4',
      'nodeTitlePro': 'CYP2D6*4', 
      'nodeContentPro': 'Variante no funcional (G1846A)', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_4a',
          'nodeTitlePro': 'CYP2D6*4A', 
          'nodeContentPro': 'Sustitución G1846A en exon 4', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_4b',
          'nodeTitlePro': 'CYP2D6*4B', 
          'nodeContentPro': 'G1846A + C2938T + G4268C', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_5',
      'nodeTitlePro': 'CYP2D6*5', 
      'nodeContentPro': 'Deletión completa del gen', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_6',
      'nodeTitlePro': 'CYP2D6*6', 
      'nodeContentPro': 'Variante no funcional (T1707del)', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_6a',
          'nodeTitlePro': 'CYP2D6*6A', 
          'nodeContentPro': 'Deletión T1707 en exon 3', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_6b',
          'nodeTitlePro': 'CYP2D6*6B', 
          'nodeContentPro': 'T1707del + G1846A', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_7',
      'nodeTitlePro': 'CYP2D6*7', 
      'nodeContentPro': 'Variante no funcional (A2935C)', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_8',
      'nodeTitlePro': 'CYP2D6*8', 
      'nodeContentPro': 'Variante no funcional (G1758A)', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_9',
      'nodeTitlePro': 'CYP2D6*9', 
      'nodeContentPro': 'Variante con actividad reducida', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_9a',
          'nodeTitlePro': 'CYP2D6*9A', 
          'nodeContentPro': 'Sustitución G2613A en exon 6', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_9b',
          'nodeTitlePro': 'CYP2D6*9B', 
          'nodeContentPro': 'G2613A + C2938T', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_10',
      'nodeTitlePro': 'CYP2D6*10', 
      'nodeContentPro': 'Variante con actividad reducida (C100T)', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_10a',
          'nodeTitlePro': 'CYP2D6*10A', 
          'nodeContentPro': 'Sustitución C100T en exon 1', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_10b',
          'nodeTitlePro': 'CYP2D6*10B', 
          'nodeContentPro': 'C100T + G1846A', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_17',
      'nodeTitlePro': 'CYP2D6*17', 
      'nodeContentPro': 'Variante con actividad reducida (T1023C)', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_29',
      'nodeTitlePro': 'CYP2D6*29', 
      'nodeContentPro': 'Variante con actividad reducida', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_41',
      'nodeTitlePro': 'CYP2D6*41', 
      'nodeContentPro': 'Variante con actividad reducida (G2988A)', 
      'relationship': '110'
    },
    { 
      'id': 'cyp2d6_duplication',
      'nodeTitlePro': 'CYP2D6 Duplicación', 
      'nodeContentPro': 'Duplicación del gen completo', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_dup_2x',
          'nodeTitlePro': 'CYP2D6*2xN', 
          'nodeContentPro': 'Duplicación de CYP2D6*2', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_dup_4x',
          'nodeTitlePro': 'CYP2D6*4xN', 
          'nodeContentPro': 'Duplicación de CYP2D6*4', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_dup_10x',
          'nodeTitlePro': 'CYP2D6*10xN', 
          'nodeContentPro': 'Duplicación de CYP2D6*10', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_multidup',
      'nodeTitlePro': 'CYP2D6 Multiplicación', 
      'nodeContentPro': 'Múltiples copias del gen', 
      'relationship': '111',
      'children': [
        { 
          'id': 'cyp2d6_3x',
          'nodeTitlePro': 'CYP2D6*3xN', 
          'nodeContentPro': 'Triplicación del gen', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_4x',
          'nodeTitlePro': 'CYP2D6*4xN', 
          'nodeContentPro': 'Cuadruplicación del gen', 
          'relationship': '110' 
        },
        { 
          'id': 'cyp2d6_5x',
          'nodeTitlePro': 'CYP2D6*5xN', 
          'nodeContentPro': 'Quintuplicación del gen', 
          'relationship': '110' 
        }
      ]
    },
    { 
      'id': 'cyp2d6_final',
      'nodeTitlePro': 'CYP2D6 (Genotipo Final)', 
      'nodeContentPro': 'Combinación de variantes alélicas', 
      'relationship': '100'
    }
  ]
};

$(document).ready(function () {
  // Inicializar el organigrama
  initOrgChart();
  
  // Configurar eventos
  setupEventHandlers();

 
let options = getOptions();
let chart = new OrgChart(document.getElementById('tree'), {
    enableSearch: false,
    template: 'olivia',        
    mode: 'dark',
    orientation: OrgChart.orientation.top_left,
    scaleInitial: options.scaleInitial,
    mouseScrool: OrgChart.none,
    clinks: [
        { from: 4, to: 0, label: 'text' },
        { from: 4, to: 5, template: 'blue', label: '4 reports to 3' },
        { from: 2, to: 6, template: 'yellow', label: 'lorem ipsum' },
    ]
});

chart.load([
    { id: 0 },
    { id: 1, pid: 0 },
    { id: 2, pid: 0 },
    { id: 3, pid: 1 },
    { id: 4, pid: 2 },
    { id: 5, pid: 1 },
    { id: 6, pid: 2 }
]);
  

});

function getOptions(){
  const searchParams = new URLSearchParams(window.location.search);
  let fit = searchParams.get('fit');
  let scaleInitial = 1;
  if (fit == 'yes'){
      scaleInitial = OrgChart.match.boundary;
  }
  return {scaleInitial};
}



// Función para inicializar el organigrama
function initOrgChart() {
  $('#orgChart').orgchart({
    'data': datascource,
    'nodeContent': 'nodeContentPro',
    'nodeTitle': 'nodeTitlePro',
    'direction':'t2b',    
    'createNode': function($node, data) {
      // Personalizar el nodo con estilos adicionales
      $node.addClass('custom-node');
      
      // Agregar botones de acción si el nodo tiene hijos
      if (data.children && data.children.length > 0) {
        var $expandBtn = $('<button class="btn btn-sm btn-outline-primary expand-btn" title="Expandir/Colapsar"><i class="fas fa-chevron-down"></i></button>');
        $node.find('.title').append($expandBtn);
      }
      
      // Agregar botón de edición
      // var $editBtn = $('<button class="btn btn-sm btn-outline-secondary edit-btn" title="Editar"><i class="fas fa-edit"></i></button>');
      // $node.find('.title').append($editBtn);
      
      // // Agregar botón de eliminar
      // var $deleteBtn = $('<button class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>');
      // $node.find('.title').append($deleteBtn);
    }
  });
}

// Función para configurar los manejadores de eventos
function setupEventHandlers() {
  // Evento para expandir/colapsar nodos
  $(document).on('click', '.expand-btn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $node = $(this).closest('.node');
    var $children = $node.siblings('.nodes').children();
    
    if ($children.is(':visible')) {
      $children.hide();
      $(this).find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
    } else {
      $children.show();
      $(this).find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
    }
  });
  
  // Evento para editar nodos
  $(document).on('click', '.edit-btn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $node = $(this).closest('.node');
    var nodeId = $node.attr('id') || 'nodo_' + Date.now();
    
    // Mostrar modal de edición
    showEditModal($node, nodeId);
  });
  
  // Evento para eliminar nodos
  $(document).on('click', '.delete-btn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $node = $(this).closest('.node');
    
    if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
      $node.remove();
      showNotification('Nodo eliminado correctamente', 'success');
    }
  });
  
  // Evento para seleccionar nodos
  $(document).on('click', '.node', function() {
    $('.node').removeClass('selected');
    $(this).addClass('selected');
    selected_id = $(this).attr('id');
    
    // Mostrar información del nodo seleccionado
    showNodeInfo($(this));
  });
}

// Función para mostrar modal de edición
function showEditModal($node, nodeId) {
  var currentTitle = $node.find('.title').text().trim();
  var currentContent = $node.find('.content').text().trim();
  
  var modalHtml = `
    <div class="modal fade" id="editModal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Nodo</h5>
            <button type="button" class="close" data-dismiss="modal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="editForm">
              <div class="form-group">
                <label for="nodeTitle">Título del Nodo:</label>
                <input type="text" class="form-control" id="nodeTitle" value="${currentTitle}" required>
              </div>
              <div class="form-group">
                <label for="nodeContent">Contenido del Nodo:</label>
                <textarea class="form-control" id="nodeContent" rows="3" required>${currentContent}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveChanges">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal anterior si existe
  $('#editModal').remove();
  
  // Agregar modal al DOM
  $('body').append(modalHtml);
  
  // Mostrar modal
  $('#editModal').modal('show');
  
  // Evento para guardar cambios
  $('#saveChanges').on('click', function() {
    var newTitle = $('#nodeTitle').val();
    var newContent = $('#nodeContent').val();
    
    if (newTitle && newContent) {
      $node.find('.title').text(newTitle);
      $node.find('.content').text(newContent);
      
      $('#editModal').modal('hide');
      showNotification('Nodo actualizado correctamente', 'success');
    } else {
      showNotification('Por favor completa todos los campos', 'error');
    }
  });
}

// Función para mostrar información del nodo
function showNodeInfo($node) {
  var nodeId = $node.attr('id') || 'Sin ID';
  var nodeTitle = $node.find('.title').text().trim();
  var nodeContent = $node.find('.content').text().trim();
  
  // Crear o actualizar panel de información
  var infoHtml = `
    <div class="card mt-3">
      <div class="card-header">
        <h6 class="mb-0">Información del Nodo Seleccionado</h6>
      </div>
      <div class="card-body">
        <p><strong>ID:</strong> ${nodeId}</p>
        <p><strong>Título:</strong> ${nodeTitle}</p>
        <p><strong>Contenido:</strong> ${nodeContent}</p>
        <p><strong>Posición:</strong> ${$node.position().top}, ${$node.position().left}</p>
      </div>
    </div>
  `;
  
  // Actualizar panel de información
  $('#nodeInfo').html(infoHtml);
}

// Función para mostrar notificaciones
function showNotification(message, type) {
  var alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
  var notificationHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="close" data-dismiss="alert">
        <span>&times;</span>
      </button>
    </div>
  `;
  
  // Mostrar notificación en la parte superior
  $('#notifications').html(notificationHtml);
  
  // Auto-ocultar después de 3 segundos
  setTimeout(function() {
    $('.alert').fadeOut();
  }, 3000);
}

// Función para agregar nuevo nodo
function addNewNode(parentId, title, content) {
  var newNode = {
    'id': 'nodo_' + Date.now(),
    'nodeTitlePro': title,
    'nodeContentPro': content,
    'relationship': '100'
  };
  
  // Encontrar nodo padre y agregar hijo
  var $parentNode = $('#' + parentId);
  if ($parentNode.length > 0) {
    // Aquí implementarías la lógica para agregar el nodo al organigrama
    // Esto dependería de la API del plugin OrgChart
    showNotification('Nodo agregado correctamente', 'success');
  } else {
    showNotification('Nodo padre no encontrado', 'error');
  }
}

// Función para exportar organigrama
function exportOrgChart() {
  // Implementar exportación a PDF o imagen
  showNotification('Funcionalidad de exportación en desarrollo', 'info');
}

// Función para buscar nodos
function searchNodes(query) {
  if (!query) {
    $('.node').show();
    return;
  }
  
  $('.node').each(function() {
    var $node = $(this);
    var title = $node.find('.title').text().toLowerCase();
    var content = $node.find('.content').text().toLowerCase();
    
    if (title.includes(query.toLowerCase()) || content.includes(query.toLowerCase())) {
      $node.show();
      $node.addClass('search-highlight');
    } else {
      $node.hide();
    }
  });
  
  showNotification(`Búsqueda completada para: "${query}"`, 'info');
}