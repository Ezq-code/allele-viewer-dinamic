# Organigrama de Formación de Alelos CYP2D6

## Descripción

Este es un ejemplo completo y funcional de un organigrama genético que muestra la formación y variantes del gen **CYP2D6** usando el plugin **jQuery OrgChart**. El ejemplo incluye funcionalidades avanzadas para visualizar la jerarquía de alelos, variantes funcionales y no funcionales, y la formación del genotipo final.

## Características Principales

### 🎯 **Funcionalidades del Organigrama**
- **Visualización jerárquica** de la formación de alelos CYP2D6
- **Nodos interactivos** representando variantes alélicas
- **Expansión/colapso** de secciones del organigrama genético
- **Selección de nodos** con resaltado visual
- **Edición en tiempo real** de información de alelos
- **Eliminación de nodos** con confirmación
- **Búsqueda de alelos** por nombre o descripción
- **Clasificación por funcionalidad** (funcional, no funcional, actividad reducida)

### 🎨 **Interfaz de Usuario**
- **Diseño responsivo** usando Bootstrap 5
- **Iconos Font Awesome** para mejor experiencia visual
- **Estilos personalizados** con gradientes y sombras
- **Panel de controles** integrado
- **Notificaciones en tiempo real**
- **Estadísticas del organigrama**

### 🔧 **Funcionalidades Técnicas**
- **Gestión de eventos** con jQuery
- **Modales Bootstrap** para edición
- **Validación de formularios**
- **Persistencia de datos** (en memoria)
- **API extensible** para futuras funcionalidades

## Estructura de Archivos

```
static/
├── assets/
│   ├── plugins/
│   │   └── orgchart/          # Plugin jQuery OrgChart
│   │       ├── jquery.orgchart.css
│   │       └── jquery.orgchart.js
│   └── dist/
│       └── js/
│           └── ancestral.js   # Lógica principal del organigrama
├── orgchart-example.html      # Página de ejemplo completa
└── README-OrgChart.md         # Este archivo
```

## Instalación y Configuración

### 1. **Requisitos Previos**
- Servidor web (Apache, Nginx, o servidor de desarrollo)
- Navegador web moderno con soporte para ES6
- Conexión a internet para CDNs (Bootstrap, Font Awesome)

### 2. **Configuración del Plugin**
El plugin OrgChart ya está incluido en `assets/plugins/orgchart/`. Si necesitas actualizarlo:

```bash
# Descargar la última versión del plugin
wget https://github.com/dabeng/OrgChart/archive/refs/heads/master.zip
# O usar npm
npm install jquery-orgchart
```

### 3. **Estructura de Datos**
El organigrama utiliza una estructura JSON específica para representar la formación de alelos CYP2D6:

```javascript
var datascource = {
  'id': 'cyp2d6_root',        // ID único del nodo raíz
  'collapsed': false,         // Estado colapsado
  'className': 'top-level',   // Clase CSS personalizada
  'nodeTitlePro': 'CYP2D6*1 (Alelo Salvaje)', // Nombre del alelo
  'nodeContentPro': 'Alelo de referencia estándar', // Descripción funcional
  'relationship': '011',      // Relaciones (padre/hermanos/hijos)
  'children': [               // Variantes alélicas derivadas
    // ... más alelos
  ]
};
```

### 4. **Tipos de Alelos CYP2D6**
El organigrama incluye diferentes categorías de alelos:

- **Alelo Salvaje (CYP2D6*1)**: Referencia estándar con actividad normal
- **Variantes Funcionales**: CYP2D6*2, CYP2D6*2A, CYP2D6*2B
- **Variantes No Funcionales**: CYP2D6*3, CYP2D6*4, CYP2D6*5, CYP2D6*6, CYP2D6*7, CYP2D6*8
- **Variantes con Actividad Reducida**: CYP2D6*9, CYP2D6*10, CYP2D6*17, CYP2D6*29, CYP2D6*41
- **Duplicaciones**: Múltiples copias del gen (CYP2D6*2xN, CYP2D6*4xN, CYP2D6*10xN)
- **Multiplicaciones**: Triplicación, cuadruplicación, quintuplicación del gen
- **Genotipo Final**: Combinación resultante de variantes alélicas

