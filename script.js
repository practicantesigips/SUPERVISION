function generarSubformularios() {
  const cantidad = parseInt(document.getElementById("numero").value);
  const contenedor = document.getElementById("subformularios");
  contenedor.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement("fieldset");
    div.innerHTML = `
      <legend>VIGIMAN ${i}</legend>
      <label>DNI: <input type="text" name="dni${i}" required></label><br>
      <label>Nombre: <input type="text" name="nombre${i}"></label><br>
      <label>Estatus SUCAMEC: 
        <select name="sucamec${i}">
          <option value="VIGENTE">VIGENTE</option>
          <option value="VENCIDO">VENCIDO</option>
          <option value="EN TRÁMITE">EN TRÁMITE</option>
        </select>
      </label><br>
      <label>Capacitaciones: <input type="text" name="capacitaciones${i}"></label><br>
      <label>Fotocheck correcto:
        <select name="fotocheck${i}">
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
      </label><br>
      <label>Uniforme correcto:
        <select name="uniforme${i}">
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
      </label><br>
      <label>Fotos: <input type="file" name="fotos${i}" multiple></label><br>
      <label>Observaciones: <textarea name="observaciones${i}"></textarea></label><br>
      <label>Ubicación: <input type="text" name="ubicacion${i}" readonly></label><br>
    `;
    contenedor.appendChild(div);
    obtenerUbicacion(i);
  }
}

function obtenerUbicacion(i) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.querySelector(`input[name="ubicacion${i}"]`).value =
          pos.coords.latitude + "," + pos.coords.longitude;
      },
      (err) => {
        console.error("Error obteniendo ubicación", err);
        document.querySelector(`input[name="ubicacion${i}"]`).value = "No disponible";
      }
    );
  } else {
    document.querySelector(`input[name="ubicacion${i}"]`).value = "No soportado";
  }
}

document.getElementById("formularioVigiman").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  fetch("https://script.google.com/macros/s/AKfycbzG4zhBCk6b101eJxC8JPPzLiS2rZ05EHblqUrvIkfYnfYJnzbBUAS6FGCA2Bh6Nh25/exec", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(data => {
      alert("Datos enviados correctamente");
      document.getElementById("formularioVigiman").reset();
      document.getElementById("subformularios").innerHTML = "";
    })
    .catch(err => {
      console.error(err);
      alert("Error al enviar datos");
    });
});
