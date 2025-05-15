async function initializeWorldMap(mapId) {
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
    pins: { "pk" : '<i class="fas fa-map-marker text-success"></i>', "ru" : '<i class="fas fa-map-marker text-danger"></i>'},
    series: {
      regions: [{ values: {}, attribute: "fill" }],
    },
    onRegionClick: (element, code, region) => {
      alert(
        `You clicked "${region}" which has the region: ${getRegionByCountry(
          code
        )}`
      );
    },
    onLabelShow: function (event, label, code) {
      let region = getRegionByCountry(code);
      label.text(region);
    },
  });
  await getRegion();
  await paintCountriesByRegion();
  
}


function addPinToUSA() {
  // Coordenadas aproximadas para Estados Unidos (latitud y longitud)
  const usaCoordinates = { lat: 37.0902, lng: -95.7129 };

  // Agregar el pin al mapa
  jQuery("#world-map3").vectorMap("placeMarkers", {
    markers: [
      {
        latLng: [usaCoordinates.lat, usaCoordinates.lng],
        name: "Estados Unidos",
      },
    ],
  });
}




jQuery("#world-map3").on("drag", function (event) {});
let countriesByRegion = {}; // Cambiado a null para evitar errores de referencia

const urlRegions = "/business-gestion/regions/";
async function getRegion() {
  try {
    const response = await axios.get(urlRegions);
    countriesByRegion = response.data.results;
    console.log("✌️countriesByRegion --->", countriesByRegion);
  } catch (error) {
    console.error(`Error fetching data:`, error);
  }
}

function getRegionByCountry(countryCode) {
  if (!countriesByRegion || typeof countriesByRegion !== "object") {
    console.error("countriesByRegion is not properly initialized.");
    return null;
  }
  for (const regionName in countriesByRegion) {
    const region = countriesByRegion[regionName];
    console.log("✌️region ciclo --->", region);
    if (region.countries && Array.isArray(region.countries)) {
      if (
        region.countries.includes(countryCode.toLowerCase()) ||
        region.countries.includes(countryCode.toUpperCase())
      ) {
        return region.name;
      }
    }
  }
  console.warn(`No region found for country code: ${countryCode}`);
  return countryCode;
}

async function paintCountriesByRegion() {
  // Verificar si countriesByRegion es un objeto y convertirlo en un array
  const regionsArray = Array.isArray(countriesByRegion)
    ? countriesByRegion
    : Object.values(countriesByRegion);
  const countryColorArray = [];
  regionsArray.forEach((region) => {
    if (region.countries && Array.isArray(region.countries)) {
      region.countries.forEach((country) => {
        countryColors[country.toLowerCase()] = region.color; // Color para cada país
        countryColorsWhite[country.toLowerCase()] = "#ffffff"; // Color blanco por default
      });
    }
  });
  console.log("✌️countryColors --->", countryColors);
  console.log("✌️countryColorsWhite --->", countryColorsWhite);
  jQuery("#world-map3").vectorMap("set", "colors", countryColors);
}

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
  //   const storedData = localStorage.getItem("countriesByRegion");
  // console.log('✌️storedData --->', storedData);
  //   if (storedData) {
  //     Object.assign(countriesByRegion, JSON.parse(storedData));
  //   } else {
  //     await fillAllRegions();
  //   }
  //   countryColors = {};
  //   countryColorsWhite = {};
  //   resetMap();
  //   const countries = countriesByRegion[region];
  //   if (countries) {
  //     countries.forEach((pais) => {
  //       countryColors[pais] = "#0000ff"; // Azul
  //       countryColorsWhite[pais] = "#ffffff"; // Blanco
  //     });
  //jQuery("#world-map3").vectorMap("set", "colors", countryColors);
  //   }
}

function resetMap() {
  jQuery("#world-map3").vectorMap("set", "colors", countryColorsWhite);
}

// documentacion 
// https://github.com/10bestdesign/jqvmap