## Uso del Organigrama

### **Inicialización Básica**

```javascript
$(document).ready(function () {
  // Inicializar el organigrama
  initOrgChart();
  
  // Configurar eventos
  setupEventHandlers();
});
```

## Información sobre CYP2D6

### **¿Qué es CYP2D6?**
CYP2D6 es un gen que codifica la enzima citocromo P450 2D6, responsable del metabolismo de aproximadamente el 25% de todos los fármacos recetados, incluyendo:

- **Antidepresivos**: Fluoxetina, Paroxetina, Amitriptilina
- **Antipsicóticos**: Risperidona, Haloperidol, Tioridazina
- **Analgésicos opioides**: Codeína, Tramadol, Oxycodona
- **Betabloqueantes**: Metoprolol, Propranolol, Carvedilol
- **Tamoxifeno**: Fármaco para el cáncer de mama

### **Importancia Clínica**
- **Metabolizadores Ultrarrápidos**: Múltiples copias del gen → metabolismo muy rápido
- **Metabolizadores Extensivos**: 1-2 copias normales → metabolismo normal
- **Metabolizadores Intermedios**: Actividad reducida → metabolismo lento
- **Metabolizadores Pobres**: Sin actividad → sin metabolismo

### **Aplicaciones del Organigrama**
1. **Investigación Genética**: Visualizar la formación de variantes alélicas
2. **Educación Médica**: Enseñar farmacogenómica y variabilidad genética
3. **Análisis Clínico**: Interpretar resultados de genotipado
4. **Desarrollo de Fármacos**: Considerar variabilidad genética en el diseño

### **Personalización de Nodos**

```javascript
'createNode': function($node, data) {
  // Agregar clases CSS personalizadas
  $node.addClass('custom-node');
  
  // Agregar botones de acción
  if (data.children && data.children.length > 0) {
    var $expandBtn = $('<button class="btn btn-sm btn-outline-primary expand-btn">...</button>');
    $node.find('.title').append($expandBtn);
  }
}
```

### **Gestión de Eventos**

```javascript
// Evento para expandir/colapsar
$(document).on('click', '.expand-btn', function(e) {
  e.preventDefault();
  e.stopPropagation();
  
  var $node = $(this).closest('.node');
  var $children = $node.siblings('.nodes').children();
  
  if ($children.is(':visible')) {
    $children.hide();
  } else {
    $children.show();
  }
});
```

## Funcionalidades Avanzadas

### **1. Búsqueda de Nodos**
```javascript
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
}
```

### **2. Edición de Nodos**
```javascript
function showEditModal($node, nodeId) {
  var currentTitle = $node.find('.title').text().trim();
  var currentContent = $node.find('.content').text().trim();
  
  // Crear modal con formulario
  var modalHtml = `...`;
  
  // Mostrar modal y manejar guardado
  $('#saveChanges').on('click', function() {
    var newTitle = $('#nodeTitle').val();
    var newContent = $('#nodeContent').val();
    
    if (newTitle && newContent) {
      $node.find('.title').text(newTitle);
      $node.find('.content').text(newContent);
      showNotification('Nodo actualizado correctamente', 'success');
    }
  });
}
```

### **3. Agregar Nuevos Nodos**
```javascript
function addNewNode(parentId, title, content) {
  var newNode = {
    'id': 'nodo_' + Date.now(),
    'nodeTitlePro': title,
    'nodeContentPro': content,
    'relationship': '100'
  };
  
  // Implementar lógica para agregar al organigrama
  // Esto dependerá de la API específica del plugin
}
```

## Personalización de Estilos

### **CSS Personalizado**
```css
.orgchart .node {
  border: 2px solid #4CAF50;
  border-radius: 8px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 10px;
  margin: 5px;
  min-width: 150px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.orgchart .node:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.orgchart .node.selected {
  border-color: #ff9800;
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
}
```

