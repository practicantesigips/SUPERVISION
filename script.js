const API_URL = "https://script.google.com/macros/s/AKfycbw9itn6hFxu2ClC9t4QZOJrUGBSyjwAF1FO5wJxLgczJOXWb7IQzDkbX2oevjIbQuVX/exec";

document.addEventListener("DOMContentLoaded", () => {
    // Fecha y hora automáticas
    document.getElementById("fechaInicio").value = new Date().toLocaleDateString();
    document.getElementById("horaInicio").value = new Date().toLocaleTimeString();

    cargarUnidades();

    document.getElementById("numVigiman").addEventListener("change", generarSubformularios);
    document.getElementById("btnUbicacion").addEventListener("click", obtenerUbicacion);
    document.getElementById("btnFin").addEventListener("click", () => {
        document.getElementById("horaFin").value = new Date().toLocaleTimeString();
    });

    document.getElementById("supervisionForm").addEventListener("submit", enviarFormulario);
});

// Cargar unidades desde Google Sheets
function cargarUnidades() {
    fetch(`${API_URL}?action=getUnidades`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("unidad");
            data.forEach(unidad => {
                const option = document.createElement("option");
                option.value = unidad;
                option.textContent = unidad;
                select.appendChild(option);
            });
        });
}

// Generar subformularios para cada VIGIMAN
function generarSubformularios() {
    const container = document.getElementById("vigimanContainer");
    container.innerHTML = "";
    const num = parseInt(document.getElementById("numVigiman").value);

    for (let i = 1; i <= num; i++) {
        const block = document.createElement("div");
        block.classList.add("vigiman-block");

        block.innerHTML = `
            <h3>VIGIMAN ${i}</h3>
            <label>DNI:</label>
            <input type="text" name="dni_${i}" id="dni_${i}" maxlength="8" required>
            <button type="button" onclick="validarDNI(${i})">Validar DNI</button>

            <label>Apellidos y Nombres:</label>
            <input type="text" name="nombre_${i}" id="nombre_${i}" readonly>

            <label>Estatus SUCAMEC:</label>
            <input type="text" name="estatus_${i}" id="estatus_${i}" readonly>

            <label>N° de Capacitaciones:</label>
            <input type="text" name="capacitaciones_${i}" id="capacitaciones_${i}" readonly>

            <label>Foto Supervisión:</label>
            <input type="file" name="foto_${i}" accept="image/*" capture="camera">
        `;
        container.appendChild(block);
    }
}

// Validar DNI contra la base de datos
function validarDNI(index) {
    const dni = document.getElementById(`dni_${index}`).value;
    if (!dni) return alert("Ingrese un DNI");

    fetch(`${API_URL}?action=buscarDNI&dni=${dni}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert("DNI no encontrado");
            } else {
                document.getElementById(`nombre_${index}`).value = data.nombre;
                document.getElementById(`estatus_${index}`).value = data.estatus;
                document.getElementById(`capacitaciones_${index}`).value = data.capacitaciones;
            }
        });
}

// Obtener ubicación y generar enlace de Google Maps
function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
            document.getElementById("ubicacion").value = `https://maps.google.com/?q=${coords}`;
            alert("Ubicación registrada");
        }, err => {
            alert("No se pudo obtener la ubicación");
        });
    } else {
        alert("Geolocalización no soportada");
    }
}

// Enviar formulario a Google Sheets
function enviarFormulario(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("supervisionForm"));

    fetch(API_URL, {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(resp => {
        alert("Formulario enviado correctamente");
        location.reload();
    })
    .catch(err => alert("Error al enviar: " + err));
}
