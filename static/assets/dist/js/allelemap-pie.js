$(function () {

    $('.select2').select2({
      theme: 'bootstrap4'
    });

  });
    // Codigo ANTERIOR
  // $(function () {
  //   var $slider = $('#sampleSizeRange').bootstrapSlider({
  //     range: true,          // rango doble
  //     tooltip: 'hide',       // oculta tooltip nativo si no lo quieres
  //     min: 1,
  //     max: 4000000,
  //     step: 1,
  //     value: [parseInt(sessionStorage.getItem('minSampleSize'), 10), parseInt(sessionStorage.getItem('maxSampleSize'), 10)]  // rango inicial
  //   });
  //
  //
  //   var $label = $('#sampleSizeRangeLabel');
  //
  //   function format(n) {
  //     return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //   }
  //
  //   function updateLabel(values) {
  //     var min = values[0];
  //     var max = values[1];
  //     $label.text('(' + format(min) + ' - ' + format(max) + ')');
  //   }
  //
  //   // Valores iniciales
  //   updateLabel($slider.bootstrapSlider('getValue'));
  //
  //   // Cuando el usuario mueva el slider
  //   $slider.on('change', function (e) {
  //     // e.value.newValue es un array [min, max]
  //     updateLabel(e.value.newValue);
  //   });
  // });

