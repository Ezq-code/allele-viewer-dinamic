document.addEventListener("DOMContentLoaded", function (event)
{
    showChart();
   
});

function showChart()
{
    let config = {
        title: "Sample 02",
        width: "800",
        height: "600",
        darkMode: true,
        thousandsSeparator: ".",
        decimalSeparator: ",",
        transitionTime: 4,
        measures: [
            { title: "Revenue", prefix: "$" },
            { title: "Profit", prefix: "$" },
            { title: "Avg. num of employees", decimalPlaces: 1 }
        ],
        data: [
            { item: "Company A", period: "2020", val: 1000000, val2: 100000, val3: 8.341 },
            { item: "Company B", period: "2020", val: 450000, val2: 80000, val3: 6.431 },
            { item: "Company C", period: "2020", val: 650000, val2: 200000, val3: 14.123 },
            { item: "Company A", period: "2021", val: 1300000, val2: 134000, val3: 19.65 },
            { item: "Company B", period: "2021", val: 80000, val2: 180000, val3: 14.23 },
            { item: "Company C", period: "2021", val: 950000, val2: 250000, val3: 76.123 },
            { item: "Company A", period: "2022", val: 1550000, val2: 195000, val3: 56.567 },
            { item: "Company B", period: "2022", val: 800000, val2: 110000, val3: 4.1 },
            { item: "Company C", period: "2022", val: 1500000, val2: 300000, val3: 220.23 },
            { item: "Company A", period: "2023", val: 2230000, val2: 220000, val3: 90.47 },
            { item: "Company B", period: "2023", val: 1300000, val2: 125000, val3: 5.98 },
            { item: "Company C", period: "2023", val: 2800000, val2: 280000, val3: 385.76 },
        ]
    }

    kyubitTimeCharts.showBubbleChart("chartDiv", config);
    
}

