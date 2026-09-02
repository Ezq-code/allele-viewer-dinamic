# Allele Viewer Backlog

## Objetivo
Evolucionar el Allele Viewer para mejorar analisis cientifico 3D de alelos/genes, comparacion entre estudios, trazabilidad temporal y rendimiento con datasets grandes.

## Convenciones
- Prioridad: P0 (critico), P1 (alto), P2 (medio)
- Estimacion: Story Points (SP)
- Estado inicial sugerido: `TODO`

## Epica E1: Estado de escena, export y reproducibilidad

### US-001 - Exportar estado de escena
- Prioridad: P0
- Estimacion: 5 SP
- Historia:
Como analista, quiero exportar el estado actual del viewer para poder compartir exactamente la misma vista con otro investigador.
- Alcance:
Guardar en JSON: estudio, gen, archivo PDB, filtros activos, overlays, camara, familias/orden visibles, nodo resaltado.
- Criterios de aceptacion:
1. Dado un estado configurado, cuando presiono "Export state", entonces se descarga un JSON valido.
2. El JSON contiene al menos `selectedStudyId`, `uploadFileId`, `camera`, `filters`, `overlays`, `selection`.
3. El archivo exportado puede versionarse sin datos binarios.
- Dependencias:
`static/assets/dist/js/alleleviewer.js`

### US-002 - Restaurar estado de escena
- Prioridad: P0
- Estimacion: 8 SP
- Historia:
Como analista, quiero importar un estado previamente exportado para continuar un analisis sin reconfigurar manualmente.
- Criterios de aceptacion:
1. Dado un JSON valido exportado por el sistema, cuando lo importo, entonces el viewer restaura camara, filtros y overlays.
2. Si faltan campos opcionales, el sistema usa defaults sin romper.
3. Si el estudio no existe, se muestra error amigable y no se bloquea la UI.
- Dependencias:
US-001

### US-003 - Export PNG del viewport con leyenda
- Prioridad: P1
- Estimacion: 3 SP
- Historia:
Como usuario, quiero exportar una imagen PNG del grafo para usarla en reportes.
- Criterios de aceptacion:
1. Genera PNG con resolucion configurable (minimo 1920x1080).
2. Incluye opcionalmente leyenda activa (familias/orden/heatmap).
3. El archivo resultante se descarga sin recargar la pagina.

## Epica E2: Timeline avanzado

### US-004 - Slider temporal continuo
- Prioridad: P0
- Estimacion: 8 SP
- Historia:
Como investigador, quiero navegar por una linea temporal continua para observar aparicion/progresion de nodos.
- Criterios de aceptacion:
1. Existe un slider de tiempo con rango [min_timeline, max_timeline].
2. Mover el slider actualiza nodos visibles en <= 120 ms para datasets medianos.
3. Play/Pause y Step siguen funcionando y sincronizados con el slider.

### US-005 - Ventana temporal
- Prioridad: P1
- Estimacion: 5 SP
- Historia:
Como investigador, quiero filtrar por rango temporal (inicio-fin) para acotar analisis.
- Criterios de aceptacion:
1. Se pueden definir inicio y fin.
2. Solo se muestran nodos con `timeline_appearence` dentro del rango.
3. El filtro es combinable con region, familia y orden.

### US-006 - Ghost trail temporal
- Prioridad: P2
- Estimacion: 8 SP
- Historia:
Como usuario avanzado, quiero visualizar una estela de nodos recientemente aparecidos para entender direccion de propagacion.
- Criterios de aceptacion:
1. Nodos previos se muestran con opacidad degradada configurable.
2. Se puede activar/desactivar desde el panel de acciones.

## Epica E3: Comparacion entre estudios (A/B)

### US-007 - Modo comparacion split-view
- Prioridad: P0
- Estimacion: 13 SP
- Historia:
Como investigador, quiero comparar dos estudios en paralelo para identificar diferencias estructurales.
- Criterios de aceptacion:
1. Se pueden seleccionar Estudio A y Estudio B.
2. Se renderizan dos viewers sincronizados en rotacion/zoom/pan.
3. Se puede desincronizar con un toggle.
- Nota tecnica:
Reusar `viewer` y crear `viewer2` de forma estable.

### US-008 - Resaltado de diferencias A/B
- Prioridad: P1
- Estimacion: 8 SP
- Historia:
Como investigador, quiero ver nodos comunes, exclusivos de A y exclusivos de B con codigos de color claros.
- Criterios de aceptacion:
1. Leyenda de colores visible.
2. Filtro rapido: ver solo comunes, solo A, solo B.
3. Exportable en estado de escena.
- Dependencias:
US-007

## Epica E4: Overlays analiticos y metricas

### US-009 - Colorear por metrica
- Prioridad: P1
- Estimacion: 8 SP
- Historia:
Como analista, quiero cambiar color por metrica (frecuencia, impacto, confidence).
- Criterios de aceptacion:
1. Selector de metrica en UI.
2. Escala de color perceptual con leyenda dinamica.
3. Fallback cuando la metrica no exista en un nodo.

### US-010 - Tamano por metrica
- Prioridad: P1
- Estimacion: 5 SP
- Historia:
Como analista, quiero mapear el radio de esfera a una metrica para identificar valores extremos.
- Criterios de aceptacion:
1. Min/max radio configurables.
2. Opcion para normalizacion lineal o logaritmica.

