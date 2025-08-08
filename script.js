const API_URL = "https://script.google.com/macros/s/AKfycbxJWMbPWGpfZnU6TFhQnG0P0MwGUSMmi9iji_VkK7Ot_3n1S0yRXENZijRWLm-G1HSR/exec";

window.onload = () => {
  const fechaInput = document.getElementById("fecha");
  const horaInicioInput = document.getElementById("horaInicio");

  const now = new Date();
  fechaInput.value = now.toISOString().split("T")[0];
  horaInicioInput.value = now.toTimeString().split(":").slice(0, 2).join(":");
};

function generarSubformularios() {
  const cantidad = document.getElementById("cantidad").value;
  const container = document.getElementById("subformularios");
  container.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>VIGIMAN ${i}</h4>
      <label>DNI:</label>
      <input type="text" name="dni${i}" id="dni${i}">
      <button type="button" onclick="validarDni(${i})">Validar DNI</button>
      
      <label>Nombre:</label>
      <input type="text" name="nombre${i}" id="nombre${i}" readonly>

      <label>Estatus SUCAMEC:</label>
      <input type="text" name="estatus${i}" id="estatus${i}" readonly>
      <input type="file" name="fotoEstatus${i}" accept="image/*" capture>

      <label>Capacitaciones:</label>
      <input type="text" name="capacitaciones${i}" id="capacitaciones${i}" readonly>

      <label>Fotocheck:</label>
      <input type="file" name="fotocheck${i}" accept="image/*" capture>

      <label>Uniforme:</label>
      <input type="file" name="uniforme${i}" accept="image/*" capture>

      <label>Observaciones:</label>
      <textarea name="observaciones${i}"></textarea>
      <input type="file" name="fotoObservaciones${i}" accept="image/*" capture>
    `;
    container.appendChild(div);
  }
}

async function validarDni(i) {
  const dni = document.getElementById(`dni${i}`).value;

  try {
    const response = await fetch(`${API_URL}?dni=${dni}`);
    const data = await response.json();

    if (data.nombre) {
      document.getElementById(`nombre${i}`).value = data.nombre;
      document.getElementById(`estatus${i}`).value = data.estatus;
      document.getElementById(`capacitaciones${i}`).value = data.capacitaciones;
    } else {
      alert("DNI no encontrado");
    }
  } catch (error) {
    alert("Error al validar DNI");
  }
}

function cargarUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        document.getElementById("ubicacion").value = `${lat},${lon}`;
      },
      () => alert("No se pudo obtener ubicación")
    );
  } else {
    alert("GPS no soportado en este navegador");
  }
}

function cargarHoraFin() {
  const now = new Date();
  document.getElementById("horaFin").value = now.toTimeString().split(":").slice(0, 2).join(":");
}

document.getElementById("formularioVigiman").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(document.getElementById("formularioVigiman"));
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      alert("Supervisión enviada exitosamente");
      location.reload();
    } else {
      alert("Error al enviar supervisión");
    }
  } catch (err) {
    alert("Error en el envío");
  }
});
