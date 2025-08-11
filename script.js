const API_URL = "https://script.google.com/macros/s/AKfycbzYqQ687hkzFoUz93ogc4sV0gShAfO7W1O81iHYklSVdP7e-gun2U-d9OfR5hVtjQkg/exec"; // Pega aquí tu Web App URL

document.addEventListener("DOMContentLoaded", () => {
  const fecha = document.getElementById("fecha");
  const horaInicio = document.getElementById("horaInicio");
  const cantidadInput = document.getElementById("cantidad");
  const vigimanContainer = document.getElementById("vigimanContainer");

  // Fecha y hora automáticas
  const now = new Date();
  fecha.value = now.toISOString().split("T")[0];
  horaInicio.value = now.toTimeString().slice(0, 5);

  // Cargar unidades desde la hoja
  fetch(`${API_URL}?action=getUnidades`)
    .then(res => res.json())
    .then(data => {
      const unidadSelect = document.getElementById("unidad");
      data.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u;
        opt.textContent = u;
        unidadSelect.appendChild(opt);
      });
    });

  // Generar subformularios dinámicos
  const generarVigimanes = () => {
    vigimanContainer.innerHTML = "";
    for (let i = 1; i <= cantidadInput.value; i++) {
      const block = document.createElement("div");
      block.className = "vigiman-block";
      block.innerHTML = `
        <h3>VIGIMAN ${i}</h3>
        <label>DNI:</label>
        <input type="text" name="dni${i}" maxlength="8" required onblur="validarDNI(this, ${i})">
        
        <label>Nombre:</label>
        <input type="text" name="nombre${i}" readonly>
        
        <label>Estatus SUCAMEC:</label>
        <input type="text" name="estatus${i}" readonly>
        
        <label>N° Capacitaciones:</label>
        <input type="text" name="capacitaciones${i}" readonly>
        
        <label>Foto Supervisión:</label>
        <input type="file" name="foto${i}" accept="image/*" capture="camera">
      `;
      vigimanContainer.appendChild(block);
    }
  };

  cantidadInput.addEventListener("change", generarVigimanes);
  generarVigimanes();

  // Captura de ubicación
  document.getElementById("ubicacionBtn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
      document.getElementById("latitud").value = pos.coords.latitude;
      document.getElementById("longitud").value = pos.coords.longitude;
      alert("Ubicación capturada correctamente.");
    }, err => alert("Error al obtener ubicación"));
  });

  // Hora fin
  document.getElementById("finalizarBtn").addEventListener("click", () => {
    const now = new Date();
    document.getElementById("horaFin").value = now.toTimeString().slice(0, 5);
  });

  // Envío de formulario
  document.getElementById("supervisionForm").addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch(API_URL, { method: "POST", body: formData })
      .then(res => res.text())
      .then(resp => alert(resp))
      .catch(err => alert("Error al enviar: " + err));
  });
});

// Validación de DNI contra la hoja
function validarDNI(input, index) {
  if (input.value.length === 8) {
    fetch(`${API_URL}?action=getDniData&dni=${input.value}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          document.querySelector(`[name=nombre${index}]`).value = data.nombre;
          document.querySelector(`[name=estatus${index}]`).value = data.estatus;
          document.querySelector(`[name=capacitaciones${index}]`).value = data.capacitaciones;
        } else {
          alert("DNI no encontrado en la base de datos.");
        }
      });
  }
}
