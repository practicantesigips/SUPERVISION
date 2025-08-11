// ---------- CONFIG ----------
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMnyquRcVFWwJgETIp4kOW3F4U0o1aDCS4KK76jYSdoLMdzbAu-VmZRilwUneR4Xjh4GLqLPh5ALfO/pub?output=csv";
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwi9xk6xGXwPtsQpu8nY90iwliBqf4ZLamU0jXohD24mZ04P3uBzrJBWkDNAr-iC6nH/exec"; // <--- cambia esto

// ---------- UTIL: parse CSV robusto (maneja comillas) ----------
function parseCSV(text) {
  const rows = [];
  let cur = '';
  let row = [];
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i+1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(cur); cur = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; continue; }
    cur += ch; i++;
  }
  // last
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// ---------- Estado local ----------
let baseDatos = []; // array de objetos {dni,nombre,estatus,capacitaciones,unidad}
let unidades = [];

// ---------- DOM elements ----------
const fechaInicioEl = document.getElementById('fechaInicio');
const horaInicioEl = document.getElementById('horaInicio');
const nombreSupervisorEl = document.getElementById('nombreSupervisor');
const dniSupervisorEl = document.getElementById('dniSupervisor');
const unidadEl = document.getElementById('unidad');
const numVigimanEl = document.getElementById('numVigiman');
const btnGenerarEl = document.getElementById('btnGenerar');
const vigimanContainerEl = document.getElementById('vigimanContainer');
const btnUbicacionEl = document.getElementById('btnUbicacion');
const ubicacionLinkEl = document.getElementById('ubicacionLink');
const fotosSupervisionEl = document.getElementById('fotosSupervision');
const horaFinEl = document.getElementById('horaFin');
const btnHoraFinEl = document.getElementById('btnHoraFin');
const formEl = document.getElementById('form');
const statusEl = document.getElementById('status');

// ---------- Inicialización ----------
window.addEventListener('load', async () => {
  // fecha y hora inicio automáticas
  const now = new Date();
  fechaInicioEl.value = now.toISOString().slice(0,10);
  horaInicioEl.value = now.toTimeString().slice(0,5);

  // cargar CSV base de datos (trae A:D y E)
  try {
    const res = await fetch(CSV_URL);
    const txt = await res.text();
    const rows = parseCSV(txt);
    // asumimos encabezado en fila 0; filas desde 1
    baseDatos = rows.slice(1).map(r => ({
      dni: (r[0]||'').toString().trim(),
      nombre: (r[1]||'').toString().trim(),
      estatus: (r[2]||'').toString().trim(),
      capacitaciones: (r[3]||'').toString().trim(),
      unidad: (r[4]||'').toString().trim()
    }));
    // unidades únicas desde columna E
    const uSet = new Set();
    baseDatos.forEach(b => { if (b.unidad) uSet.add(b.unidad); });
    unidades = [...uSet].sort();
    unidadEl.innerHTML = '<option value="">--Seleccione Unidad--</option>';
    unidades.forEach(u => {
      const o = document.createElement('option'); o.value = u; o.textContent = u;
      unidadEl.appendChild(o);
    });
  } catch (err) {
    console.error('Error cargando CSV:', err);
    unidadEl.innerHTML = '<option value="">(error cargando unidades)</option>';
  }

  // generar por defecto
  generarSubformularios();
});

// ---------- Generar subformularios ----------
btnGenerarEl.addEventListener('click', generarSubformularios);
function generarSubformularios() {
  const n = Math.max(1, Math.min(20, Number(numVigimanEl.value || 1)));
  vigimanContainerEl.innerHTML = '';
  for (let i=1;i<=n;i++){
    const div = document.createElement('div');
    div.className = 'vigiman-block';
    div.innerHTML = `
      <h3>VIGIMAN ${i}</h3>
      <div class="small-row">
        <div><label>DNI</label><input type="text" name="dni_${i}" id="dni_${i}" maxlength="8"></div>
        <div style="align-self:end;"><button type="button" data-validate="${i}" class="btn-validate">Validar DNI</button></div>
      </div>

      <label>Nombre</label><input type="text" name="nombre_${i}" id="nombre_${i}" readonly>
      <label>Estatus SUCAMEC</label><input type="text" name="estatus_${i}" id="estatus_${i}" readonly>
      <label>N° Capacitaciones</label><input type="text" name="capacitaciones_${i}" id="capacitaciones_${i}" readonly>

      <label>Fotocheck (texto)</label><input type="text" name="fotocheck_text_${i}" id="fotocheck_text_${i}">

      <label>Fotocheck (fotos múltiples)</label><input type="file" name="fotocheck_files_${i}" id="fotocheck_files_${i}" accept="image/*" multiple>

      <label>Uniforme (texto)</label><input type="text" name="uniforme_text_${i}" id="uniforme_text_${i}">

      <label>Uniforme (fotos múltiples)</label><input type="file" name="uniforme_files_${i}" id="uniforme_files_${i}" accept="image/*" multiple>

      <label>Observaciones (texto)</label><textarea name="obs_text_${i}" id="obs_text_${i}"></textarea>

      <label>Observaciones (fotos múltiples)</label><input type="file" name="obs_files_${i}" id="obs_files_${i}" accept="image/*" multiple>
    `;
    vigimanContainerEl.appendChild(div);
  }

  // attach event listeners for validate buttons
  document.querySelectorAll('.btn-validate').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.getAttribute('data-validate');
      validateDniByIndex(idx);
    });
  });

  // also allow blur validation
  for (let i=1;i<=n;i++){
    const el = document.getElementById(`dni_${i}`);
    if (el) el.addEventListener('blur', ()=>validateDniByIndex(i));
  }
}

