const unidadSelect = document.getElementById("unidad");
const fechaInput = document.getElementById("fecha");
const horaInicioInput = document.getElementById("horaInicio");
const cantidadInput = document.getElementById("cantidad");
const vigimanContainer = document.getElementById("vigiman-container");
const ubicacionInput = document.getElementById("ubicacion");
const horaFinInput = document.getElementById("horaFin");

// Cargar unidades desde Google Sheets
fetch("https://script.google.com/macros/s/AKfycbxTuJzRLG4cLZ6cVU7ZIGRxxmnyDwGskT4TTSQTP50/dev")
  .then(res => res.json())
  .then(data => {
    unidadSelect.innerHTML = `<option value="">Seleccione...</option>`;
    data.unidades.forEach(u => {
      unidadSelect.innerHTML += `<option value="${u}">${u}</option>`;
    });
  });

window.onload = () => {
  const hoy = new Date();
  fechaInput.value = hoy.toISOString().split("T")[0];
  horaInicioInput.value = hoy.toTimeString().slice(0, 5);
};

cantidadInput.addEventListener("change", () => {
  const cantidad = parseInt(cantidadInput.value);
  vigimanContainer.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement("div");
    div.classList.add("vigiman-form");

    div.innerHTML = `
      <h3>VIGIMAN ${i}</h3>
      <label>DNI:</label>
      <input type="text" name="dni${i}" required onblur="autocompletarDatos(this, ${i})" />

      <label>Nombre:</label>
      <input type="text" name="nombre${i}" readonly />

      <label>Estatus SUCAMEC:</label>
      <input type="text" name="estatus${i}" readonly />
      <label>Foto SUCAMEC:</label>
      <input type="file" name="fotoSUCAMEC${i}" accept="image/*" capture="environment" />

      <label>Capacitaciones:</label>
      <input type="text" name="capacitaciones${i}" readonly />

      <label>Fotocheck:</label>
      <input type="file" name="fotocheck${i}" accept="image/*" capture="environment" />

      <label>Uniforme:</label>
      <input type="file" name="uniforme${i}" accept="image/*" capture="environment" />

      <label>Foto Supervisión:</label>
      <input type="file" name="fotoSupervision${i}" accept="image/*" capture="environment" />

      <label>Observaciones:</label>
      <textarea name="observaciones${i}"></textarea>
    `;
    vigimanContainer.appendChild(div);
  }
});

function autocompletarDatos(input, index) {
  const dni = input.value;
  if (dni.length !== 8) return;

  fetch("https://script.google.com/macros/s/AKfycbxTuJzRLG4cLZ6cVU7ZIGRxxmnyDwGskT4TTSQTP50/dev?dni=" + dni)
    .then(res => res.json())
    .then(data => {
      if (data.error) return;
      document.querySelector(`[name='nombre${index}']`).value = data.nombre || "";
      document.querySelector(`[name='estatus${index}']`).value = data.estatus || "";
      document.querySelector(`[name='capacitaciones${index}']`).value = data.capacitaciones || "";
    });
}

function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = pos.coords.latitude + "," + pos.coords.longitude;
      ubicacionInput.value = coords;
    }, err => {
      alert("Error al obtener ubicación");
    });
  } else {
    alert("Tu navegador no soporta geolocalización.");
  }
}

function registrarHoraFin() {
  const ahora = new Date();
  horaFinInput.value = ahora.toTimeString().slice(0, 5);
}

document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const response = await fetch("https://script.google.com/macros/s/AKfycbx2uY6z-vv4cUdNMTnmDfn7wSbnZoISbWiLqkmLjC0a2Z0LHoXDd_WvjmWVEO_fnXV_/exec", {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (result.success) {
    alert("Formulario enviado correctamente");
    location.reload();
  } else {
    alert("Error al enviar formulario");
  }
});