// Codigo NUEVO
$(function () {
    const ACTUAL_MIN = 1;
    const ACTUAL_MAX = 4000000;
    const LOG_MIN = Math.log10(ACTUAL_MIN);
    const LOG_MAX = Math.log10(ACTUAL_MAX);
    const LOG_STEP = 0.0001;

    const savedMin = parseInt(sessionStorage.getItem('minSampleSize'), 10) || 10001;
    const savedMax = parseInt(sessionStorage.getItem('maxSampleSize'), 10) || 4000000;
    const INITIAL_MIN_LOG = Math.log10(Math.max(ACTUAL_MIN, savedMin));
    const INITIAL_MAX_LOG = Math.log10(Math.min(ACTUAL_MAX, savedMax));

    function formatNumber(n) {
        return Math.round(n).toLocaleString();
    }
    function logToReal(logVal) {
        return Math.round(Math.pow(10, logVal));
    }

    var $slider = $('#sampleSizeRange');
    if ($slider.data('slider')) {
        $slider.slider('destroy');
    }

    $slider.slider({
        min: LOG_MIN,
        max: LOG_MAX,
        step: LOG_STEP,
        value: [INITIAL_MIN_LOG, INITIAL_MAX_LOG],
        tooltip: 'hide',
        // NO ticks, NO ticks_labels
        formatter: function(logValue) {
            return formatNumber(logToReal(logValue));
        }
    });

    var $label = $('#sampleSizeRangeLabel');
    function updateLabel(logValues) {
        var realMin = logToReal(logValues[0]);
        var realMax = logToReal(logValues[1]);
        if (realMin > realMax) [realMin, realMax] = [realMax, realMin];
        $label.text('(' + formatNumber(realMin) + ' – ' + formatNumber(realMax) + ')');
    }

    updateLabel($slider.slider('getValue'));

    $slider.on('slide', function(ev) {
        updateLabel(ev.value);
    });

    $slider.on('slideStop', function(ev) {
        var realMin = logToReal(ev.value[0]);
        var realMax = logToReal(ev.value[1]);
        if (realMin > realMax) [realMin, realMax] = [realMax, realMin];
        realMin = Math.max(ACTUAL_MIN, realMin);
        realMax = Math.min(ACTUAL_MAX, realMax);
        sessionStorage.setItem('minSampleSize', realMin);
        sessionStorage.setItem('maxSampleSize', realMax);
        updateLabel([Math.log10(realMin), Math.log10(realMax)]);
    });

    window.getSampleRange = function() {
        var vals = $slider.slider('getValue');  // valores log
        return {
            min: logToReal(vals[0]),
            max: logToReal(vals[1])
        };
    };
});
// FIN DEL CODIGO NUEVO


    function buildPieSVGForModal(parts, size = 200) {
    const cx = size / 2;
    const cy = size / 2;
    const pieRadius = (size * 0.35);
    const total = parts.reduce((sum, p) => sum + p.value, 0);

    let paths = "";

    if (parts.length === 1) {
        // Dibuja un c�rculo completo si hay solo un alelo
        const singleSlice = parts[0];
        paths += `
            <circle cx="${cx}" cy="${cy}" r="${pieRadius}" fill="${singleSlice.color}" />
        `;
    } else {
        let startAngle = -Math.PI / 2;

        parts.forEach((slice) => {
            const sliceAngle = (slice.value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            const x1 = cx + pieRadius * Math.cos(startAngle);
            const y1 = cy + pieRadius * Math.sin(startAngle);
            const x2 = cx + pieRadius * Math.cos(endAngle);
            const y2 = cy + pieRadius * Math.sin(endAngle);
            const large = sliceAngle > Math.PI ? 1 : 0;
            const d = `M${cx},${cy} L${x1},${y1} A${pieRadius},${pieRadius} 0 ${large},1 ${x2},${y2} Z`;

            paths += `
                <path class="pie-slice"
                      data-label="${slice.label}"
                      d="${d}"
                      fill="${slice.color}"
                      stroke="rgba(255,255,255,0.9)"
                      stroke-width="1.5"
                      style="cursor: pointer;"></path>`;
            startAngle = endAngle;
        });
    }

    return `
        <svg class="pie-svg-modal" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${paths}
        </svg>`;
}

    jQuery(function($) {
    
    function obtenerColorPorResto(numero) {
    const colores = [
        "#FF0000", // 0
        "#00FF00", // 1
        "#0000FF", // 2
        "#FFFF00", // 3
        "#FF00FF", // 4
        "#00FFFF", // 5
        "#FFA500", // 6
        "#A020F0", // 7
        "#FF7F00", // 8
        "#228B22", // 9
        "#800080", // 10
        "#40E0D0", // 11
        "#DAA520", // 12
        "#4B0082", // 13
        "#FF6F61", // 14
        "#98FF98" // 15
    ];
    const resto = Math.abs(numero) % 16;
    return colores[resto];
}


function buildOffsets() {
  const offsets = [];
  const ds = [2, 3, 4]; // puedes ampliar si alg�n d�a necesitas m�s

  for (const d of ds) {
    offsets.push(
      [ d,  0],  // +d lat,  0 lon
      [-d,  0],  // -d lat,  0 lon
      [ 0,  d],  //  0 lat, +d lon
      [ 0, -d],  //  0 lat, -d lon
      [ d,  d],  // +d lat, +d lon
      [ d, -d],  // +d lat, -d lon
      [-d,  d],  // -d lat, +d lon
      [-d, -d],  // -d lat, -d lon
    );
  }

  return offsets;
}

const OFFSETS = buildOffsets();

// Convierte una coordenada en clave de Set/Map
function coordKey(lat, lon) {
  // Si quieres controlar el redondeo usa toFixed
  return `${lat},${lon}`;
}

 function adjustLatLngForNewElement(MapPoint, element) {
  if (!element.latLng || element.latLng.length !== 2) {
    throw new Error("element.latLng debe ser un array [lat, lon]");
  }

  let [baseLat, baseLon] = element.latLng;

  // Construimos el conjunto de coordenadas ya usadas
  const used = new Set(
    MapPoint
      .filter(p => Array.isArray(p.latLng) && p.latLng.length === 2)
      .map(p => coordKey(p.latLng[0], p.latLng[1]))
  );

  // Si no est� usada, no hay nada que hacer
  if (!used.has(coordKey(baseLat, baseLon))) {
    return element; // sin cambios
  }

  // Buscamos la primera combinaci�n libre siguiendo el patr�n
  let newLat = baseLat;
  let newLon = baseLon;
  let found = false;

  for (const [dLat, dLon] of OFFSETS) {
    const candLat = baseLat + dLat;
    const candLon = baseLon + dLon;
    const key = coordKey(candLat, candLon);

    if (!used.has(key)) {
      newLat = candLat;
      newLon = candLon;
      found = true;
      break;
    }
  }

  if (!found) {
    // Opcional: si quieres un fallback m�s all� de 3 grados:
    // por ejemplo seguir creciendo d = 4,5,6...
    // o lanzar un error porque dices que no habr� > 25 coincidencias.
    console.warn("No se encontró posición libre dentro de 3 grados para", baseLat, baseLon);
  }

  element.latLng = [newLat, newLon];
  return element;
}

      const LOADER_DURATION = 18000;

  Swal.fire({
  title: 'Updating Allele Map Data...',
  html: 'Please wait a few seconds...',
  allowOutsideClick: false,
  allowEscapeKey: false,
  didOpen: () => {
    Swal.showLoading();
  }
});

    var loadedData = false;
    var gene_name = sessionStorage.getItem('gene');
    var group_allele = JSON.parse(sessionStorage.getItem('group_allele'));
    var min_Sample_Size = sessionStorage.getItem('minSampleSize');
    var max_Sample_Size = sessionStorage.getItem('maxSampleSize');
    var country_name = sessionStorage.getItem('country'); 
    var kind_of_info =  sessionStorage.getItem('primarysecondary'); 
    var AllAlleles =  sessionStorage.getItem('AllAlleles');  

   var selectAllAlleles =  document.getElementById('AllAlleles');
   selectAllAlleles.value = AllAlleles;

    axios
    .get('/business-gestion/sub-countries/')
    .then(function (response) {
        //console.log('Respuesta completa:', response.data);
        //var data = response.data.results;
        //var data = response.results;

        var data = response.data.results;
        selectCountry = document.getElementById('country');

        var opt = document.createElement('option');
          opt.value = 'All Countries';
          opt.innerHTML = 'All Countries';
          selectCountry.appendChild(opt);

        data.forEach(function (country) {
          var opt = document.createElement('option');
          opt.value = country.name;
          opt.innerHTML = country.name;
          selectCountry.appendChild(opt);
        });
        var aCountry = document.getElementById("country");
        aCountry.value = sessionStorage.getItem('country'); 




        axios
        .get('/business-gestion/gene/with-alleles-to-map/')
        .then(function (response) {
     
            var data = response.data;
            selectGenes = document.getElementById('genes');
            data.forEach(function (gen) {
              var opt = document.createElement('option');
              opt.value = gen.name;
              opt.innerHTML = gen.name;
              selectGenes.appendChild(opt);
            });
            var aGene = document.getElementById("genes");
            aGene.value = sessionStorage.getItem('gene'); 


            LoadAlleleGroup();

            function LoadAlleleGroup() {


                axios
                .get('/business-gestion/gene/alleles-by-gene/?gene_name='+gene_name)
                .then(function (response) {
             
                    var data = response.data;
                    //selectGroupAllele = document.getElementById('allelic_group');
                    selectGroupAllele = document.getElementById('allele-list');
                    selectGroupAllele.innerHTML = ''; 
                    data.alleles.forEach(function (alele_group) {
                      var opt = document.createElement('option');
                      opt.value = alele_group;
                      opt.innerHTML = alele_group;
                      selectGroupAllele.appendChild(opt);
                    });
    
                    var aAllele_Group = document.getElementById("allele-list");
                    var storedValues = JSON.parse(sessionStorage.getItem("group_allele"));
                    $(aAllele_Group).val(storedValues);




                    var mapPoints = []; 
                    var anUrl = ''; 
                    let regionAlele = {};
                    let alleleInfo = {};
                    var isCountry = false;
                    var kind_of_info_key = '';
                    var onePrimary = false;
                    var oneSecondary = false;
                
                    if (kind_of_info == 'Primary') {kind_of_info_key = 'P'} else if (kind_of_info == 'Secondary') {kind_of_info_key = 'S'} else if (kind_of_info == 'Both') {kind_of_info_key = 'both'}   
                
                    if (country_name == 'All Countries')
                    { 
                      //anUrl = '/allele-mapping/alleles-region/?kind_of_info=' + kind_of_info_key + '&alleles_list=' + group_allele + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size;
                      isCountry = false;  

                      if (AllAlleles == 'F')
                      { 
                        anUrl = '/allele-mapping/alleles-region/?kind_of_info=' + kind_of_info_key + '&alleles_list=' + group_allele + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size;
                      }
                      else
                      {
                        anUrl = '/allele-mapping/alleles-region/?kind_of_info=' + kind_of_info_key + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size;
                      }
                    }
                    else
                    { 
                      //anUrl = '/allele-mapping/alleles-region/?country=' + country_name +'&kind_of_info=' + kind_of_info_key + '&alleles_list=' + group_allele + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size; 
                      isCountry = true;

                      if (AllAlleles == 'F')
                      {
                        anUrl = '/allele-mapping/alleles-region/?country=' + country_name +'&kind_of_info=' + kind_of_info_key + '&alleles_list=' + group_allele + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size;     
                      }
                      else
                      {
                        anUrl = '/allele-mapping/alleles-region/?country=' + country_name +'&kind_of_info=' + kind_of_info_key + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size;                                               
                      }
                    }

                    
                    axios
                    .get(anUrl)
                    .then(function (response) {
                        // ?? Depuración: mira la URL y la respuesta en la consola
                        console.log('URL consultada:', '/allele-mapping/alleles-region/?alleles_list=' + group_allele + '&min_sample_size=' + min_Sample_Size + '&max_sample_size=' + max_Sample_Size);
                        console.log('Respuesta completa:', response.data);
                
                        // Validar que la respuesta tenga la estructura esperada
                        if (!response.data || !Array.isArray(response.data.results)) {
                            console.error('La respuesta no contiene un array "results":', response.data);
                            Swal.close();
                            Swal.fire({
                                icon: 'error',
                                title: 'Error de datos',
                                text: 'El servidor respondió con un formato inesperado.',
                                confirmButtonText: 'Aceptar'
                            });
                            return;
                        }
                        var data = response.data.results;
                        console.log('Número de resultados:', data.length);
                        if (data.length > 0) {
                            // --- HAY DATOS: procesar y dibujar marcadores ---
                            data.forEach(function (region) {
                            
                            if (((kind_of_info_key == 'P') || (kind_of_info_key == 'both')) && (region.coordinates.length > 0))
                            {    
                                if ((isCountry)) //&& (kind_of_info_key == 'P'))  
                                {
                                  sessionStorage.setItem('lat', region.lat);
                                  sessionStorage.setItem('long', region.lon);
                                  sessionStorage.setItem('zoom', '4');  
                                }
                                else
                                {
                                  sessionStorage.setItem('lat', '0');
                                  sessionStorage.setItem('long', '0');
                                  sessionStorage.setItem('zoom', '1');  
                                }

                                regionAlele = {
                                    name: region.population,
                                    latLng: [region.lat, region.lon],
                                    pie: []
                                };
                
                                onePrimary = false;
                                region.alleles.forEach(function (allele) {
                                 if (allele.kind_of_info == "P")
                                 { 
                                    onePrimary = true;
                                    alleleInfo = {
                                        color: obtenerColorPorResto(allele.id),
                                        label: allele.allele_name,
                                        value: allele.allele_frequency,
                                        samplesize: allele.sample_size
                                    };
                                    regionAlele.pie.push(alleleInfo);
                                  }
                                });
                               
                                if (onePrimary)
                                {
                                 regionAlele = adjustLatLngForNewElement(mapPoints, regionAlele);
                                 mapPoints.push(regionAlele);
                                }
                            }

                            if (((kind_of_info_key == 'S') || (kind_of_info_key == 'both')) && (region.coordinates.length > 0))
                            {
                                  sessionStorage.setItem('lat', '0');
                                  sessionStorage.setItem('long', '0');
                                  sessionStorage.setItem('zoom', '1');  
 
                               regionAlele = {
                                    name: region.population,
                                    latLng: [region.coordinates[0].lat, region.coordinates[0].lon],
                                    pie: []
                                };

                                oneSecondary = false;
                                region.alleles.forEach(function (allele) {
                                  if (allele.kind_of_info == "S")
                                  { 
                                    oneSecondary = true;
                                    alleleInfo = {
                                        color: obtenerColorPorResto(allele.id),
                                        label: allele.allele_name,
                                        value: allele.allele_frequency,
                                        samplesize: allele.sample_size
                                    };
                                    regionAlele.pie.push(alleleInfo);
                                  }
                                });
                
                                if (oneSecondary)
                                {
                                 regionAlele = adjustLatLngForNewElement(mapPoints, regionAlele);
                                 mapPoints.push(regionAlele);
                                }
                            }

                            });

                            // Definir funciones auxiliares (se mantienen igual)
                            function chunkArray(arr, size) {
                                const chunks = [];
                                for (let i = 0; i < arr.length; i += size) {
                                    chunks.push(arr.slice(i, i + size));
                                }
                                return chunks;
                            }
                
                            function showModal(name, parts) {
                                const columns = chunkArray(parts, 17);
                                $('#modalTitle').text(name);
                                $('#modalPieChart').html(buildPieSVGForModal(parts));
                
                                let columnsHTML = '';
                                columns.forEach((col) => {
                                    columnsHTML += `<div class="col-md-6 allele-col"><ul>`;
                                    col.forEach(p => {
                                        columnsHTML += `
                                            <li data-label="${p.label}">
                                                <span style="display:inline-block;width:12px;height:12px;background:${p.color};margin-right:8px;border-radius:2px;"></span>
                                                <strong>${p.label}:</strong> ${p.value.toFixed(2)}%,SampleSize: ${p.samplesize}
                                            </li>`;
                                    });
                                    columnsHTML += `</ul></div>`;
                                });
                                $('#alleleColumns').html(columnsHTML);
                
                                $('#modalPieChart .pie-slice').on('mouseenter', function() {
                                    const label = $(this).data('label');
                                    $('#alleleColumns li').removeClass('highlighted');
                                    $(`#alleleColumns li[data-label="${label}"]`).addClass('highlighted');
                                }).on('mouseleave', function() {
                                    $('#alleleColumns li').removeClass('highlighted');
                                });
                
                                $('#alleleModal').modal('show');
                            }
                
                            function createPieGroup(parts, name, index) {
                                const size = 50, cx = size / 2, cy = size / 2;
                                const pieRadius = 12;
                                const total = parts.reduce((sum, p) => sum + p.value, 0);
                
                                const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                                group.dataset.index = index;
                                group.style.cursor = "pointer";
                
                                const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                                defs.innerHTML = `
                                    <filter id="shadow-${index}" x="-20%" y="-20%" width="150%" height="150%">
                                        <feDropShadow dx="1.5" dy="1.5" stdDeviation="1.2" flood-color="rgba(0,0,0,0.4)" />
                                    </filter>`;
                                group.appendChild(defs);
                
                                if (parts.length === 1) {
                                    const singleSlice = parts[0];
                                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                                    circle.setAttribute("cx", cx);
                                    circle.setAttribute("cy", cy);
                                    circle.setAttribute("r", pieRadius);
                                    circle.setAttribute("fill", singleSlice.color);
                                    group.appendChild(circle);
                                } else {
                                    let startAngle = -Math.PI / 2;
                                    parts.forEach(slice => {
                                        const sliceAngle = (slice.value / total) * Math.PI * 2;
                                        const endAngle = startAngle + sliceAngle;
                                        const x1 = cx + pieRadius * Math.cos(startAngle);
                                        const y1 = cy + pieRadius * Math.sin(startAngle);
                                        const x2 = cx + pieRadius * Math.cos(endAngle);
                                        const y2 = cy + pieRadius * Math.sin(endAngle);
                                        const large = sliceAngle > Math.PI ? 1 : 0;
                                        const d = `M${cx},${cy} L${x1},${y1} A${pieRadius},${pieRadius} 0 ${large},1 ${x2},${y2} Z`;
                
                                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                        path.setAttribute("d", d);
                                        path.setAttribute("fill", slice.color);
                                        path.setAttribute("stroke", "rgba(255,255,255,0.9)");
                                        path.setAttribute("stroke-width", "0.8");
                                        path.setAttribute("filter", `url(#shadow-${index})`);
                                        path.classList.add("pie-slice");
                                        group.appendChild(path);
                
                                        startAngle = endAngle;
                                    });
                                }
                
                                group.addEventListener("click", (e) => {
                                    e.stopPropagation();
                                    showModal(name, parts);
                                });
                
                                return group;
                            }
                
                            function addPieMarkers(map) {
                                const mapObj = $(map).vectorMap('get', 'mapObject');
                                const svgRoot = mapObj.canvas.node;
                                mapObj.pieMarkers = [];
                

                                mapPoints.forEach((pt, i) => {
                                    mapObj.addMarker(i, { latLng: pt.latLng, name: pt.name }, []);
                                    const pieGroup = createPieGroup(pt.pie, pt.name, i);
                                    svgRoot.appendChild(pieGroup);
                                    mapObj.pieMarkers.push(pieGroup);
                                });
                
                                reposition(map);

                            }
                
                            function reposition(map) {
                                const mapObj = $(map).vectorMap('get', 'mapObject');
                                if (!mapObj.pieMarkers) return;
                
                                const markers = mapObj.markers;
                                mapPoints.forEach((_, i) => {
                                    const el = markers[i].element;
                                    const cx = el.shape.node.getAttribute("cx");
                                    const cy = el.shape.node.getAttribute("cy");
                                    const g = mapObj.pieMarkers[i];
                                    if (!g) return;
                                    const x = parseFloat(cx) - 20;
                                    const y = parseFloat(cy) - 20;
                                    g.setAttribute("transform", `translate(${x},${y})`);
                                });
                            }
                
                
                // Funci�n helper: centra usando lat/lng directamente
                function setFocusLatLng(mapObj, lat, lng, scale) {
                  // el proyector interno del mapa mantiene una transformaci�n
                  var proj = mapObj.projection;
                  var point = proj.latLngToPoint(lat, lng);
                
                  // Estos x,y est�n en p�xeles del canvas, hay que normalizarlos
                  // usando el tama�o del canvas (width/height)
                  var svg = $(mapObj.container).find('svg')[0];
                  var w = svg.viewBox.baseVal.width;
                  var h = svg.viewBox.baseVal.height;
                
                  var x = point.x / w;
                  var y = point.y / h;
                
                  mapObj.setFocus({
                    x: x,
                    y: y,
                    scale: scale,
                    animate: true
                  });
                 }
                
                     console.log(typeof jQuery);
                     console.log(typeof $.fn.vectorMap);
                    
                
                            // Inicializar el mapa con los marcadores
                            $('#map').vectorMap({
                                map: 'world_mill_en',
                                backgroundColor: '#eff7ff',
                                regionStyle: { initial: { fill: '#F3D1A2', stroke: '#d2a679' } },
                                markers: mapPoints.map(p => ({ latLng: p.latLng, name: p.name })),
                                markerStyle: {
                                    initial: { r: 8, fill: 'transparent', stroke: 'transparent' },
                                    hover: { fill: 'transparent' }
                                },
                                onViewportChange: () => reposition('#map')
                            });
                
                            //setTimeout(() => addPieMarkers('#map'), 300);


                            setTimeout(() => {
                              Swal.close();
                              requestAnimationFrame(() => {
                                addPieMarkers(map);
                                loadedData = true;
                              });
                            }, 0);
                

                            //if (isCountry) 
                            if ((isCountry) && (kind_of_info_key == 'P'))  
                            {
                             var aLat = parseFloat(sessionStorage.getItem('lat'));
                             var aLong = parseFloat(sessionStorage.getItem('long'));
                             const mapObj = $('#map').vectorMap('get', 'mapObject');
                             mapObj.setFocus({ x: ((aLong+180)/360)-0.02, y: (Math.abs(((aLat+90)/180)-1)+0.1), scale: 4, animate: true });
                            }
                
                            //loadedData = true;
                            //Swal.close();
                        } else {
                            // --- NO HAY DATOS: mostrar mapa vac�o y mensaje ---
                            console.log('No se encontraron datos para los filtros.');
                            $('#map').vectorMap({
                                map: 'world_mill_en',
                                backgroundColor: '#eff7ff',
                                regionStyle: { initial: { fill: '#F3D1A2', stroke: '#d2a679' } },
                                markers: [],
                                markerStyle: {
                                    initial: { r: 8, fill: 'transparent', stroke: 'transparent' },
                                    hover: { fill: 'transparent' }
                                }
                            });
                
                            Swal.close();
                            Swal.fire({
                                icon: 'info',
                                title: 'Sin resultados',
                                text: 'No se encontraron datos para los filtros seleccionados. Prueba con otros valores.',
                                confirmButtonText: 'Aceptar'
                            });
                        }
                    })
                    .catch(function (error) {
                        console.error('Error en la petición:', error);
                        Swal.close();
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de conexión',
                            text: 'Ocurrió un problema al cargar los datos. Intenta de nuevo.',
                            confirmButtonText: 'Aceptar'
                        });
                    }); //catch allelemap-pie


                    


                })
                .catch(function (error) {
                    console.error('Error en la petición:', error);
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'Ocurrió un problema al cargar los datos. Intenta de nuevo.',
                        confirmButtonText: 'Aceptar'
                    });
                }); //catch alleles



            } //End function LoadAlleleGroup

        

        })
        .catch(function (error) {
            console.error('Error en la petición:', error);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Ocurrió un problema al cargar los datos. Intenta de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        }); //catch genes             





 
    })
    .catch(function (error) {
        console.error('Error en la petición:', error);
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Ocurrió un problema al cargar los datos. Intenta de nuevo.',
            confirmButtonText: 'Aceptar'
        });
    }); //catch countries 

});
    


