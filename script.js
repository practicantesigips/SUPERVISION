const API_URL = "PEGAR_URL_WEBAPP_AQUI";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fechaInicio").value = new Date().toLocaleDateString();
  document.getElementById("horaInicio").value = new Date().toLocaleTimeString();

  fetch(`${API_URL}?action=obtenerUnidades`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("unidad");
      data.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u;
        opt.textContent = u;
        select.appendChild(opt);
      });
    });

  document.getElementById("btnGenerar").addEventListener("click", generarSubformularios);
  document.getElementById("btnUbicacion").addEventListener("click", obtenerUbicacion);
  document.getElementById("btnFin").addEventListener("click", () => {
    document.getElementById("horaFin").value = new Date().toLocaleTimeString();
  });

  document.getElementById("supervisionForm").addEventListener("submit", enviarFormulario);
});

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
      <input type="text" id="dni_${i}" maxlength="8">
      <button type="button" onclick="validarDNI(${i})">Validar DNI</button>
      <label>Nombre:</label>
      <input type="text" id="nombre_${i}" readonly>
      <label>Estatus:</label>
      <input type="text" id="estatus_${i}" readonly>
      <label>Capacitaciones:</label>
      <input type="text" id="capacitaciones_${i}" readonly>
      <label>Uniforme (foto):</label>
      <input type="file" name="uniformeFoto_${i}" accept="image/*" capture="camera">
    `;
    container.appendChild(block);
  }
}

function validarDNI(i) {
  const dni = document.getElementById(`dni_${i}`).value;
  fetch(`${API_URL}?action=buscarDNI&dni=${dni}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("DNI no encontrado");
      } else {
        document.getElementById(`nombre_${i}`).value = data.nombre;
        document.getElementById(`estatus_${i}`).value = data.estatus;
        document.getElementById(`capacitaciones_${i}`).value = data.capacitaciones;
      }
    });
}

function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      document.getElementById("ubicacion").value = `https://maps.google.com/?q=${coords}`;
    }, () => {
      alert("No se pudo obtener ubicación");
    });
  } else {
    alert("Geolocalización no soportada");
  }
}

function enviarFormulario(e) {
  e.preventDefault();
  const formData = new FormData(document.getElementById("supervisionForm"));

  fetch(API_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    document.getElementById("supervisionForm").reset();
  });
}
