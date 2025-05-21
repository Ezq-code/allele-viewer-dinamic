async function initializeWorldMap(mapId, selectRegion) {
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
  await paintCountriesByRegion(selectRegion);
}
let mypins = {};

jQuery("#world-map3").on("drag", function (event) {});
let countriesByRegion = {}; // Cambiado a null para evitar errores de referencia

const urlRegions = "/business-gestion/regions/";
async function getRegion() {
  try {
    const response = await axios.get(urlRegions);
    countriesByRegion = response.data.results;
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

async function paintCountriesByRegion(selectRegion) {
  // Verificar si countriesByRegion es un objeto y convertirlo en un array
  const regionsArray = Array.isArray(countriesByRegion)
    ? countriesByRegion
    : Object.values(countriesByRegion);
  regionsArray.forEach((region) => {
    if (region.countries && Array.isArray(region.countries)) {
      region.countries.forEach((country) => {
        if (selectRegion == region.symbol) {
          countryColors[country.toLowerCase()] = "#666666"; // Color para cada país
        } else {
          countryColors[country.toLowerCase()] = region.color; // Color para cada país
          countryColorsWhite[country.toLowerCase()] = "#ffffff"; // Color blanco por default
        }
      });
    }
  });

  jQuery("#world-map3").vectorMap("set", "colors", countryColors);
}

async function paintRegionEspecific(especificRegion) {
  // Verificar si countriesByRegion es un objeto y convertirlo en un array
  const regionsArray = Array.isArray(countriesByRegion)
    ? countriesByRegion
    : Object.values(countriesByRegion);
  regionsArray.forEach((region) => {
    if (
      especificRegion == region.symbol &&
      region.countries &&
      Array.isArray(region.countries)
    ) {
      region.countries.forEach((country) => {
        countryColors[country.toLowerCase()] = "#696969"; // Color para cada país
        countryColorsWhite[country.toLowerCase()] = "#ffffff"; // Color blanco por default
      });
    }
  });
  jQuery("#world-map3").vectorMap("set", "colors", countryColors);
}

async function standOutRegionEspecific(especificRegion) {
  // Obtener todas las regiones como array
  const regionsArray = Array.isArray(countriesByRegion)
    ? countriesByRegion
    : Object.values(countriesByRegion);

  // Primero, poner todos los países en blanco
  regionsArray.forEach((region) => {
    if (region.countries && Array.isArray(region.countries)) {
      region.countries.forEach((country) => {
        countryColors[country.toLowerCase()] = "#ffffff";
      });
    }
  });
  // Luego, colorear los países de la región seleccionada con su color
  regionsArray.forEach((region) => {
    if (
      especificRegion == region.symbol &&
      region.countries &&
      Array.isArray(region.countries)
    ) {
      region.countries.forEach((country) => {
        countryColors[country.toLowerCase()] = region.color;
      });
    }
  });

  jQuery("#world-map3").vectorMap("set", "colors", countryColors);
}

let countryColors = {};
let countryColorsWhite = {};

function resetMap() {
  jQuery("#world-map3").vectorMap("set", "colors", countryColorsWhite);
}

// documentacion
// https://github.com/10bestdesign/jqvmap
