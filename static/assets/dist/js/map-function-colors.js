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