document.getElementById('btreloadgene').addEventListener('click', function() {   
    var aGene = document.getElementById("genes");
    sessionStorage.setItem('gene', aGene.value);

    var aCountry = document.getElementById("country");
    sessionStorage.setItem('country', aCountry.value);

    var aPrimarySecondary = document.getElementById("primarysecondary");
    sessionStorage.setItem('primarysecondary', aPrimarySecondary.value);

    var aGroupAllele = document.getElementById("allele-list");
    var selectedValues = $(aGroupAllele).val();

    //var aAllAlleles = document.getElementById("AllAlleles");
    //sessionStorage.setItem('AllAlleles', aAllAlleles.value);   

    if (selectedValues) {
     sessionStorage.setItem('group_allele', JSON.stringify(selectedValues));
    }
    // CODIGO ANTERIOR
    // var aRange = document.getElementById('sampleSizeRange')
    // .getAttribute('data-value');
    // var aPositionRange = aRange.indexOf(",");
    // var aBegin = aRange.substring(0,aPositionRange);
    // var anEnd = aRange.substring(aPositionRange+1);
    //
    //
    // sessionStorage.setItem('minSampleSize', parseInt(aBegin));
    // sessionStorage.setItem('maxSampleSize', parseInt(anEnd));

    //CODIGO NUEVO
    var range = window.getSampleRange();
    sessionStorage.setItem('minSampleSize', range.min);
    sessionStorage.setItem('maxSampleSize', range.max);
    // FIN CODIGO NUEVO
    setTimeout(function () {
    location.reload()
    }, 500);
});   

