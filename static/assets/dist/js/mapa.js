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

//   onRegionClick: function (element, code, region) {
//     var message =
//       'You clicked "' + region + '" which has the code: ' + code.toUpperCase();

//     alert(message);
//   },
});

jQuery("#world-map").on("drag", function (event) {});

const countriesByRegion = {
  Africa: [
    "ao",
    "dz",
    "bj",
    "bw",
    "bf",
    "bi",
    "cm",
    "cv",
    "cf",
    "cg",
    "dj",
    "eg",
    "gq",
    "er",
    "ma",
    "et",
    "ga",
    "gh",
    "gm",
    "gn",
    "gw",
    "ke",
    "ls",
    "lr",
    "mg",
    "ml",
    "mr",
    "mu",
    "mw",
    "na",
    "ne",
    "ng",
    "rw",
    "sc",
    "sd",
    "sl",
    "sn",
    "so",
    "sz",
    "td",
    "tg",
    "tz",
    "ug",
    "za",
    "zm",
    "zw",
    "ly",
    "ci",
    "cd",
    "mz",
    "tn",
    "re",
    "km",
  ],
  Europe: [
    "at",
    "be",
    "bg",
    "hr",
    "cy",
    "cz",
    "dk",
    "ee",
    "fi",
    "fr",
    "de",
    "gr",
    "hu",
    "ie",
    "it",
    "lv",
    "lt",
    "lu",
    "mt",
    "nl",
    "pl",
    "pt",
    "ro",
    "sk",
    "si",
    "es",
    "se",
    "gb",
    "is",
    "no",
    "ch",
  ],
  "East-Asia": ["cn", "jp", "kr", "mn", "tw", "hk"],
  "South-Asia": ["af", "bd", "bt", "in", "mv", "np", "pk", "lk"],
  America: [
    "ag",
    "ai",
    "ar",
    "bs",
    "bb",
    "bz",
    "bo",
    "br",
    "ca",
    "cl",
    "co",
    "cr",
    "cu",
    "do",
    "ec",
    "sv",
    "gt",
    "gy",
    "hn",
    "jm",
    "mx",
    "ni",
    "pa",
    "py",
    "pe",
    "sr",
    "tt",
    "us",
    "uy",
    "ve",
    "gf",
    "ht",
  ],
  "Middle-East": [
    "ae",
    "bh",
    "iq",
    "ir",
    "il",
    "jo",
    "kw",
    "lb",
    "om",
    "qa",
    "sa",
    "sy",
    "tr",
    "ye",
  ],
  "Central-Asia": ["kz", "kg", "tj", "tm", "uz"],
  Australian: ["au", "nz"],
};

let countryColors = {};
let countryColorsWhite = {};
function getCountriesByRegion(region) {
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
