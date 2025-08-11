<script>
/* Client-side script for the form — uses google.script.run to call server functions */
(() => {
  const SHEET_ID = "1MCTo_ylB754NABKRYES-Q3D8PxEG1-B-Tp5eQ2dwLyk"; // not used client-side, just for reference

  // DOM refs
  const unidadEl = document.getElementById('unidad');
  const fechaInicioEl = document.getElementById('fechaInicio');
  const horaInicioEl = document.getElementById('horaInicio');
  const numVigimanEl = document.getElementById('numVigiman');
  const generarBtn = document.getElementById('generarBtn');
  const vigimanContainer = document.getElementById('vigimanContainer');
  const ubicacionBtn = document.getElementById('ubicacionBtn');
  const ubicacionEl = document.getElementById('ubicacion');
  const finalizarBtn = document.getElementById('finalizarBtn');
  const horaFinEl = document.getElementById('horaFin');
  const mainForm = document.getElementById('mainForm');
  const msgEl = document.getElementById('msg');
  const fotosSupervisionEl = document.getElementById('fotosSupervision');

  // on load: set date/time and load unidades
  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    fechaInicioEl.value = now.toISOString().split('T')[0];
    horaInicioEl.value = now.toTimeString().split(':').slice(0,2).join(':');

    // load unidades via server
    google.script.run.withSuccessHandler(populateUnidades).getUnidades();
  });

  function populateUnidades(list) {
    unidadEl.innerHTML = '<option value="">--Selecciona--</option>';
    if (!Array.isArray(list)) return;
    list.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      unidadEl.appendChild(opt);
    });
  }

  // Generate subform cards
  generarBtn.addEventListener('click', () => {
    const n = parseInt(numVigimanEl.value) || 0;
    if (n < 1 || n > 20) { alert('Cantidad válida 1 - 20'); return; }
    vigimanContainer.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      vigimanContainer.appendChild(createVigimanCard(i));
    }
  });

  function createVigimanCard(i) {
    const div = document.createElement('div');
    div.className = 'vigiman-card';
    div.dataset.index = i;

    div.innerHTML = `
      <div class="vigiman-row">
        <label style="flex:1">DNI</label>
        <input type="text" name="dni${i}" class="dni-field small" placeholder="DNI" required>
        <button type="button" class="validateBtn small">VALIDAR DNI</button>
      </div>

      <label>Apellidos y Nombres</label>
      <input type="text" name="nombre${i}" readonly>

      <div class="vigiman-row">
        <div style="flex:1">
          <label>Estatus SUCAMEC</label>
          <input type="text" name="estatus${i}" readonly>
          <label style="margin-top:8px">Fotos ESTATUS (múltiples)</label>
          <input type="file" name="fotosEstatus${i}" accept="image/*" multiple capture="environment">
        </div>
        <div style="flex:1">
          <label>Capacitaciones</label>
          <input type="text" name="capacitaciones${i}" readonly>
          <label style="margin-top:8px">Fotocheck (múltiples)</label>
          <input type="file" name="fotosFotocheck${i}" accept="image/*" multiple capture="environment">
        </div>
      </div>

      <label>Uniforme (texto)</label>
      <input type="text" name="uniforme${i}">

      <label>Fotos adicionales (múltiples)</label>
      <input type="file" name="fotos${i}" accept="image/*" multiple capture="environment">

      <label>Observaciones</label>
      <textarea name="observaciones${i}" rows="2"></textarea>

      <div class="row" style="margin-top:8px">
        <input type="text" name="ubicacion${i}" placeholder="Lat,Lng" readonly>
        <button type="button" class="ubic-btn small">Cargar Ubicación</button>
      </div>
    `;

    // attach handlers for validate and ubic buttons
    const validateBtn = div.querySelector('.validateBtn');
    const dniField = div.querySelector('.dni-field');
    validateBtn.addEventListener('click', () => {
      const dni = dniField.value.trim();
      if (!dni) { alert('Escribe DNI'); return; }
      validateBtn.disabled = true;
      google.script.run.withSuccessHandler(result => {
        validateBtn.disabled = false;
        if (result) {
          div.querySelector(`[name=nombre${i}]`).value = result.nombre || '';
          div.querySelector(`[name=estatus${i}]`).value = result.estatus || '';
          div.querySelector(`[name=capacitaciones${i}]`).value = result.capacitaciones || '';
        } else {
          alert('DNI no encontrado');
        }
      }).buscarDNI(dni);
    });

    const ubBtn = div.querySelector('.ubic-btn');
    ubBtn.addEventListener('click', () => {
      if (!navigator.geolocation) { alert('GPS no soportado'); return; }
      ubBtn.disabled = true;
      navigator.geolocation.getCurrentPosition(pos => {
        div.querySelector(`[name=ubicacion${i}]`).value = `${pos.coords.latitude},${pos.coords.longitude}`;
        ubBtn.disabled = false;
      }, err => { alert('No se pudo obtener ubicación'); ubBtn.disabled = false; });
    });

    return div;
  }

  // Cargar ubicación general (antes de enviar)
  ubicacionBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { alert('GPS no soportado'); return; }
    ubicacionBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
      ubicacionEl.value = `${pos.coords.latitude},${pos.coords.longitude}`;
      ubicacionBtn.disabled = false;
    }, err => { alert('No se pudo obtener ubicación'); ubicacionBtn.disabled = false; });
  });

  // Finalizar hora fin
  finalizarBtn.addEventListener('click', () => {
    const now = new Date();
    horaFinEl.value = now.toTimeString().split(':').slice(0,2).join(':');
  });

  // Submit: collect all fields and read files as base64, then send via google.script.run
  mainForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    msgEl.textContent = 'Preparando datos...';

    // Basic fields
    const payload = {
      unidad: unidadEl.value || '',
      fechaInicio: fechaInicioEl.value || '',
      horaInicio: horaInicioEl.value || '',
      supervisorNombre: document.getElementById('supervisorNombre').value || '',
      supervisorDni: document.getElementById('supervisorDni').value || '',
      ubicacion: ubicacionEl.value || '',
      horaFin: horaFinEl.value || '',
      fotosSupervision: [],
      vigimanes: []
    };

    // read fotosSupervision
    const supFiles = Array.from(fotosSupervisionEl.files || []);
    for (let f of supFiles) {
      try {
        const b64 = await toBase64(f);
        payload.fotosSupervision.push({ name: f.name, type: f.type, base64: b64 });
      } catch(e){ console.warn('file read err', e); }
    }

    // iterate vigiman cards
    const cards = Array.from(vigimanContainer.querySelectorAll('.vigiman-card'));
    for (let c of cards) {
      const idx = c.dataset.index;
      const v = {
        dni: (c.querySelector(`[name=dni${idx}]`)?.value || '').trim(),
        nombre: c.querySelector(`[name=nombre${idx}]`)?.value || '',
        estatus: c.querySelector(`[name=estatus${idx}]`)?.value || '',
        capacitaciones: c.querySelector(`[name=capacitaciones${idx}]`)?.value || '',
        uniforme: c.querySelector(`[name=uniforme${idx}]`)?.value || '',
        observations: c.querySelector(`[name=observaciones${idx}]`)?.value || '',
        ubicacion: c.querySelector(`[name=ubicacion${idx}]`)?.value || '',
        photos: []
      };

      // collect multiple file inputs for this vigiman:
      const fileInputs = [
        `fotosEstatus${idx}`,
        `fotosFotocheck${idx}`,
        `fotos${idx}`,
        `foto${idx}` // if any
      ];

      for (let name of fileInputs) {
        const input = c.querySelector(`[name=${name}]`);
        if (!input) continue;
        const fs = Array.from(input.files || []);
        for (let f of fs) {
          try {
            const b64 = await toBase64(f);
            v.photos.push({ field: name, name: f.name, type: f.type, base64: b64 });
          } catch(e){ console.warn('file read err', e); }
        }
      }

      payload.vigimanes.push(v);
    }

    // send to server
    msgEl.textContent = 'Enviando al servidor... (puede tardar por fotos)';
    google.script.run.withSuccessHandler(res => {
      if (res && res.success) {
        msgEl.textContent = 'Enviado correctamente. ' + (res.message || '');
        mainForm.reset();
        vigimanContainer.innerHTML = '';
      } else {
        msgEl.textContent = 'Error: ' + (res && res.message ? res.message : 'Servidor no devolvió éxito');
      }
    }).guardarDatos(payload);
  });

  // helper: File -> base64 (without prefix)
  function toBase64(file){
    return new Promise((resolve,reject) => {
      const r = new FileReader();
      r.onload = () => {
        const res = r.result.split(',')[1]; resolve(res);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

})();
</script>