document.getElementById('primarysecondary').addEventListener('change', function() {   
    var aPrimarySecondary = document.getElementById("primarysecondary");
    sessionStorage.setItem('primarysecondary', aPrimarySecondary.value); 
});

document.getElementById('AllAlleles').addEventListener('change', function() {
    const checkbox = document.getElementById('AllAlleles');
    const selectElement = document.getElementById('allele-list');
    if (checkbox.checked) {
        console.log('Checkbox marcado, valor:', checkbox.value);
        sessionStorage.setItem('AllAlleles', 'T'); 
        selectElement.disabled = true;
    } else {
        console.log('Checkbox desmarcado, valor:', 'No');
        sessionStorage.setItem('AllAlleles', 'F'); 
        selectElement.disabled = false;
    }
});



document.getElementById('genes').addEventListener('change', function() {   
  var aGene = document.getElementById("genes");
  sessionStorage.setItem('gene', aGene.value);
  var  gene_name =  sessionStorage.getItem('gene');

  $.ajax({
            type: 'GET',
            //url: '/business-gestion/gene/allelic-groups/?gene_name='+gene_name, 
            url: '/business-gestion/gene/alleles-by-gene/?gene_name='+gene_name,          
            error: function () {
                Swal.fire({
                    icon: "error",
                    title: "No se pudieron cargar los datos.",
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            dataType: 'json',
            success: function (response) {
                var data = response;
                //selectGroupAllele = document.getElementById('allelic_group');
                selectGroupAllele = document.getElementById('allele-list');
                selectGroupAllele.innerHTML = ''; 
                data.alleles.forEach(function (alele_group) {
                  var opt = document.createElement('option');
                  opt.value = alele_group;
                  opt.innerHTML = alele_group;
                  selectGroupAllele.appendChild(opt);
                });

                var aAllele_Group = document.getElementById("allele-list");
                var storedValues = JSON.parse(sessionStorage.getItem("group_allele"));
                $(aAllele_Group).val(storedValues);

            }
        });
         
});   