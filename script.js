const API_URL = "https://script.google.com/macros/s/AKfycbx72HP3AzgJrLeOjr6u4tjtvW8wFQLpSzyjb2loJyyDrq8j61wo7Fsfp08SGFe7rGmK/exec";

document.addEventListener("DOMContentLoaded", () => {
  // Set fecha y hora inicio en formato ISO para input text
  document.getElementById("fechaInicio").value = new Date().toISOString().slice(0,10);
  document.getElementById("horaInicio").value = new Date().toTimeString().slice(0,5);

  cargarUnidades();

  document.getElementById("numVigiman").addEventListener("change", generarSubformularios);
  document.getElementById("btnUbicacion").addEventListener("click", obtenerUbicacion);
  document.getElementById("btnFin").addEventListener("click", () => {
    document.getElementById("horaFin").value = new Date().toTimeString().slice(0,5);
  });

  document.getElementById("supervisionForm").addEventListener("submit", enviarFormulario);
});

async function cargarUnidades() {
  const res = await fetch(`${API_URL}?action=getUnidades`);
  const unidades = await res.json();
  const select = document.getElementById("unidad");
  select.innerHTML = unidades.map(u => `<option value="${u}">${u}</option>`).join('');
}

function generarSubformularios() {
  const container = document.getElementById("vigimanContainer");
  container.innerHTML = "";
  const num = parseInt(document.getElementById("numVigiman").value);
  for(let i=1; i<=num && i<=15; i++) {
    const div = document.createElement("div");
    div.className = "vigiman-block";
    div.innerHTML = `
      <h3>VIGIMAN ${i}</h3>
      <label>DNI:</label>
      <input type="text" id="dni_${i}" name="dni_${i}" maxlength="8" required>
      <button type="button" onclick="validarDNI(${i})">Validar DNI</button>
      
      <label>Apellidos y Nombres:</label>
      <input type="text" id="nombre_${i}" name="nombre_${i}" readonly>
      
      <label>Estatus SUCAMEC:</label>
      <input type="text" id="estatus_${i}" name="estatus_${i}" readonly>
      
      <label>Capacitaciones:</label>
      <input type="text" id="capacitaciones_${i}" name="capacitaciones_${i}" readonly>
      
      <label>Foto Supervisión:</label>
      <input type="file" name="foto_${i}" accept="image/*" capture="camera" multiple>
    `;
    container.appendChild(div);
  }
}

async function validarDNI(i) {
  const dni = document.getElementById(`dni_${i}`).value.trim();
  if (!dni) return alert("Ingrese un DNI");
  const res = await fetch(`${API_URL}?action=buscarDNI&dni=${dni}`);
  const data = await res.json();
  if (data.error) {
    alert("DNI no encontrado");
    return;
  }
  document.getElementById(`nombre_${i}`).value = data.nombre;
  document.getElementById(`estatus_${i}`).value = data.estatus;
  document.getElementById(`capacitaciones_${i}`).value = data.capacitaciones;
}

function obtenerUbicacion() {
  if(!navigator.geolocation) return alert("Geolocalización no soportada");
  navigator.geolocation.getCurrentPosition(pos => {
    const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
    document.getElementById("ubicacion").value = `https://maps.google.com/?q=${coords}`;
    alert("Ubicación cargada: " + coords);
  }, err => alert("Error al obtener ubicación: " + err.message));
}

async function enviarFormulario(e) {
  e.preventDefault();
  const form = document.getElementById("supervisionForm");
  const formData = new FormData(form);

  // Validar que el número de vigiman no exceda 15
  const num = parseInt(formData.get("numVigiman"));
  if (num < 1 || num > 15) return alert("Número de VIGIMAN debe ser entre 1 y 15");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData
    });
    const text = await res.text();
    if(text === "OK") {
      alert("Formulario enviado correctamente");
      location.reload();
    } else {
      alert("Error al enviar: " + text);
    }
  } catch(err) {
    alert("Error al enviar: " + err.message);
  }
}
