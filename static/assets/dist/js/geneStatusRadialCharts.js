(function () {
    const TOOLTIP_CLASS = 'radial-tooltip';

    function ensureTooltip() {
        let tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = TOOLTIP_CLASS;
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    function clearContainer() {
        const container = document.getElementById('gene-status-summary-container');
        if (container) {
            container.innerHTML = '';
        }
        const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    function buildRadialChart(wrapper, geneName, statusData, statusColorMap, statusMetaMap) {
        const width = 220;
        const height = 220;
        const chartRadius = height / 2 - 20;
        const arcMinRadius = 12;
        const arcPadding = 4;
        const reservedRings = 4;
        const numArcs = statusData.length || 1;
        const totalArcs = numArcs + reservedRings;
        const arcWidth = (chartRadius - arcMinRadius - totalArcs * arcPadding) / totalArcs;

        const tooltip = ensureTooltip();

        const svg = d3.select(wrapper)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const scale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 2 * Math.PI]);

        const arc = d3.arc()
            .innerRadius((d, i) => arcMinRadius + (totalArcs - (i + 1)) * (arcWidth + arcPadding))
            .outerRadius((d, i) => arcMinRadius + (totalArcs - (i + 1)) * (arcWidth + arcPadding) + arcWidth)
            .startAngle(0)
            .endAngle(d => scale(d.value));

        svg.append('g')
            .attr('class', 'radial-axis')
            .selectAll('circle')
            .data(statusData)
            .enter()
            .append('circle')
            .attr('r', (d, i) => arcMinRadius + (totalArcs - (i + 1)) * (arcWidth + arcPadding) + arcWidth + arcPadding)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255,255,255,0.08)')
            .attr('stroke-width', 1);

        const arcs = svg.append('g')
            .attr('class', 'radial-data')
            .selectAll('path')
            .data(statusData)
            .enter()
            .append('path')
            .attr('class', 'radial-arc')
            .style('fill', d => statusColorMap[d.name] || '#CCCCCC')
            .style('opacity', 0.95)
            .attr('d', arc)
            .on('mousemove', function (event, d) {
                const meta = (statusMetaMap && statusMetaMap[d.name]) || {};
                const description = meta.description || 'N/D';
                const type = meta.type || 'N/D';
                const requiresEvidence = meta.requires_evidence ? 'Sí' : 'No';
                const pageX = event.pageX || (d3.event && d3.event.pageX) || 0;
                const pageY = event.pageY || (d3.event && d3.event.pageY) || 0;
                tooltip.style.left = `${pageX + 10}px`;
                tooltip.style.top = `${pageY - 25}px`;
                tooltip.style.display = 'inline-block';
                tooltip.innerHTML = `${geneName}<br>${statusData[d].name}: ${statusData[d].value}%<br>Last update: ${statusData[d].last_release} days ago`;
            })
            .on('mouseout', function () {
                tooltip.style.display = 'none';
            });

        arcs.transition()
            .delay((d, i) => i * 120)
            .duration(700)
            .attrTween('d', function (d, i) {
                const interpolate = d3.interpolate(0, d.value);
                return t => arc({ name: d.name, value: interpolate(t) }, i);
            });
    }

    function renderRadialStatusCharts(genes, statusColorMap, statusMetaMap) {
        const container = document.getElementById('gene-status-summary-container');
        if (!container) return;

        clearContainer();
        genes.forEach(gene => {
            const statusData = (gene.gene_status_list || [])
                .map(status => ({
                    name: status.gene_status,
                    value: Math.max(0, Math.min(100, parseFloat(status.value) || 0)),
                    last_release: status.updated_since   
                }))
                .filter(item => item.name);
            const wrapper = document.createElement('div');
            wrapper.className = 'gene-chart-item radial-chart-item';

            const chartHolder = document.createElement('div');
            chartHolder.className = 'radial-chart-canvas';

            const center = document.createElement('div');
            center.className = 'gene-donut-chart-center';
            const centerName = document.createElement('p');
            centerName.className = 'gene-donut-chart-center-name';
            centerName.textContent = gene.name;
            center.appendChild(centerName);

            chartHolder.appendChild(center);
            wrapper.appendChild(chartHolder);
            container.appendChild(wrapper);

            if (statusData.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'text-muted small';
                empty.textContent = 'Sin estatus';
                wrapper.appendChild(empty);
                return;
            }

            buildRadialChart(chartHolder, gene.name, statusData, statusColorMap, statusMetaMap);
        });
    }

    window.renderRadialStatusCharts = renderRadialStatusCharts;
    window.clearRadialStatusCharts = clearContainer;
})();
