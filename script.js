const apiUrl = "https://script.google.com/macros/s/AKfycbx0XvHKat-IyVWGvE_cp881vy_E79XOYn7igZdZE-vFk6UDyCHduqWJpBm5ePBSSOil/exec";

document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date();
  document.getElementById("fecha").value = hoy.toISOString().slice(0, 10);
  document.getElementById("horaInicio").value = hoy.toTimeString().slice(0, 5);
});

function generarSubformularios() {
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const contenedor = document.getElementById("subformularios");
  contenedor.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `
      <legend>VIGIMAN ${i}</legend>
      <label for="dni${i}">DNI:</label>
      <input type="text" id="dni${i}" name="dni${i}">
      <button type="button" onclick="validarDni(${i})">Validar DNI</button><br>

      <label for="nombre${i}">Nombre:</label>
      <input type="text" id="nombre${i}" name="nombre${i}" readonly><br>

      <label for="estatus${i}">Estatus SUCAMEC:</label>
      <input type="text" id="estatus${i}" name="estatus${i}" readonly>
      <input type="file" name="fotoSUCAMEC${i}" accept="image/*" capture multiple><br>

      <label for="capacitaciones${i}">Capacitaciones:</label>
      <input type="text" id="capacitaciones${i}" name="capacitaciones${i}" readonly><br>

      <label for="fotocheck${i}">Fotocheck:</label>
      <input type="file" name="fotocheck${i}" accept="image/*" capture multiple><br>

      <label for="uniforme${i}">Uniforme:</label>
      <input type="file" name="uniforme${i}" accept="image/*" capture multiple><br>

      <label for="observaciones${i}">Observaciones:</label>
      <textarea id="observaciones${i}" name="observaciones${i}"></textarea>
      <input type="file" name="observacionFoto${i}" accept="image/*" capture multiple><br>
    `;
    contenedor.appendChild(fieldset);
  }
}

function validarDni(index) {
  const dni = document.getElementById(`dni${index}`).value;
  if (!dni) return alert("Ingrese un DNI");

  fetch(`${apiUrl}?dni=${dni}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert("DNI no encontrado");
      document.getElementById(`nombre${index}`).value = data.nombre;
      document.getElementById(`estatus${index}`).value = data.estatus;
      document.getElementById(`capacitaciones${index}`).value = data.capacitaciones;
    })
    .catch(err => alert("Error al buscar el DNI"));
}

function cargarUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      document.getElementById("ubicacion").value = coords;
    }, () => alert("Error al obtener ubicación"));
  } else {
    alert("Geolocalización no soportada");
  }
}

function cargarHoraFin() {
  const ahora = new Date();
  document.getElementById("horaFin").value = ahora.toTimeString().slice(0, 5);
}

document.getElementById("formularioVigiman").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    unidad: form.unidad.value,
    fecha: form.fecha.value,
    horaInicio: form.horaInicio.value,
    supervisorNombre: form.supervisorNombre.value,
    supervisorDni: form.supervisorDni.value,
    cantidad: parseInt(form.cantidad.value),
    ubicacion: form.ubicacion.value,
    horaFin: form.horaFin.value
  };

  for (let i = 1; i <= data.cantidad; i++) {
    data[`dni${i}`] = form[`dni${i}`]?.value || "";
    data[`nombre${i}`] = form[`nombre${i}`]?.value || "";
    data[`estatus${i}`] = form[`estatus${i}`]?.value || "";
    data[`capacitaciones${i}`] = form[`capacitaciones${i}`]?.value || "";
    data[`observaciones${i}`] = form[`observaciones${i}`]?.value || "";
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  const res = await response.json();
  if (res.success) {
    alert("Supervisión enviada con éxito.");
    form.reset();
  } else {
    alert("Error al enviar el formulario.");
  }
});

