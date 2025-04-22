function initializeWorldMap(mapId) {
  jQuery(mapId).vectorMap({
    map: "world_en",
    backgroundColor: "#a5bfdd",
    borderColor: "#818181",
    borderOpacity: 0.25,
    borderWidth: 1,
    color: "#f4f3f0",
    enableZoom: true,
    hoverColor: "#f9f37a",
    normalizeFunction: "linear",
    scaleColors: ["#b6d6ff", "#005ace"],
    selectedColor: "#c9dfaf",
    showTooltip: true,
    multiSelectRegion: false,
    series: {
      regions: [{ values: {}, attribute: "fill" }],
    },
    onRegionClick: (element, code, region) => {
      alert(`You clicked "${region}" which has the code: ${code.toUpperCase()}`);
    },
  });
}

// Exportar la función para que pueda ser utilizada en otros archivos
// export { initializeWorldMap };
jQuery("#world-map3").on("drag", function (event) {});

const countriesByRegion = {
  Africa: [],
  Europe: [],
  "East-Asia": [],
  "South-Asia": [],
  America: [],
  "Middle-East": [],
  "Central-Asia": [],
  Australian: [],
};
const url = "../user-gestion/countries/get-codes/";

async function fillCountriesByRegion(region) {
  try {
    const response = await axios.get(url, { params: { search: region } });
    countriesByRegion[region] = response.data;
  } catch (error) {
    console.error(`Error fetching data for ${region}:`, error);
  }
}

async function fillAllRegions() {
  const promises = Object.keys(countriesByRegion).map(fillCountriesByRegion);
  await Promise.all(promises);
  localStorage.setItem("countriesByRegion", JSON.stringify(countriesByRegion));
}

let countryColors = {};
let countryColorsWhite = {};

async function getCountriesByRegion2(region) {
  const storedData = localStorage.getItem("countriesByRegion");
  if (storedData) {
    Object.assign(countriesByRegion, JSON.parse(storedData));
  } else {
    await fillAllRegions();
  }

  countryColors = {};
  countryColorsWhite = {};
  resetMap();

  const countries = countriesByRegion[region];
  if (countries) {
    countries.forEach((pais) => {
      countryColors[pais] = "#0000ff"; // Azul
      countryColorsWhite[pais] = "#ffffff"; // Blanco
    });
    jQuery("#world-map3").vectorMap("set", "colors", countryColors);
  }
}

function resetMap() {
  jQuery("#world-map3").vectorMap("set", "colors", countryColorsWhite);
}