### **Clases CSS Disponibles**
- `.orgchart`: Contenedor principal
- `.node`: Nodos individuales
- `.title`: Título del nodo
- `.content`: Contenido del nodo
- `.lines`: Líneas de conexión
- `.nodes`: Contenedor de nodos hijos

## API y Métodos

### **Métodos Principales**
- `initOrgChart()`: Inicializa el organigrama de alelos CYP2D6
- `setupEventHandlers()`: Configura los eventos para interacción con alelos
- `showEditModal($node, nodeId)`: Muestra modal de edición de información del alelo
- `showNodeInfo($node)`: Muestra información detallada del alelo seleccionado
- `showNotification(message, type)`: Muestra notificaciones sobre operaciones
- `searchNodes(query)`: Busca alelos por nombre o descripción
- `addNewNode(parentId, title, content)`: Agrega nuevo alelo al organigrama

### **Eventos Disponibles**
- `click` en `.node`: Selecciona el alelo
- `click` en `.expand-btn`: Expande/colapsa variantes alélicas
- `click` en `.edit-btn`: Abre modal de edición del alelo
- `click` en `.delete-btn`: Elimina el alelo del organigrama

## Solución de Problemas

### **Problemas Comunes**

1. **El organigrama no se muestra**
   - Verifica que jQuery esté cargado antes que el plugin
   - Asegúrate de que el elemento `#orgChart` exista en el DOM
   - Revisa la consola del navegador para errores JavaScript

2. **Los estilos no se aplican**
   - Verifica que el archivo CSS del plugin esté incluido
   - Asegúrate de que los estilos personalizados se carguen después
   - Revisa que las rutas de los archivos CSS sean correctas

3. **Los eventos no funcionan**
   - Verifica que `setupEventHandlers()` se llame después de `initOrgChart()`
   - Asegúrate de que los selectores CSS coincidan con la estructura del DOM
   - Revisa que no haya conflictos con otros scripts

### **Debugging**
```javascript
// Habilitar logging para debugging
console.log('Datos del organigrama:', datascource);
console.log('Alelos encontrados:', $('.node').length);
console.log('Eventos configurados:', $._data(document, 'events'));
```

## Extensibilidad

### **Agregar Nuevas Funcionalidades**

1. **Exportación a PDF/Imagen**
```javascript
function exportOrgChart() {
  // Implementar usando html2canvas o jsPDF
  html2canvas($('#orgChart')[0]).then(function(canvas) {
    var link = document.createElement('a');
    link.download = 'cyp2d6_organigrama.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
```

2. **Análisis de Frecuencia Alélica**
```javascript
function analyzeAlleleFrequency() {
  var alleleCounts = {};
  $('.node').each(function() {
    var alleleName = $(this).find('.title').text().trim();
    alleleCounts[alleleName] = (alleleCounts[alleleName] || 0) + 1;
  });
  return alleleCounts;
}
```

3. **Predicción de Fenotipo**
```javascript
function predictPhenotype(alleles) {
  // Implementar lógica para predecir fenotipo basado en alelos
  // Metabolizador Ultrarrápido, Extensivo, Intermedio o Pobre
}
```

## Compatibilidad

### **Navegadores Soportados**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### **Dependencias**
- jQuery 3.6.0+
- Bootstrap 5.1.3+
- Font Awesome 6.0.0+

## Licencia y Créditos

- **jQuery OrgChart**: [GitHub](https://github.com/dabeng/OrgChart)
- **Bootstrap**: [getbootstrap.com](https://getbootstrap.com/)
- **Font Awesome**: [fontawesome.com](https://fontawesome.com/)

## Soporte y Contribuciones

Para reportar bugs o solicitar nuevas funcionalidades:
1. Revisa la documentación del plugin OrgChart
2. Verifica que el problema no esté en tu implementación
3. Proporciona un ejemplo mínimo reproducible
4. Incluye información del navegador y versión del plugin

---

**Nota**: Este organigrama está diseñado para fines educativos y de investigación en farmacogenómica. Para uso clínico, considera implementar validaciones adicionales, manejo de errores robusto y persistencia de datos apropiada según las regulaciones médicas aplicables.