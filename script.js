<script>
document.addEventListener('DOMContentLoaded', () => {
  // Cargar unidades
  google.script.run.withSuccessHandler(unidades => {
    const select = document.getElementById('unidad');
    unidades.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      select.appendChild(opt);
    });
  }).getUnidades();

  // Obtener ubicación
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      document.getElementById('ubicacion').value =
        `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
    });
  }

  // Generar checklist al poner número
  document.getElementById('numeroVigiman').addEventListener('change', e => {
    generarVigimanes(parseInt(e.target.value));
  });
});

function generarVigimanes(num) {
  const contenedor = document.getElementById('vigimanes');
  contenedor.innerHTML = '';
  for (let i = 0; i < num; i++) {
    const div = document.createElement('div');
    div.className = 'vigiman';
    div.innerHTML = `
      <h3>Vigiman ${i + 1}</h3>
      <label>DNI:</label>
      <input type="text" name="dni${i}" onchange="buscarDNI(this, ${i})" required>
      <label>Nombre:</label>
      <input type="text" name="nombre${i}" readonly>
      <label>SUCAMEC:</label>
      <input type="text" name="sucamec${i}" readonly>
      <label>Capacitaciones:</label>
      <input type="text" name="capacitaciones${i}" readonly>
      <label>Fotocheck:</label>
      <select name="fotocheck${i}">
        <option value="SI">SI</option>
        <option value="NO">NO</option>
      </select>
      <label>Uniforme:</label>
      <select name="uniforme${i}">
        <option value="SI">SI</option>
        <option value="NO">NO</option>
      </select>
      <label>Observaciones:</label>
      <textarea name="observaciones${i}"></textarea>
      <label>Fotos:</label>
      <input type="file" name="fotos${i}" accept="image/*" multiple>
    `;
    contenedor.appendChild(div);
  }
}

function buscarDNI(input, index) {
  const dni = input.value;
  if (dni.length >= 8) {
    google.script.run.withSuccessHandler(datos => {
      if (datos) {
        document.querySelector(`[name=nombre${index}]`).value = datos.nombre;
        document.querySelector(`[name=sucamec${index}]`).value = datos.sucamec;
        document.querySelector(`[name=capacitaciones${index}]`).value = datos.capacitaciones;
      } else {
        alert('DNI no encontrado');
      }
    }).buscarVigiman(dni);
  }
}

function enviarDatos() {
  const formEl = document.getElementById('formulario');
  const data = {
    unidad: formEl.unidad.value,
    fecha: formEl.fecha.value,
    hora: formEl.hora.value,
    ubicacion: formEl.ubicacion.value,
    numeroVigiman: parseInt(formEl.numeroVigiman.value),
    vigimanes: []
  };

  for (let i = 0; i < data.numeroVigiman; i++) {
    const fotos = [];
    const files = formEl[`fotos${i}`].files;
    for (let j = 0; j < files.length; j++) {
      const reader = new FileReader();
      reader.onload = (function(nombre, tipo) {
        return function(e) {
          fotos.push({ nombre, tipo, base64: e.target.result.split(',')[1] });
          if (fotos.length === files.length) {
            data.vigimanes.push({
              dni: formEl[`dni${i}`].value,
              nombre: formEl[`nombre${i}`].value,
              sucamec: formEl[`sucamec${i}`].value,
              capacitaciones: formEl[`capacitaciones${i}`].value,
              fotocheck: formEl[`fotocheck${i}`].value,
              uniforme: formEl[`uniforme${i}`].value,
              observaciones: formEl[`observaciones${i}`].value,
              fotos
            });
            if (data.vigimanes.length === data.numeroVigiman) {
              google.script.run.withSuccessHandler(msg => {
                alert(msg);
                formEl.reset();
                document.getElementById('vigimanes').innerHTML = '';
              }).guardarDatos(data);
            }
          }
        };
      })(files[j].name, files[j].type);
      reader.readAsDataURL(files[j]);
    }
    if (files.length === 0) {
      data.vigimanes.push({
        dni: formEl[`dni${i}`].value,
        nombre: formEl[`nombre${i}`].value,
        sucamec: formEl[`sucamec${i}`].value,
        capacitaciones: formEl[`capacitaciones${i}`].value,
        fotocheck: formEl[`fotocheck${i}`].value,
        uniforme: formEl[`uniforme${i}`].value,
        observaciones: formEl[`observaciones${i}`].value,
        fotos: []
      });
    }
  }
}
</script>

