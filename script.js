// ---------- CONFIG ----------
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgz6omCPBYU-bB2D5dSS-O3bvumI2CRFDdm5NyNQz_i6N1hN4RqRnixq-XM_y6Ecb8oSIU10xmLgxU/pub?gid=0&single=true&output=csv";
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbztSW8DyGWuxOS0H57NvLgWTqpdcW835Kcm34igzNVot7luH9M7sDA-RYa3nuPI2I1SZQ/exec";

// ---------- UTIL: parse CSV ----------
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
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(cur); cur = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; continue; }
    cur += ch;
    i++;
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

// ---------- Estado local ----------
let baseDatos = [];
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
const btnEnviarEl = document.getElementById('btnEnviar');

// ---------- Inicialización ----------
window.addEventListener('load', async () => {
  const now = new Date();
  fechaInicioEl.value = now.toISOString().slice(0, 10);
  horaInicioEl.value = now.toTimeString().slice(0, 5);

  try {
    const res = await fetch(CSV_URL);
    const txt = await res.text();
    const rows = parseCSV(txt);

    baseDatos = rows.slice(1).map(r => ({
      dni: (r[0] || '').toString().trim(),
      nombre: (r[1] || '').toString().trim(),
      estatus: (r[2] || '').toString().trim(),
      capacitaciones: (r[3] || '').toString().trim(),
      unidad: (r[4] || '').toString().trim()
    }));

    const uSet = new Set();
    baseDatos.forEach(b => { if (b.unidad) uSet.add(b.unidad); });
    unidades = [...uSet].sort();

    unidadEl.innerHTML = '<option value="">--Seleccione Unidad--</option>';
    unidades.forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = u;
      unidadEl.appendChild(o);
    });
  } catch (err) {
    console.error('Error cargando CSV:', err);
    unidadEl.innerHTML = '<option value="">(error cargando unidades)</option>';
  }

  generarSubformularios();
});

// ---------- Generar subformularios ----------
btnGenerarEl.addEventListener('click', generarSubformularios);

function generarSubformularios() {
  const n = Math.max(1, Math.min(20, Number(numVigimanEl.value || 1)));
  vigimanContainerEl.innerHTML = '';

  for (let i = 1; i <= n; i++) {
    const div = document.createElement('div');
    div.className = 'vigiman-block';
    div.innerHTML = `
      <h3>VIGIMAN ${i}</h3>
      <div class="small-row">
        <div>
          <label>DNI</label>
          <input type="text" name="dni_${i}" id="dni_${i}" maxlength="8">
        </div>
        <div style="align-self:end;">
          <button type="button" data-validate="${i}" class="btn-validate">Validar DNI</button>
        </div>
      </div>
      <label>Nombre</label>
      <input type="text" name="nombre_${i}" id="nombre_${i}" readonly>
      <label>Estatus SUCAMEC</label>
      <input type="text" name="estatus_${i}" id="estatus_${i}" readonly>
      <label>N° Capacitaciones</label>
      <input type="text" name="capacitaciones_${i}" id="capacitaciones_${i}" readonly>
      <label>Fotocheck (texto)</label>
      <input type="text" name="fotocheck_text_${i}" id="fotocheck_text_${i}">
      <label>Fotocheck (fotos múltiples)</label>
      <input type="file" name="fotocheck_files_${i}" id="fotocheck_files_${i}" accept="image/*" multiple>
      <label>Uniforme (texto)</label>
      <input type="text" name="uniforme_text_${i}" id="uniforme_text_${i}">
      <label>Uniforme (fotos múltiples)</label>
      <input type="file" name="uniforme_files_${i}" id="uniforme_files_${i}" accept="image/*" multiple>
      <label>Observaciones (texto)</label>
      <textarea name="obs_text_${i}" id="obs_text_${i}"></textarea>
      <label>Observaciones (fotos múltiples)</label>
      <input type="file" name="obs_files_${i}" id="obs_files_${i}" accept="image/*" multiple>
    `;
    vigimanContainerEl.appendChild(div);

    div.querySelector('.btn-validate').addEventListener('click', () => validateDniByIndex(i));
    div.querySelector(`#dni_${i}`).addEventListener('blur', () => {
      const dniVal = div.querySelector(`#dni_${i}`).value.trim();
      const f = baseDatos.find(b => b.dni === dniVal);
      if (!f) {
        div.querySelector(`#nombre_${i}`).readOnly = false;
        div.querySelector(`#estatus_${i}`).readOnly = false;
        div.querySelector(`#capacitaciones_${i}`).readOnly = false;
      }
    });
  }
}

// ---------- Validar DNI ----------
function validateDniByIndex(i) {
  const dniEl = document.getElementById(`dni_${i}`);
  const nombreEl = document.getElementById(`nombre_${i}`);
  const estatusEl = document.getElementById(`estatus_${i}`);
  const capacEl = document.getElementById(`capacitaciones_${i}`);

  if (!dniEl || !nombreEl || !estatusEl || !capacEl) return;

  const dni = (dniEl.value || '').trim();
  if (!dni) {
    alert('Ingrese DNI');
    dniEl.focus();
    return;
  }

  const found = baseDatos.find(b => b.dni === dni);
  if (found) {
    nombreEl.value = found.nombre;
    estatusEl.value = found.estatus;
    capacEl.value = found.capacitaciones;
    nombreEl.readOnly = true;
    estatusEl.readOnly = true;
    capacEl.readOnly = true;
  } else {
    nombreEl.readOnly = false;
    estatusEl.readOnly = false;
    capacEl.readOnly = false;
    if (!confirm('DNI no encontrado en la base. ¿Desea continuar manualmente?')) dniEl.focus();
  }
}


