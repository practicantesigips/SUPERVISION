document.addEventListener('DOMContentLoaded', () => {
  const fecha = new Date();
  document.getElementById('fecha').value = fecha.toISOString().split('T')[0];
  document.getElementById('horaInicio').value = fecha.toTimeString().slice(0, 5);
});

function generarSubformularios() {
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const container = document.getElementById('subformularios');
  container.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement('div');
    div.innerHTML = `
      <h4>VIGIMAN ${i}</h4>
      <label>DNI:</label>
      <input type="text" id="dni${i}">
      <button type="button" onclick="validarDni(${i})">Validar DNI</button>

      <label>Nombre:</label>
      <input type="text" id="nombre${i}" readonly>

      <label>Estatus SUCAMEC:</label>
      <input type="text" id="estatus${i}" readonly>
      <input type="file" name="fotoSUCAMEC${i}" accept="image/*" multiple>

      <label>Capacitaciones:</label>
      <input type="text" id="capacitaciones${i}" readonly>

      <label>Fotocheck:</label>
      <input type="file" name="fotoFotocheck${i}" accept="image/*" multiple>

      <label>Uniforme:</label>
      <input type="file" name="fotoUniforme${i}" accept="image/*" multiple>

      <label>Observaciones:</label>
      <input type="text" id="observaciones${i}">
      <input type="file" name="fotoObservaciones${i}" accept="image/*" multiple>
      <hr>
    `;
    container.appendChild(div);
  }
}

function validarDni(index) {
  const dni = document.getElementById(`dni${index}`).value;
  fetch(`https://script.google.com/macros/s/AKfycbxSg5yPOe7N9hVokL64uJb1dl4F9mLpnoiHp1QWxqrpz4EJN7Y7z3OjiW0LoOqpsqyg/exec?dni=${dni}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("DNI no encontrado");
      } else {
        document.getElementById(`nombre${index}`).value = data.nombre;
        document.getElementById(`estatus${index}`).value = data.estatus;
        document.getElementById(`capacitaciones${index}`).value = data.capacitaciones;
      }
    });
}

function cargarUbicacion() {
  navigator.geolocation.getCurrentPosition(pos => {
    const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
    document.getElementById('ubicacion').value = coords;
  });
}

function cargarHoraFin() {
  const now = new Date();
  document.getElementById('horaFin').value = now.toTimeString().slice(0, 5);
}

document.getElementById('formularioVigiman').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);

  const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYED_API/exec', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  if (result.success) {
    alert('Supervisión enviada con éxito');
    location.reload();
  } else {
    alert('Error al enviar supervisión');
  }
});
