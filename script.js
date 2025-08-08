const API_URL = "https://script.google.com/macros/s/AKfycbxELsampRHSI0IJer3Tn9DVAlWnwEdWpiuvD4ypWc5mUNbS56C0qj-zfrOjUY8vIwQF/exec";

// Cargar fecha y hora inicio
window.onload = () => {
    const hoy = new Date();
    document.getElementById("fechaInicio").value = hoy.toISOString().split("T")[0];
    document.getElementById("horaInicio").value = hoy.toTimeString().slice(0,5);
    cargarUnidades();
};

function cargarUnidades() {
    fetch(`${API_URL}?action=getUnidades`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("unidad");
            data.forEach(u => {
                let opt = document.createElement("option");
                opt.value = u;
                opt.textContent = u;
                select.appendChild(opt);
            });
        });
}

document.getElementById("cantidadVigiman").addEventListener("change", function() {
    const container = document.getElementById("vigimanContainer");
    container.innerHTML = "";
    for (let i = 1; i <= this.value; i++) {
        container.appendChild(crearFormularioVigiman(i));
    }
});

function crearFormularioVigiman(num) {
    const div = document.createElement("div");
    div.classList.add("vigiman-section");
    div.innerHTML = `
        <h3>VIGIMAN ${num}</h3>
        <label>DNI:</label>
        <input type="text" name="dni${num}" maxlength="8" required onblur="validarDNI(this, ${num})">
        
        <label>Nombre:</label>
        <input type="text" name="nombre${num}" readonly>

        <label>Estatus SUCAMEC:</label>
        <input type="text" name="estatus${num}" readonly>

        <label>Capacitaciones:</label>
        <input type="text" name="capacitaciones${num}" readonly>

        <label>Fotocheck:</label>
        <input type="file" name="fotocheck${num}" accept="image/*" multiple>

        <label>Uniforme:</label>
        <input type="file" name="uniforme${num}" accept="image/*" multiple>

        <label>Foto de Supervisión:</label>
        <input type="file" name="fotosupervision${num}" accept="image/*" multiple>

        <label>Observaciones:</label>
        <textarea name="observaciones${num}"></textarea>

        <label>Ubicación:</label>
        <input type="text" name="ubicacion${num}" readonly>
        <button type="button" onclick="capturarUbicacion(${num})">Cargar Ubicación</button>
    `;
    return div;
}

function validarDNI(input, num) {
    const dni = input.value.trim();
    if (dni.length !== 8) return;
    fetch(`${API_URL}?action=validarDNI&dni=${dni}`)
        .then(res => res.json())
        .then(data => {
            if (data) {
                document.querySelector(`[name="nombre${num}"]`).value = data.nombre;
                document.querySelector(`[name="estatus${num}"]`).value = data.estatus;
                document.querySelector(`[name="capacitaciones${num}"]`).value = data.capacitaciones;
            } else {
                alert("DNI no encontrado");
            }
        });
}

function capturarUbicacion(num) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            document.querySelector(`[name="ubicacion${num}"]`).value = coords;
        });
    } else {
        alert("La geolocalización no está soportada en este navegador.");
    }
}

document.getElementById("btnFin").addEventListener("click", () => {
    const ahora = new Date();
    document.getElementById("horaFin").value = ahora.toTimeString().slice(0,5);
});

document.getElementById("supervisionForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch(API_URL, { method: "POST", body: formData })
        .then(res => res.text())
        .then(msg => {
            alert("Supervisión registrada correctamente");
            this.reset();
        })
        .catch(err => console.error(err));
});