// ---------- Validar DNI (usa baseDatos cargado) ----------
function validateDniByIndex(i){
  const dniEl = document.getElementById(`dni_${i}`);
  if (!dniEl) return;
  const dni = (dniEl.value||'').trim();
  if (!dni) { alert('Ingrese DNI'); return; }
  const found = baseDatos.find(b => b.dni === dni);
  if (found) {
    document.getElementById(`nombre_${i}`).value = found.nombre;
    document.getElementById(`estatus_${i}`).value = found.estatus;
    document.getElementById(`capacitaciones_${i}`).value = found.capacitaciones;
  } else {
    // no encontrado: dejar escribir manualmente (según tu requerimiento)
    // opcional: confirmar si quiere agregar manualmente
    if (!confirm('DNI no encontrado en la base. ¿Desea continuar y escribir datos manualmente?')) {
      dniEl.focus();
    } else {
      // permitir edición manual: habilitar campos
      document.getElementById(`nombre_${i}`).readOnly = false;
      document.getElementById(`estatus_${i}`).readOnly = false;
      document.getElementById(`capacitaciones_${i}`).readOnly = false;
    }
  }
}

// ---------- Ubicación ----------
btnUbicacionEl.addEventListener('click', ()=> {
  if (!navigator.geolocation) return alert('Geolocalización no soportada');
  btnUbicacionEl.disabled = true;
  statusEl.textContent = 'Obteniendo ubicación…';
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const url = `https://maps.google.com/?q=${lat},${lon}`;
    ubicacionLinkEl.value = url;
    // store lat/lon in hidden inputs (not shown, but will be sent)
    ubicacionLinkEl.dataset.lat = lat;
    ubicacionLinkEl.dataset.lon = lon;
    statusEl.textContent = 'Ubicación cargada';
    btnUbicacionEl.disabled = false;
  }, err=>{
    alert('No se pudo obtener ubicación: ' + (err.message||err.code));
    statusEl.textContent = '';
    btnUbicacionEl.disabled = false;
  }, { enableHighAccuracy:true, timeout:10000 });
});

// ---------- Hora fin ----------
btnHoraFinEl.addEventListener('click', ()=> {
  horaFinEl.value = new Date().toTimeString().slice(0,5);
});

// ---------- Helper: file -> base64 ----------
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// ---------- Recolectar y enviar (convertir archivos a base64) ----------
formEl.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  btnEnviar = document.getElementById('btnEnviar');
  btnEnviar.disabled = true;
  statusEl.textContent = 'Preparando datos...';

  try {
    const payload = {
      fecha: fechaInicioEl.value,
      horaInicio: horaInicioEl.value,
      horaFin: horaFinEl.value || '',
      unidad: unidadEl.value || '',
      ubicacionUrl: ubicacionLinkEl.value || '',
      lat: ubicacionLinkEl.dataset.lat || '',
      lon: ubicacionLinkEl.dataset.lon || '',
      nombreSupervisor: nombreSupervisorEl.value || '',
      dniSupervisor: dniSupervisorEl.value || '',
      vigimans: [],
      supervisionPhotos: []
    };

    // supervision photos
    const supFiles = Array.from(fotosSupervisionEl.files || []);
    for (const f of supFiles) {
      payload.supervisionPhotos.push(await fileToBase64(f));
    }

    const n = Math.max(0, Math.min(20, Number(numVigimanEl.value || 0)));
    for (let i=1;i<=n;i++){
      const v = {
        index:i,
        dni: (document.getElementById(`dni_${i}`)?.value || '').trim(),
        nombre: (document.getElementById(`nombre_${i}`)?.value || '').trim(),
        estatus: (document.getElementById(`estatus_${i}`)?.value || '').trim(),
        capacitaciones: (document.getElementById(`capacitaciones_${i}`)?.value || '').trim(),
        fotocheckText: (document.getElementById(`fotocheck_text_${i}`)?.value || '').trim(),
        fotocheckFiles: [],
        uniformeText: (document.getElementById(`uniforme_text_${i}`)?.value || '').trim(),
        uniformeFiles: [],
        obsText: (document.getElementById(`obs_text_${i}`)?.value || '').trim(),
        obsFiles: []
      };

      // files arrays
      const fcFiles = Array.from(document.getElementById(`fotocheck_files_${i}`)?.files || []);
      for (const f of fcFiles) v.fotocheckFiles.push(await fileToBase64(f));

      const uFiles = Array.from(document.getElementById(`uniforme_files_${i}`)?.files || []);
      for (const f of uFiles) v.uniformeFiles.push(await fileToBase64(f));

      const oFiles = Array.from(document.getElementById(`obs_files_${i}`)?.files || []);
      for (const f of oFiles) v.obsFiles.push(await fileToBase64(f));

      payload.vigimans.push(v);
    }

    statusEl.textContent = 'Enviando al servidor... (esto puede tardar si hay muchas fotos)';
    // POST JSON
    const resp = await fetch(WEBAPP_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await resp.json();
    if (json && json.status === 'OK') {
      statusEl.textContent = 'Enviado correctamente';
      alert('Supervisión enviada con éxito');
      formEl.reset();
      vigimanContainerEl.innerHTML = '';
      generarSubformularios();
    } else {
      console.error(json);
      alert('Error en servidor: ' + (json && json.message ? json.message : 'ver consola'));
      statusEl.textContent = 'Error';
    }

  } catch (err) {
    console.error(err);
    alert('Error preparando o enviando: ' + err.message);
    statusEl.textContent = 'Error';
  }

  btnEnviar.disabled = false;
});








