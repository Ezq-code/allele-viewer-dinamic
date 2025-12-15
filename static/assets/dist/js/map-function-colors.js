function GetColorByPopulation(poblation) {
    if ((poblation > 0) && (poblation <= 500)){ return "#CCFFEE" }
    else
    if ((poblation > 500) && (poblation <= 1000)){ return "#B3FFE5" }
    else
    if ((poblation > 1000) && (poblation <= 5000)){ return "#99FFDD" }
    else
    if ((poblation > 5000) && (poblation <= 10000)){ return "#80FFD4" }
    else
    if ((poblation > 10000) && (poblation <= 50000)){ return "#66FFCC" }
    else
    if ((poblation > 10000) && (poblation <= 50000)){ return "#4DFFC3" }
    else
    if ((poblation > 50000) && (poblation <= 100000)){ return "#33FFBB" }
    else
    if ((poblation > 100000) && (poblation <= 500000)){ return "#19FFB2" }
    else
    if ((poblation > 500000) && (poblation <= 1000000)){ return "#00FFAA" }
    else
    if ((poblation > 1000000) && (poblation <= 5000000)){ return "#00E699" }
    else
    if ((poblation > 5000000) && (poblation <= 10000000)){ return "#00CC88" }
    else
    if ((poblation > 10000000) && (poblation <= 50000000)){ return "#00B377" }
    else
    if ((poblation > 50000000) && (poblation <= 100000000)){ return "#009966" }
    else
    if ((poblation > 100000000) && (poblation <= 500000000)){ return "#008055" }
    else
    if ((poblation > 500000000) && (poblation <= 1000000000)){ return "#006644" }
    else
    if ((poblation > 1000000000) && (poblation <= 2000000000)){ return "#004D33" }
    else
    if ((poblation > 2000000000) && (poblation <= 4000000000)){ return "#003322" }
    else
    if (poblation > 4000000000) { return "#003322" }
    else
    { return "#001133" }
}

const populationRangesAfrica = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: 800 },   
    { start: -130000, end: -115000, mag: 199212 },    
    { start: -68950, end: -65002, mag: 14914 },
    { start: -65001, end: -40023, mag: 56201 },
    { start: -40022, end: -26049, mag: 245807 },
    { start: -26048, end: -16206, mag: 830806 },
    { start: -15000, end: -3257, mag: 830806 },
    { start: -3206, end: 0, mag: 4391963 },
    { start: 1, end: 450, mag: 26282329 },
    { start: 460, end: 850, mag: 57869283 },
    { start: 860, end: 1700, mag: 38349576 },
    { start: 1710, end: 1864, mag: 70286434 },
    { start: 1870, end: 1937, mag: 355662677 },
    { start: 1940, end: 1985, mag: 355662677 },
    { start: 1986, end: 2010, mag: 811883854 },
    { start: 2011, end: 2025, mag: 1420012436 }
];

const populationRangesWesternAsia = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 }, 
    { start: -130000, end: -115000, mag: 5535 },    
    { start: -68950, end: -65002, mag: 870 },
    { start: -65001, end: -40023, mag: 229454 },
    { start: -40022, end: -26049, mag: 730679 },
    { start: -26048, end: -16206, mag: 1240438 },
    { start: -15000, end: -3257, mag: 1240438 },
    { start: -3206, end: 0, mag: 8145485 },
    { start: 1, end: 450, mag: 38564545 },
    { start: 460, end: 850, mag: 38564545 },
    { start: 860, end: 1700, mag: 73302798 },
    { start: 1710, end: 1864, mag: 1095343523 },
    { start: 1870, end: 1937, mag: 1095343523 },
    { start: 1940, end: 1985, mag: 1095343523 },
    { start: 1986, end: 2010, mag: 200404752 },
    { start: 2011, end: 2025, mag: 319484333 }
];

const populationRangesEurope = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 },
    { start: -130000, end: -115000, mag: -1 },   
    { start: -68950, end: -65002, mag: 115 },
    { start: -65001, end: -40023, mag: 14277 },
    { start: -40022, end: -26049, mag: 151 },
    { start: -26048, end: -16206, mag: 83576 },
    { start: -15000, end: -3257, mag: 355592 },
    { start: -3206, end: 0, mag: 6656257 },
    { start: 1, end: 450, mag: 24148711 },
    { start: 460, end: 850, mag: 76936913 },
    { start: 860, end: 1700, mag: 83805109 },
    { start: 1710, end: 1864, mag: 231200015 },
    { start: 1870, end: 1937, mag: 231200015 },
    { start: 1940, end: 1985, mag: 599502979 },
    { start: 1986, end: 2010, mag: 772909404 },
    { start: 2011, end: 2025, mag: 772909404 }
];

