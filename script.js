const API_URL = "https://script.google.com/macros/s/AKfycbwpwiCtEC_GviRkv3t2JhpjZI2B64Gpymh5XPGbOLcff1L2hXyjALlIoB-UmtyOAjeU/exec";

window.onload = async () => {
  const fecha = new Date();
  document.getElementById("fecha").value = fecha.toISOString().split("T")[0];
  document.getElementById("horaInicio").value = fecha.toTimeString().split(":").slice(0,2).join(":");

  // Cargar unidades desde Google Sheet
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const select = document.getElementById("unidad");
    data.unidades.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando unidades:", err);
  }
};

function generarSubformularios() {
  const cantidad = parseInt(document.getElementById("numero").value);
  const contenedor = document.getElementById("subformularios");
  contenedor.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement("fieldset");
    div.innerHTML = `
      <legend>VIGIMAN ${i}</legend>
      <label>DNI: <input type="text" name="dni${i}" id="dni${i}" required> 
        <button type="button" onclick="validarDNI(${i})">Validar DNI</button></label><br>

      <label>Nombre: <input type="text" name="nombre${i}" id="nombre${i}" readonly></label><br>
      <label>Estatus SUCAMEC: <input type="text" name="estatus${i}" id="estatus${i}" readonly></label>
      <input type="file" name="fotos_sucamec${i}" accept="image/*" capture="environment" multiple><br>

      <label>Capacitaciones: <input type="text" name="capacitaciones${i}" id="capacitaciones${i}" readonly></label><br>

      <label>Fotocheck correcto: <input type="text" name="fotocheck${i}"></label>
      <input type="file" name="fotos_fotocheck${i}" accept="image/*" capture="environment" multiple><br>

      <label>Uniforme correcto: <input type="text" name="uniforme${i}"></label>
      <input type="file" name="fotos_uniforme${i}" accept="image/*" capture="environment" multiple><br>

      <label>Observaciones: <textarea name="observaciones${i}"></textarea></label>
      <input type="file" name="fotos_observaciones${i}" accept="image/*" capture="environment" multiple><br>

      <button type="button" onclick="cargarUbicacion(${i})">Cargar Ubicación</button>
      <input type="text" name="ubicacion${i}" id="ubicacion${i}" readonly><br>

      <label>Foto Final de Supervisión:
        <input type="file" name="fotos_final${i}" accept="image/*" capture="environment" multiple>
      </label><br>

      <button type="button" onclick="setHoraFin(${i})">Finalizar Supervisión</button>
      <input type="time" name="horaFin${i}" id="horaFin${i}" readonly><br>
    `;
    contenedor.appendChild(div);
  }
}

async function validarDNI(i) {
  const dni = document.getElementById(`dni${i}`).value;
  try {
    const res = await fetch(`${API_URL}?dni=${dni}`);
    const data = await res.json();
    if (data.error) {
      alert("DNI no encontrado");
    } else {
      document.getElementById(`nombre${i}`).value = data.nombre;
      document.getElementById(`estatus${i}`).value = data.estatus;
      document.getElementById(`capacitaciones${i}`).value = data.capacitaciones;
    }
  } catch (err) {
    console.error("Error validando DNI:", err);
  }
}

function cargarUbicacion(i) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        document.getElementById(`ubicacion${i}`).value = coords;
      },
      err => {
        alert("Error obteniendo ubicación");
        console.error(err);
      }
    );
  } else {
    alert("Geolocalización no soportada");
  }
}

function setHoraFin(i) {
  const ahora = new Date();
  const hora = ahora.toTimeString().split(":").slice(0,2).join(":");
  document.getElementById(`horaFin${i}`).value = hora;
}

document.getElementById("formularioVigiman").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {};

  formData.forEach((value, key) => {
    if (data[key]) {
      data[key] += `, ${value}`;
    } else {
      data[key] = value;
    }
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const resData = await res.json();
    if (resData.success) {
      alert("Formulario enviado con éxito");
      this.reset();
      document.getElementById("subformularios").innerHTML = "";
    } else {
      alert("Error al enviar el formulario");
    }
  } catch (err) {
    console.error(err);
    alert("Error al enviar los datos");
  }
});
