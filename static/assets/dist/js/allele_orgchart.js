





    var chart1 = new OrgChart(document.getElementById('tree'), {
        toolbar: {
         layout: true,
         zoom: true,
         fit: true,
         expandAll: false,
         fullScreen: true
     },
        template: 'olivia',
        orientation: OrgChart.orientation.top,
         nodeBinding: {
        field_0: "nombre",
        field_1: "title",
        img_0: "img"
    },
        clinks: [
            {from: 4, to: 0, label: 'text'}, 
            {from: 4, to: 5, template: 'blue', label: '4 reports to 3' },
            {from: 2, to: 6, template: 'yellow', label: 'lorem ipsum' },
        ]             
    });

    chart1.load([
            { id: 0, name: "Amber McKenzie", title: "CEO", img: "/static_output/assets/dist/img/adn.gif" },
            { id: 1, pid: 0,name: "Amber McKenzie", title: "CEO", img: "/static_output/assets/dist/img/adn.gif" },
            { id: 2, pid: 0, name: "Ava Field", title: "IT Manager", img: "https://cdn.balkan.app/shared/empty-img-white.svg" },
            { id: 3, pid: 1, name: "Rhys Harper", img: "https://cdn.balkan.app/shared/empty-img-white.svg",spids: [1003] },
            { id: 4, pid: 2, name: "Amber McKenzie", title: "CEO", img: "/static_output/assets/dist/img/adn.gif" },
            { id: 5, pid: 1, name: "Ava Field", title: "IT Manager", img: "https://cdn.balkan.app/shared/empty-img-white.svg" },
            { id: 6, pid: 2, name: "Rhys Harper", img: "https://cdn.balkan.app/shared/empty-img-white.svg",spids: [1003] }
            ]);