### US-011 - Panel de diagnostico de datos
- Prioridad: P2
- Estimacion: 5 SP
- Historia:
Como usuario, quiero ver calidad de datos para evitar conclusiones con entradas incompletas.
- Criterios de aceptacion:
1. Conteo de nodos sin region, sin rs, sin timeline.
2. Lista clickeable que enfoque nodos problematicos.

## Epica E5: Seleccion, subgrafos y rutas

### US-012 - Seleccion multiple de nodos
- Prioridad: P1
- Estimacion: 8 SP
- Historia:
Como usuario, quiero seleccionar multiples nodos para operar sobre un subconjunto.
- Criterios de aceptacion:
1. Soporte para Ctrl/Cmd + click y seleccion por caja.
2. Indicador visual de seleccion activa.
3. Acciones: aislar, ocultar resto, limpiar seleccion.

### US-013 - Ruta evolutiva entre dos nodos
- Prioridad: P1
- Estimacion: 13 SP
- Historia:
Como investigador, quiero calcular la ruta evolutiva entre nodo origen y destino.
- Criterios de aceptacion:
1. Seleccion de origen y destino desde UI.
2. Se destaca la ruta en el grafo.
3. Se muestra resumen de longitud y nodos intermedios.

### US-014 - Export del subconjunto visible
- Prioridad: P2
- Estimacion: 5 SP
- Historia:
Como usuario, quiero exportar CSV/JSON del subconjunto visible para analisis externo.
- Criterios de aceptacion:
1. Exporta solo nodos actualmente visibles/seleccionados.
2. Incluye columnas minimas: number, allele, region, order, timeline_appearence.

## Epica E6: Heatmap extendido

### US-015 - Heatmap por plano (XY/XZ/YZ)
- Prioridad: P1
- Estimacion: 8 SP
- Historia:
Como analista, quiero cambiar el plano de densidad para inspeccionar distribucion espacial desde distintos ejes.
- Criterios de aceptacion:
1. Selector de plano en panel lateral.
2. Recalculo y render en el plano elegido.
3. Leyenda consistente en todos los planos.

### US-016 - Volumen de densidad (voxels) opcional
- Prioridad: P2
- Estimacion: 13 SP
- Historia:
Como usuario avanzado, quiero un mapa de densidad 3D para identificar clusters volumetricos.
- Criterios de aceptacion:
1. Toggle de modo volumen.
2. Control de opacidad y umbral.
3. Degradacion elegante de rendimiento cuando dataset es grande.

## Epica E7: Rendimiento y mantenibilidad

### US-017 - Batch rendering y throttling
- Prioridad: P0
- Estimacion: 8 SP
- Historia:
Como usuario, quiero interacciones fluidas aunque el estudio tenga miles de nodos.
- Criterios de aceptacion:
1. Reducir llamadas `viewer.render()` redundantes.
2. Aplicar estilos en bloques y render al final de lote.
3. Mantener UX por debajo de 200 ms en acciones comunes.

### US-018 - Gestion de labels escalable
- Prioridad: P1
- Estimacion: 5 SP
- Historia:
Como usuario, quiero evitar saturacion visual y caida de FPS por exceso de etiquetas.
- Criterios de aceptacion:
1. Lazy labels: mostrar solo en foco/zoom umbral.
2. Limite maximo de labels concurrentes configurable.

### US-019 - Refactor de capas de estilo
- Prioridad: P1
- Estimacion: 8 SP
- Historia:
Como desarrollador, quiero un pipeline de estilos para evitar conflictos entre familia/orden/region/timeline.
- Criterios de aceptacion:
1. Estilo final de un nodo se resuelve por prioridad explicita.
2. No hay regresion en funciones actuales: buscar, familia, orden, region, genealogia.

## Sprint sugerido

### Sprint 1 (P0 base)
- US-001, US-002, US-004, US-017
- Capacidad objetivo: 29 SP

### Sprint 2 (comparacion y overlays)
- US-007, US-008, US-009
- Capacidad objetivo: 29 SP

### Sprint 3 (interaccion analitica)
- US-010, US-012, US-013
- Capacidad objetivo: 26 SP

### Sprint 4 (completitud y optimizacion)
- US-005, US-015, US-018, US-019
- Capacidad objetivo: 26 SP

### Sprint 5 (avanzado)
- US-003, US-011, US-014, US-016
- Capacidad objetivo: 26 SP

## Riesgos y mitigaciones
- Riesgo: conflictos entre overlays (familia, orden, region, timeline).
- Mitigacion: introducir motor de prioridad de estilo antes de nuevas features.

- Riesgo: degradacion de rendimiento por labels y heatmap.
- Mitigacion: lazy rendering, limites por zoom, y batching.

- Riesgo: inconsistencia de datos entre tipos de estudio.
- Mitigacion: validaciones y capa de adaptacion para payload genetico/no genetico.

## Definition of Done (DoD)
1. Funcionalidad probada manualmente en desktop y mobile.
2. Sin errores en consola para flujo principal.
3. Manejo de errores con mensajes claros al usuario.
4. Documentacion minima actualizada.
5. No regresion visible en carga, filtro, animacion y exploracion de nodos.
