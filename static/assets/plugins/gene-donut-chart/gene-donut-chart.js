/**
 * GeneDonutChart - Librería para visualizar datos de genes en gráficas de dona
 * Versión: 1.0.0
 */

(function(global) {
    'use strict';

    // Constructor principal
    function GeneDonutChart(options) {
        this.options = Object.assign({}, GeneDonutChart.defaults, options);
        this.container = null;
        this.chartsContainer = null;
        this.legendContainer = null;
        this.charts = [];
        
        this.init();
    }

    // Valores por defecto
    GeneDonutChart.defaults = {
        containerId: 'gene-chart-container',
        chartWidth: 250,
        chartHeight: 250,
        innerRadiusRatio: 0.6,
        colors: ['#dc3545', '#ffc107', '#28a745', '#17a2b8', '#6f42c1', '#fd7e14'],
        animationDuration: 800,
        showLegend: false,
        legendTitle: 'Leyenda General',
        legendPosition: 'bottom', // 'bottom' o 'top'
        chartClass: 'gene-donut-chart',
        legendClass: 'gene-chart-legend',
        tooltipEnabled: true,
        hoverEffect: true
    };

    // Método de inicialización
    GeneDonutChart.prototype.init = function() {
        this.container = document.getElementById(this.options.containerId);
        
        if (!this.container) {
            console.error(`GeneDonutChart: No se encontró el contenedor con ID '${this.options.containerId}'`);
            return;
        }

        // Crear estructura HTML
        this.createChartStructure();
        
        // Aplicar estilos CSS
        this.applyStyles();
    };

    // Crear estructura HTML para las gráficas
    GeneDonutChart.prototype.createChartStructure = function() {
        // Limpiar contenedor
        this.container.innerHTML = '';
        
        // Crear contenedor principal
        const chartSection = document.createElement('div');
        chartSection.className = 'gene-chart-section';
        
        // Crear contenedor para las gráficas
        this.chartsContainer = document.createElement('div');
        this.chartsContainer.className = 'gene-charts-container';
        
        // Crear contenedor para la leyenda
        this.legendContainer = document.createElement('div');
        this.legendContainer.className = 'gene-legend-container';
        this.legendContainer.hidden = true;
        
        // Añadir elementos al DOM
        chartSection.appendChild(this.chartsContainer);
        chartSection.appendChild(this.legendContainer);
        this.container.appendChild(chartSection);
    };

    // Aplicar estilos CSS
    GeneDonutChart.prototype.applyStyles = function() {
        // Evitar añadir estilos múltiples veces
        if (document.getElementById('gene-donut-chart-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'gene-donut-chart-styles';
        style.textContent = `
            .gene-chart-section {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .gene-charts-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 30px;
                margin: 20px 0;
            }
            
            .gene-donut-chart-wrapper {
                position: relative;
                width: ${this.options.chartWidth+10}px;
                height: ${this.options.chartHeight+5}px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                background-color: white;
                padding: 2px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .gene-donut-chart-wrapper:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            }
            
            .gene-donut-chart-wrapper svg path {
                transition: all 0.2s ease;
            }
            
            .gene-donut-chart-wrapper:hover svg path {
                filter: brightness(1.1);
            }
            
            .gene-donut-chart {
                width: 100%;
                height: 100%;
            }
            
            .gene-donut-chart-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;
            }
            
            .gene-donut-chart-center-name {
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                margin: 0;
                line-height: 1.2;
            }
            
            .gene-legend-container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 20px;
                width: 100%;
                max-width: 800px;
            }
            
            .gene-legend-title {
                text-align: center;
                margin-bottom: 15px;
                font-weight: 600;
                color: #34495e;
            }
            
            .gene-chart-legend {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 15px;
            }
            
            .gene-legend-item {
                display: flex;
                align-items: center;
                margin-right: 10px;
                margin-bottom: 5px;
            }
            
            .gene-legend-color {
                width: 16px;
                height: 16px;
                border-radius: 3px;
                margin-right: 8px;
            }
            
            .gene-legend-label {
                font-size: 14px;
                color: #7f8c8d;
            }
        `;
        
        document.head.appendChild(style);
    };

    // Método para renderizar las gráficas
    GeneDonutChart.prototype.render = function(genes, statusData) {
console.log('✌️statusData --->', statusData);
console.log('✌️genes --->', genes);
        if (!this.container) {
            console.error('GeneDonutChart: El componente no ha sido inicializado correctamente');
            return;
        }
        
        // Limpiar contenedores
        this.chartsContainer.innerHTML = '';
        this.legendContainer.innerHTML = '';
        this.charts = [];
        
        // Crear leyenda general si está habilitada
        if (this.options.showLegend) {
            this.createLegend(statusData);
            
        }
        
        // Crear una gráfica para cada gen
        genes.forEach((geneName, index) => {
            console.log('✌️geneName --->', geneName);
            console.log('✌️statusData[index] --->', statusData[index]);
            this.createChart(geneName, statusData[index]);
        });
      
    };

    // Crear leyenda
    GeneDonutChart.prototype.createLegend = function(statusData) {
        const legendTitle = document.createElement('div');
        legendTitle.className = 'gene-legend-title';
        legendTitle.textContent = this.options.legendTitle;
        
        const legend = document.createElement('div');
        legend.className = this.options.legendClass;
        
        statusData.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'gene-legend-item';
            
            const legendColor = document.createElement('div');
            legendColor.className = 'gene-legend-color';
            legendColor.style.backgroundColor = item.color;
            
            const legendLabel = document.createElement('div');
            legendLabel.className = 'gene-legend-label';
            legendLabel.textContent = item.label;
            
            legendItem.appendChild(legendColor);
            legendItem.appendChild(legendLabel);
            legend.appendChild(legendItem);
        });
        
        this.legendContainer.appendChild(legendTitle);
        this.legendContainer.appendChild(legend);
    };

    // Crear una gráfica individual
    GeneDonutChart.prototype.createChart = function(geneName, statusData) {
        // Crear el contenedor de la gráfica
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'gene-donut-chart-wrapper';
        
        const chart = document.createElement('div');
        chart.className = this.options.chartClass;
        
        const centerText = document.createElement('div');
        centerText.className = 'gene-donut-chart-center';
        // 1. Asignar el nombre del gen como ID
        centerText.id = geneName;
        // 2. Añadir el botón con el atributo data-gene-name
        centerText.innerHTML = `

            <span class=" mt-2 load-info-genes-btn" data-gene-name="${geneName}">${geneName}</span>
        `;
        
        chartWrapper.appendChild(chart);
        chartWrapper.appendChild(centerText);
        
        this.chartsContainer.appendChild(chartWrapper);
        
        // Dibujar la gráfica usando SVG
        const chartObj = this.drawDonutChart(chart, statusData);
        this.charts.push(chartObj);
        
        return chartObj;
    };

    // Dibujar gráfica de dona
    GeneDonutChart.prototype.drawDonutChart = function(container, data) {
        const width = this.options.chartWidth;
        const height = this.options.chartHeight;
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * this.options.innerRadiusRatio;
        
        // Crear el elemento SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Calcular el total
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        // Crear los segmentos de la dona
        let currentAngle = -90; // Empezar desde arriba
        
        const segments = [];
        
        data.forEach((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            
            // Crear el path para el segmento
            const path = this.createArcPath(
                width / 2, height / 2, 
                radius, innerRadius, 
                currentAngle, currentAngle + angle
            );
            
            const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            segment.setAttribute('d', path);
            segment.setAttribute('fill', item.color);
            segment.setAttribute('stroke', 'white');
            segment.setAttribute('stroke-width', '2');
            segment.setAttribute('data-index', index);
            
            // Animación inicial
            if (this.options.animationDuration > 0) {
                segment.style.opacity = '0';
                segment.style.transform = 'scale(0.8)';
                segment.style.transformOrigin = 'center';
                segment.style.transition = `opacity ${this.options.animationDuration}ms, transform ${this.options.animationDuration}ms`;
                
                setTimeout(() => {
                    segment.style.opacity = '1';
                    segment.style.transform = 'scale(1)';
                }, index * 100);
            }
            
            // Añadir efecto hover y clic
            if (this.options.hoverEffect) {
                segment.addEventListener('mouseenter', function() {
                    this.style.opacity = '0.8';
                    this.style.cursor = 'pointer';
                });
                
                segment.addEventListener('mouseleave', function() {
                    this.style.opacity = '1';
                });

                // Añadir evento de clic al segmento
                segment.addEventListener('click', function() {
                    const geneName = container.closest('.gene-donut-chart-wrapper').querySelector('.load-info-genes-btn').getAttribute('data-gene-name');
                    const clickEvent = new CustomEvent('gene-chart-click', {
                        detail: { geneName: geneName },
                        bubbles: true
                    });
                    container.dispatchEvent(clickEvent);
                });
            }
            
            // Añadir tooltip
            if (this.options.tooltipEnabled) {
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = `${item.label}: ${item.value} (${(percentage * 100).toFixed(1)}%)`;
                segment.appendChild(title);
            }
            
            svg.appendChild(segment);
            segments.push(segment);
            
            currentAngle += angle;
        });
        
        container.appendChild(svg);
        
        return {
            svg: svg,
            segments: segments,
            data: data
        };
    };

    // Crear path para segmento de arco
    GeneDonutChart.prototype.createArcPath = function(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;
        
        const x1 = cx + outerRadius * Math.cos(startAngleRad);
        const y1 = cy + outerRadius * Math.sin(startAngleRad);
        const x2 = cx + outerRadius * Math.cos(endAngleRad);
        const y2 = cy + outerRadius * Math.sin(endAngleRad);
        
        const x3 = cx + innerRadius * Math.cos(endAngleRad);
        const y3 = cy + innerRadius * Math.sin(endAngleRad);
        const x4 = cx + innerRadius * Math.cos(startAngleRad);
        const y4 = cy + innerRadius * Math.sin(startAngleRad);
        
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        
        return `
            M ${x1} ${y1}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z
        `;
    };

    // Método para actualizar datos
    GeneDonutChart.prototype.updateData = function(genes, statusData) {
        this.render(genes, statusData);
    };

    // Método para destruir la instancia
    GeneDonutChart.prototype.destroy = function() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.charts = [];
    };

    // Exponer la librería globalmente
    global.GeneDonutChart = GeneDonutChart;

})(typeof window !== 'undefined' ? window : this);