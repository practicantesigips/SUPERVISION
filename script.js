document.addEventListener("DOMContentLoaded", () => {
  // Autocompletar fecha y hora al abrir
  document.getElementById("fechaInicio").value = new Date().toLocaleDateString();
  document.getElementById("horaInicio").value = new Date().toLocaleTimeString();

  // Cargar unidades desde Apps Script
  google.script.run.withSuccessHandler(cargarUnidades).obtenerUnidades();

  // Eventos
  document.getElementById("btnGenerar").addEventListener("click", generarSubformularios);
  document.getElementById("btnUbicacion").addEventListener("click", obtenerUbicacion);
  document.getElementById("btnFin").addEventListener("click", () => {
    document.getElementById("horaFin").value = new Date().toLocaleTimeString();
  });

  document.getElementById("supervisionForm").addEventListener("submit", enviarFormulario);
});

// Llenar el select de unidades
function cargarUnidades(unidades) {
  const select = document.getElementById("unidad");
  unidades.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    select.appendChild(opt);
  });
}

// Generar subformularios de Vigiman
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
      <input type="text" name="dni_${i}" id="dni_${i}" maxlength="8">
      <button type="button" onclick="validarDNI(${i})">Validar DNI</button>

      <label>Apellidos y Nombres:</label>
      <input type="text" name="nombre_${i}" id="nombre_${i}" readonly>

      <label>Estatus SUCAMEC:</label>
      <input type="text" name="estatus_${i}" id="estatus_${i}" readonly>

      <label>Capacitaciones:</label>
      <input type="text" name="capacitaciones_${i}" id="capacitaciones_${i}" readonly>

      <label>Fotocheck:</label>
      <input type="file" name="fotocheck_${i}" accept="image/*" capture="camera">

      <label>Uniforme (texto):</label>
      <input type="text" name="uniformeTexto_${i}">

      <label>Uniforme (foto):</label>
      <input type="file" name="uniformeFoto_${i}" accept="image/*" capture="camera">

      <label>Fotos adicionales:</label>
      <input type="file" name="fotos_${i}" accept="image/*" multiple capture="camera">

      <label>Observaciones (texto):</label>
      <textarea name="obsTexto_${i}"></textarea>

      <label>Observaciones (foto):</label>
      <input type="file" name="obsFoto_${i}" accept="image/*" capture="camera">
    `;
    container.appendChild(block);
  }
}

// Validar DNI contra el CSV
function validarDNI(i) {
  const dni = document.getElementById(`dni_${i}`).value;
  if (!dni) {
    alert("Ingrese un DNI");
    return;
  }
  google.script.run.withSuccessHandler(data => {
    if (data.error) {
      alert("DNI no encontrado en la base");
    } else {
      document.getElementById(`nombre_${i}`).value = data.nombre;
      document.getElementById(`estatus_${i}`).value = data.estatus;
      document.getElementById(`capacitaciones_${i}`).value = data.capacitaciones;
    }
  }).buscarDNI(dni);
}

// Obtener ubicación actual
function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      document.getElementById("ubicacion").value = `https://maps.google.com/?q=${coords}`;
      alert("Ubicación registrada");
    }, () => {
      alert("No se pudo obtener la ubicación");
    });
  } else {
    alert("Geolocalización no soportada");
  }
}

// Enviar formulario al backend
function enviarFormulario(e) {
  e.preventDefault();
  const formEl = document.getElementById("supervisionForm");
  const formData = new FormData(formEl);
  const obj = {};
  let totalFields = 0;
  let loadedFields = 0;

  formData.forEach((value, key) => {
    totalFields++;
    if (value instanceof File && value.size > 0) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        obj[key] = ev.target.result;
        loadedFields++;
        if (loadedFields === totalFields) {
          enviar(obj);
        }
      };
      reader.readAsDataURL(value);
    } else {
      obj[key] = value;
      loadedFields++;
    }
  });

  if (![...formData.values()].some(v => v instanceof File && v.size > 0)) {
    enviar(obj);
  }
}

function enviar(obj) {
  google.script.run.withSuccessHandler(msg => {
    alert(msg);
    document.getElementById("supervisionForm").reset();
  }).guardarSupervision(obj);
}
