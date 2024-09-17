window.onload = function () {
  console.log("✌️internal_status --->", localStorage.getItem("user"));
 
    // esta función llama a un endpoint para desloguear al usuario o a cualquier otro antes de un nuevo login
    axios
      .get("../user-gestion/users/logout/")
      .then(function (res) {
       
      })
      .catch();
  
  clearLocalStorageItems()
};

function clearLocalStorageItems() {
  const items = [
    "internal_status",
    "user",
    "avatar",
    "code",
    "password",
    "email",
    "id",
  ];

  items.forEach((item) => {
    if (localStorage.getItem(item) !== null) {
      localStorage.setItem(item, null);
      
    } else {
    
    }
  });
}

// Llamar a la función para limpiar los elementos
clearLocalStorageItems();
