const API_URL = 'https://script.google.com/macros/s/AKfycbxSg5yPOe7N9hVokL64uJb1dl4F9mLpnoiHp1QWxqrpz4EJN7Y7z3OjiW0LoOqpsqyg/exec';

document.addEventListener("DOMContentLoaded", () => {
  const fecha = new Date();
  document.getElementById("fecha").value = fecha.toISOString().split('T')[0];
  document.getElementById("horaInicio").value = fecha.toTimeString().slice(0, 5);
});

function generarSubformularios() {
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const contenedor = document.getElementById("subformularios");
  contenedor.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = `VIGIMAN ${i}`;
    fieldset.appendChild(legend);

    const dniLabel = document.createElement("label");
    dniLabel.textContent = "DNI:";
    const dniInput = document.createElement("input");
    dniInput.type = "text";
    dniInput.name = `dni${i}`;
    dniInput.id = `dni${i}`;
    dniInput.required = true;

    const validarBtn = document.createElement("button");
    validarBtn.textContent = "Validar DNI";
    validarBtn.type = "button";
    validarBtn.onclick = () => validarDNI(i);

    const nombre = crearInput(`nombre${i}`, "Nombre y Apellido", true);
    const estatus = crearInput(`estatus${i}`, "Estatus SUCAMEC", true);
    const capacitaciones = crearInput(`capacitaciones${i}`, "N° de Capacitaciones", true);

    const fotoEstatus = crearFile(`fotoEstatus${i}`, "Foto Estatus SUCAMEC");
    const fotocheck = crearFile(`fotocheck${i}`, "Fotocheck");
    const uniforme = crearFile(`uniforme${i}`, "Uniforme");
    const observaciones = crearFile(`observaciones${i}`, "Observaciones");

    fieldset.appendChild(dniLabel);
    fieldset.appendChild(dniInput);
    fieldset.appendChild(validarBtn);
    fieldset.appendChild(nombre);
    fieldset.appendChild(estatus);
    fieldset.appendChild(capacitaciones);
    fieldset.appendChild(fotoEstatus);
    fieldset.appendChild(fotocheck);
    fieldset.appendChild(uniforme);
    fieldset.appendChild(observaciones);

    contenedor.appendChild(fieldset);
  }
}

function crearInput(id, label, readonly = false) {
  const container = document.createElement("div");
  const lbl = document.createElement("label");
  lbl.textContent = label;
  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.name = id;
  if (readonly) input.readOnly = true;
  container.appendChild(lbl);
  container.appendChild(input);
  return container;
}

function crearFile(name, label) {
  const container = document.createElement("div");
  const lbl = document.createElement("label");
  lbl.textContent = label;
  const input = document.createElement("input");
  input.type = "file";
  input.name = name;
  input.accept = "image/*";
  input.multiple = true;
  container.appendChild(lbl);
  container.appendChild(input);
  return container;
}

function validarDNI(index) {
  const dni = document.getElementById(`dni${index}`).value;
  if (!dni) return alert("Ingresa un DNI.");

  fetch(`${API_URL}?dni=${dni}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert("DNI no encontrado.");
      document.getElementById(`nombre${index}`).value = data.nombre || "";
      document.getElementById(`estatus${index}`).value = data.estatus || "";
      document.getElementById(`capacitaciones${index}`).value = data.capacitaciones || "";
    });
}

function cargarUbicacion() {
  navigator.geolocation.getCurrentPosition(position => {
    const coords = `${position.coords.latitude},${position.coords.longitude}`;
    document.getElementById("ubicacion").value = coords;
  }, () => {
    alert("No se pudo obtener la ubicación.");
  });
}

function cargarHoraFin() {
  const hora = new Date().toTimeString().slice(0, 5);
  document.getElementById("horaFin").value = hora;
}

document.getElementById("formularioVigiman").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const json = {};

  for (let [key, value] of formData.entries()) {
    if (value instanceof FileList) {
      json[key] = [];
      for (let file of value) {
        const base64 = await toBase64(file);
        json[key].push(base64);
      }
    } else {
      json[key] = value;
    }
  }

  const cantidad = parseInt(json.cantidad);
  json.cantidad = cantidad;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "Content-Type": "application/json" }
  }).then(res => res.json())
    .then(data => {
      alert("Supervisión enviada correctamente.");
      form.reset();
    }).catch(err => {
      console.error(err);
      alert("Error al enviar.");
    });
});

function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = err => rej(err);
    reader.readAsDataURL(file);
  });
}
