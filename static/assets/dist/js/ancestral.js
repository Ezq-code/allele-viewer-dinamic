//JavaScript

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

function getOptions(){
    const searchParams = new URLSearchParams(window.location.search);
    let fit = searchParams.get('fit');
    let scaleInitial = 1;
    if (fit == 'yes'){
        scaleInitial = OrgChart.match.boundary;
    }
    return {scaleInitial};
}