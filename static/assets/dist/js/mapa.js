jQuery("#world-map").vectorMap({
  map: "world_en",
  backgroundColor: "#a5bfdd",
  borderColor: "#818181",
  borderOpacity: 0.25,
  borderWidth: 1,
  color: "#f4f3f0",
  enableZoom: true,
  hoverColor: "#f9f37a",
  hoverOpacity: null,
  normalizeFunction: "linear",
  scaleColors: ["#b6d6ff", "#005ace"],
  selectedColor: "#c9dfaf",

  showTooltip: true,
  multiSelectRegion: false,
  // Otras configuraciones del mapa
  //selectedRegions: africanCountries, // Selecciona todos los países africanos

  // Establecer colores
  series: {
    regions: [
      {
        values: {
          // Puedes establecer colores específicos aquí si lo deseas
        },
        attribute: "fill", // Asegúrate de que el atributo sea el correcto
      },
    ],
  },

  onRegionClick: function (element, code, region) {
    var message =
      'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
    alert(message);
  },
});
jQuery("#world-map").on("drag", function (event) {});

let countriesByRegion = {
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
// Función para llenar el diccionario
async function fillCountriesByRegion(region) {
  try {
    const response = await axios.get(url, {
      params: {
        search: region,
      },
    });
    countriesByRegion[region] = response.data;
  } catch (error) {
    console.error(`Error fetching data for ${region}:`, error);
  }
}

// Lista de regiones
const regions = Object.keys(countriesByRegion);

// Llenar el objeto para todas las regiones
async function fillAllRegions() {
  const promises = regions.map((region) => fillCountriesByRegion(region));
  await Promise.all(promises);
  localStorage.setItem("countriesByRegion", JSON.stringify(countriesByRegion));
}
let countryColors = {};
let countryColorsWhite = {};
async function getCountriesByRegion(region) {
  const storedData = localStorage.getItem("countriesByRegion");
  // Llamar a la función para llenar todas las regiones
  if (storedData) {
    // Si hay datos, cargar desde localStorage
    Object.assign(countriesByRegion, JSON.parse(storedData));
  } else {
    // Si no hay datos, llenar desde la API
    await fillAllRegions();
  }

  countryColors = {};
  // Reiniciar el mapa antes de aplicar nuevos colores
  resetMap();
  countryColorsWhite = {};
  const countries = countriesByRegion[region];
  if (countries) {
    countries.forEach((pais) => {
      countryColors[pais] = "#0000ff"; // Color azul para cada país
      countryColorsWhite[pais] = "#ffffff"; // Color azul para cada país
    });
    // Pintar los países en el mapa
    jQuery("#world-map").vectorMap("set", "colors", countryColors);
    // Mostrar el modal
    $("#modal-map").modal("show");
  } else {
    //console.log("Región no encontrada.");
  }
}
function resetMap() {
  jQuery("#world-map").vectorMap("set", "colors", countryColorsWhite);
}