const populationRangesEasternAsia = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 },
    { start: -130000, end: -115000, mag: 3186 },   
    { start: -68950, end: -65002, mag: 531 },
    { start: -65001, end: -40023, mag: 245303 },
    { start: -40022, end: -26049, mag: 846728 },
    { start: -26048, end: -16206, mag: 1757287 },
    { start: -15000, end: -3257, mag: 1757287 },
    { start: -3206, end: 0, mag: 20651085 },
    { start: 1, end: 450, mag: 81842877 },
    { start: 460, end: 850, mag: 81842877 },
    { start: 860, end: 1700, mag: 271014846 },
    { start: 1710, end: 1864, mag: 271014846 },
    { start: 1870, end: 1937, mag: 774796124 },
    { start: 1940, end: 1985, mag: 1699310746 },
    { start: 1986, end: 2010, mag: 4331271026 },
    { start: 2011, end: 2025, mag: 4331271026 }
];

const populationRangesOceania = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 },
    { start: -130000, end: -115000, mag: -1 },  
    { start: -68950, end: -65002, mag: 5143 },
    { start: -65001, end: -40023, mag: 5143 },
    { start: -40022, end: -26049, mag: 30747 },
    { start: -26048, end: -16206, mag: 50884 },
    { start: -15000, end: -3257, mag: 50884 },
    { start: -3206, end: 0, mag: 230292 },
    { start: 1, end: 450, mag: 1055309 },
    { start: 460, end: 850, mag: 3093224 },
    { start: 860, end: 1700, mag: 7543319 },
    { start: 1710, end: 1864, mag: 7543319 },
    { start: 1870, end: 1937, mag: 7543319 },
    { start: 1940, end: 1985, mag: 19697133 },
    { start: 1986, end: 2010, mag: 44590927 },
    { start: 2011, end: 2025, mag: 44590927 }
];

const populationRangesNorthAmerica = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 },
    { start: -130000, end: -115000, mag: -1 },  
    { start: -68950, end: -65002, mag: -1 },
    { start: -65001, end: -40023, mag: -1 },
    { start: -40022, end: -26049, mag: -1 },
    { start: -26048, end: -16206, mag: -1 },
    { start: -15000, end: -3257, mag: 39280 },
    { start: -3206, end: 0, mag: 309071 },
    { start: 1, end: 450, mag: 2170657 },
    { start: 460, end: 850, mag: 7067457 },
    { start: 860, end: 1700, mag: 28757677 },
    { start: 1710, end: 1864, mag: 84505238 },
    { start: 1870, end: 1937, mag: 112843082 },
    { start: 1940, end: 1985, mag: 112843082 },
    { start: 1986, end: 2010, mag: 204884389 },
    { start: 2011, end: 2025, mag: 379518336 }
];

const populationRangesLatinAmericaCarib = [
    { start: -700000, end: -315444, mag: -1 },   
    { start: -314687, end: -169343, mag: -1 },
    { start: -130000, end: -115000, mag: -1 },  
    { start: -68950, end: -65002, mag: -1 },
    { start: -65001, end: -40023, mag: -1 },
    { start: -40022, end: -26049, mag: -1 },
    { start: -26048, end: -16206, mag: -1 },
    { start: -15000, end: -3257, mag: 33905 },
    { start: -3206, end: 0, mag: 785691 },
    { start: 1, end: 450, mag: 7396896 },
    { start: 460, end: 850, mag: 7396896 },
    { start: 860, end: 1700, mag: 26655753 },
    { start: 1710, end: 1864, mag: 73065409 },
    { start: 1870, end: 1937, mag: 73065409 },
    { start: 1940, end: 1985, mag: 231867728 },
    { start: 1986, end: 2010, mag: 668863908 },
    { start: 2011, end: 2025, mag: 668863908 }
];



// Función para obtener el valor mag actual
function getCurrentMag(currentTime, currentRegion) {
    if (currentRegion == 'Africa')
    {
    return populationRangesAfrica.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }
    else
    if (currentRegion == 'Western Asia')
    {
    return populationRangesWesternAsia.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }
    else
    if (currentRegion == 'Europe')
    {
    return populationRangesEurope.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }
    else
    if (currentRegion == 'Eastern Asia')
    {
    return populationRangesEasternAsia.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }
    else
    if (currentRegion == 'Oceania')
    {
    return populationRangesOceania.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }     
    else
    if (currentRegion == 'North America')
    {
    return populationRangesNorthAmerica.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    } 
    else
    if (currentRegion == 'Latin America & Carib')
    {
    return populationRangesLatinAmericaCarib.find(range => 
        currentTime >= range.start && currentTime <= range.end
    )?.mag || -1;
    }               
    else
    {
        return  -1
    }
}
