const URL_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbyzW5Qfp6nfwsm_l49Vn7ED3HDVVO-PSUKRllWubMXYtuD4_RJaeNgFcY2hOJ2CYZPe/exec'; // ← REEMPLAZA ESTO

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  document.getElementById('fecha').value = now.toISOString().split('T')[0];
  document.getElementById('horaInicio').value = now.toTimeString().substring(0, 5);
  cargarUnidades();
});

function cargarUnidades() {
  fetch('TU_URL_DE_SCRIPT_UNIDADES') // ← Reemplaza con tu función que retorna unidades
    .then(r => r.json())
    .then(unidades => {
      const select = document.getElementById('unidad');
      unidades.forEach(u => {
        const option = document.createElement('option');
        option.value = u;
        option.textContent = u;
        select.appendChild(option);
      });
    });
}

function generarSubformularios() {
  const cantidad = parseInt(document.getElementById('cantidadVigiman').value);
  const container = document.getElementById('subformularios-container');
  container.innerHTML = '';

  for (let i = 1; i <= cantidad; i++) {
    const fieldset = document.createElement('fieldset');
    fieldset.innerHTML = `
      <legend>VIGIMAN ${i}</legend>
      <label>DNI:
        <input type="text" name="dni${i}" required onblur="buscarDatosPorDNI(this, ${i})">
      </label>
      <label>Nombre:
        <input type="text" name="nombre${i}" readonly>
      </label>
      <label>Estatus SUCAMEC:
        <input type="text" name="sucamec${i}" readonly>
        <input type="file" name="fotoSucamec${i}" accept="image/*" capture="environment">
      </label>
      <label>Capacitaciones:
        <input type="text" name="capacitaciones${i}" readonly>
      </label>
      <label>Fotocheck:
        <input type="file" name="fotocheck${i}" accept="image/*" capture="environment">
      </label>
      <label>Uniforme:
        <input type="file" name="uniforme${i}" accept="image/*" capture="environment">
      </label>
      <label>Foto Supervisión:
        <input type="file" name="fotoSupervision${i}" accept="image/*" capture="environment">
      </label>
      <label>Observaciones:
        <input type="text" name="observaciones${i}">
        <input type="file" name="fotoObservacion${i}" accept="image/*" capture="environment">
      </label>
    `;
    container.appendChild(fieldset);
  }
}

function obtenerUbicacion() {
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('ubicacion').value = `${pos.coords.latitude},${pos.coords.longitude}`;
  }, () => {
    alert('No se pudo obtener la ubicación.');
  });
}

function finalizarSupervision() {
  const now = new Date();
  document.getElementById('horaFin').value = now.toTimeString().substring(0, 5);
}

function buscarDatosPorDNI(input, index) {
  const dni = input.value;
  if (!dni) return;
  fetch(`TU_URL_DE_SCRIPT_BUSQUEDA_DNI?dni=${dni}`) // ← Reemplaza con tu endpoint Apps Script
    .then(r => r.json())
    .then(data => {
      if (data) {
        document.querySelector(`[name=nombre${index}]`).value = data.nombre || '';
        document.querySelector(`[name=sucamec${index}]`).value = data.sucamec || '';
        document.querySelector(`[name=capacitaciones${index}]`).value = data.capacitaciones || '';
      }
    });
}

document.getElementById('formulario-supervision').addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: formData,
  })
    .then(r => r.text())
    .then(r => alert('Enviado correctamente.'))
    .catch(err => alert('Error al enviar'));
});
