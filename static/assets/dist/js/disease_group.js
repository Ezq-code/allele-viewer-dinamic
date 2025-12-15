// variable para gestionar los elementos seleccionados
let selected_id;
const csrfToken = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("csrftoken="))
    ?.split("=")[1];
const url = "/business-gestion/disease-group/";
var load = document.getElementById("load");


$(document).ready(function () {

    // DataTable initialization
    $("table")
        .addClass("table table-hover")
        .DataTable({
            dom: '<"top"l>Bfrtip',
            buttons: [
                {
                    text: "Add",
                    className: " btn btn-primary btn-info",
                    action: function (e, dt, node, config) {
                        $("#modal-crear-elemento").modal("show");
                    },
                },
                {
                    extend: "excel",
                    text: "Excel",
                },
                {
                    extend: "pdf",
                    text: "PDF",
                },
                {
                    extend: "print",
                    text: "Print",
                },
            ],
            //Adding server-side processing
            serverSide: true,
            search: {
                return: true,
            },
            processing: true,
            ajax: function (data, callback, settings) {
                let dir = "";
                if (data.order[0].dir == "desc") {
                    dir = "-";
                }
                axios
                    .get(url, {
                        params: {
                            page_size: data.length,
                            page: data.start / data.length + 1,
                            search: data.search.value,
                            ordering: dir + data.columns[data.order[0].column].data,
                        },
                    })
                    .then((res) => {
                        callback({
                            recordsTotal: res.data.count,
                            recordsFiltered: res.data.count,
                            data: res.data.results,
                        });
                    })
                    .catch((error) => {
                        alert(error);
                    });
            },
            columns: [
                {data: "name", title: "Name"},
                {data: "description", title: "Description"},
                
                {
                    data: "",
                    title: "Actions",
                    render: (data, type, row) => {
                        return `<div class="btn-group">
                      <button type="button" title="Edit" class="btn bg-info" data-toggle="modal" data-target="#modal-crear-elemento" 
                        data-id="${row.id}" 
                        data-type="edit" 
                        data-name="${row.name}" 
                        data-description="${row.description}" 

                        id="${row.id}">
                        <i class="fas fa-edit"></i>
                      </button>                    
                      <button type="button" title="Delete" class="btn bg-olive" data-toggle="modal" data-target="#modal-eliminar-elemento" data-name="${row.name}" data-id="${row.id}">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>`;
                    },
                },
            ],
            // esto es para truncar el texto de las celdas
            columnDefs: [
                {
                    targets: 1,
                    render: function (data, type, row) {
                        if (data == null || data == "") {
                            return "No Data";
                        } else {
                            return type === "display" && data.length > 80
                                ? data.substr(0, 80) + "…"
                                : data;
                        }
                    },
                },
            ],
        });
});

$("#modal-eliminar-elemento").on("show.bs.modal", function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var dataName = button.data("name"); // Extract info from data-* attributes
    selected_id = button.data("id"); // Extract info from data-* attributes
    var modal = $(this);
    modal.find(".modal-body").text("Do you want to delete the disease group " + dataName + "?");
});

// funcion para eliminar disease group
function function_delete(selected_id) {
    const table = $("#tabla-de-Datos").DataTable();
    axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
    axios
        .delete(`${url}${selected_id}/`)
        .then((response) => {
            Toast.fire({
                icon: "success",
                title: "Disease group deleted successfully",
            });
            table.row(`#${selected_id}`).remove().draw(); // use id selector to remove the row
        })
        .catch((error) => {
            Toast.fire({
                icon: "error",
                title: "Disease group was not deleted",
            });
        });
}

// Modificar el event handler del modal para resetear
$("#modal-crear-elemento").on("hide.bs.modal", (event) => {
    const form = event.currentTarget.querySelector("form");
    form.reset();
    edit_elemento = false;

    const elements = [...form.elements];
    elements.forEach((elem) => elem.classList.remove("is-invalid"));
});

let edit_elemento = false;
// Modificar el event handler del modal para manejar la edición
$("#modal-crear-elemento").on("show.bs.modal", async function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);
    var form = modal.find("form")[0];


    if (button.data("type") == "edit") {
        var dataName = button.data("name");
        var dataId = button.data("id");
        var dataDescription = button.data("description");

        selected_id = dataId;
        edit_elemento = true;
        modal.find(".modal-title").text("Edit " + dataName);
        form.elements.name.value = dataName;
        form.elements.description.value = dataDescription;


    } else {
        modal.find(".modal-title").text("Create Disease Group");
        form.reset();
    }
});

$(function () {
    bsCustomFileInput.init();
});

// form validator
$(function () {
    $.validator.setDefaults({
        language: "en",
        submitHandler: function () {
            // alert("Form successful submitted!");
        },
    });

    $("#form-create-elemento").validate({
        rules: {
            name: {
                required: true,
            },
        },
        messages: {
            name: {
                required: "Name is required",
            },
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass("is-invalid");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass("is-invalid");
        },
    });
});

// crear elemento
let form = document.getElementById("form-create-elemento");
form.addEventListener("submit", function (event) {
    event.preventDefault();
    var table = $("#tabla-de-Datos").DataTable();
    axios.defaults.headers.common["X-CSRFToken"] = csrfToken;

    if (form.checkValidity()) {
        let data = {
            name: form.elements.name.value,
            description: form.elements.description.value,
        };

        if (edit_elemento) {
            $("#modal-crear-elemento").modal("hide");
            load.hidden = false;
            axios
                .patch(`${url}${selected_id}/`, data)
                .then((response) => {
                    if (response.status === 200) {
                        load.hidden = true;
                        table.ajax.reload();
                        Swal.fire({
                            icon: "success",
                            title: "Disease subgroup edited successfully",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        edit_elemento = false;
                    }
                })
                .catch((error) => {
                    load.hidden = true;
                    let dict = error.response.data;
                    let textError = "Details: ";
                    for (const key in dict) {
                        textError += key + ": " + dict[key];
                    }
                    Swal.fire({
                        icon: "error",
                        title: "Error editing Disease subgroup",
                        text: textError,
                        showConfirmButton: false,
                        timer: 5000,
                    });
                });
        } else {
            $("#modal-crear-elemento").modal("hide");
            load.hidden = false;
            axios
                .post(url, data)
                .then((response) => {
                    if (response.status === 201) {
                        load.hidden = true;
                        table.ajax.reload();
                        Swal.fire({
                            icon: "success",
                            title: "Disease subgroup created successfully",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                .catch((error) => {
                    load.hidden = true;
                    let dict = error.response.data;
                    let textError = "Please check the following fields: ";
                    for (const key in dict) {
                        textError += " " + key + ": " + dict[key];
                    }
                    Swal.fire({
                        icon: "error",
                        title: "Error creating Disease subgroup",
                        text: textError,
                        showConfirmButton: true,
                    });
                });
        }
    }
});