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
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
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
  fechaInicioEl.value = now.toISOString().slice(0,10);
  horaInicioEl.value = now.toTimeString().slice(0,5);

  try {
    const res = await fetch(CSV_URL);
    const txt = await res.text();
    const rows = parseCSV(txt);
    baseDatos = rows.slice(1).map(r => ({
      dni: (r[0]||'').trim(),
      nombre: (r[1]||'').trim(),
      estatus: (r[2]||'').trim(),
      capacitaciones: (r[3]||'').trim(),
      unidad: (r[4]||'').trim()
    }));
    const uSet = new Set();
    baseDatos.forEach(b => { if(b.unidad) uSet.add(b.unidad); });
    unidades = [...uSet].sort();
    unidadEl.innerHTML = '<option value="">--Seleccione Unidad--</option>';
    unidades.forEach(u => {
      const o = document.createElement('option'); o.value=u; o.textContent=u;
      unidadEl.appendChild(o);
    });
  } catch(err){
    console.error('Error cargando CSV:',err);
    unidadEl.innerHTML = '<option value="">(error cargando unidades)</option>';
  }

  generarSubformularios();
});

// ---------- Generar subformularios ----------
btnGenerarEl.addEventListener('click', generarSubformularios);
function generarSubformularios(){
  const n = Math.max(1, Math.min(20, Number(numVigimanEl.value || 1)));
  vigimanContainerEl.innerHTML = '';

  for(let i=1;i<=n;i++){
    const div = document.createElement('div');
    div.className='vigiman-block';
    div.innerHTML=`
      <h3>VIGIMAN ${i}</h3>
      <label>DNI</label><input type="text" name="dni_${i}" id="dni_${i}" maxlength="8">
      <label>Nombre</label><input type="text" name="nombre_${i}" id="nombre_${i}" readonly>
      <label>Estatus SUCAMEC</label><input type="text" name="estatus_${i}" id="estatus_${i}" readonly>
      <label>N° Capacitaciones</label><input type="text" name="capacitaciones_${i}" id="capacitaciones_${i}" readonly>
      <label>Fotocheck (texto)</label><input type="text" name="fotocheckText_${i}" id="fotocheckText_${i}">
      <label>Fotocheck (fotos múltiples)</label><input type="file" name="fotocheckFiles_${i}" id="fotocheckFiles_${i}" accept="image/*" multiple>
      <label>Uniforme (texto)</label><input type="text" name="uniformeText_${i}" id="uniformeText_${i}">
      <label>Uniforme (fotos múltiples)</label><input type="file" name="uniformeFiles_${i}" id="uniformeFiles_${i}" accept="image/*" multiple>
      <label>Observaciones (texto)</label><textarea name="obsText_${i}" id="obsText_${i}"></textarea>
      <label>Observaciones (fotos múltiples)</label><input type="file" name="obsFiles_${i}" id="obsFiles_${i}" accept="image/*" multiple>
    `;
    vigimanContainerEl.appendChild(div);
  }
}

// ---------- Ubicación ----------
btnUbicacionEl.addEventListener('click',()=>{
  if(!navigator.geolocation) return alert('Geolocalización no soportada');
  btnUbicacionEl.disabled=true;
  statusEl.textContent='Obteniendo ubicación…';
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude.toFixed(6);
    const lon=pos.coords.longitude.toFixed(6);
    const url=`https://maps.google.com/?q=${lat},${lon}`;
    ubicacionLinkEl.value=url;
    ubicacionLinkEl.dataset.lat=lat;
    ubicacionLinkEl.dataset.lon=lon;
    statusEl.textContent='Ubicación cargada';
    btnUbicacionEl.disabled=false;
  },err=>{
    alert('No se pudo obtener ubicación: '+(err.message||err.code));
    statusEl.textContent='';
    btnUbicacionEl.disabled=false;
  },{enableHighAccuracy:true,timeout:10000});
});

// ---------- Hora fin ----------
btnHoraFinEl.addEventListener('click',()=>{ horaFinEl.value=new Date().toTimeString().slice(0,5); });

// ---------- Form submit ----------
formEl.addEventListener('submit',async(ev)=>{
  ev.preventDefault();
  btnEnviarEl.disabled=true;
  statusEl.textContent='Preparando datos...';

  try{
    const fd=new FormData();
    fd.append('fecha',fechaInicioEl.value);
    fd.append('horaInicio',horaInicioEl.value);
    fd.append('horaFin',horaFinEl.value);
    fd.append('unidad',unidadEl.value);
    fd.append('ubicacionUrl',ubicacionLinkEl.value);
    fd.append('lat',ubicacionLinkEl.dataset.lat || '');
    fd.append('lon',ubicacionLinkEl.dataset.lon || '');
    fd.append('nombreSupervisor',nombreSupervisorEl.value);
    fd.append('dniSupervisor',dniSupervisorEl.value);

    Array.from(fotosSupervisionEl.files).forEach((f,i)=>fd.append(`supervisionPhotos_${i}`,f));

    const n=Math.max(0,Math.min(20,Number(numVigimanEl.value||0)));
    fd.append('vigimansCount', n);
    for(let i=1;i<=n;i++){
      fd.append(`dni_${i}`,document.getElementById(`dni_${i}`).value);
      fd.append(`nombre_${i}`,document.getElementById(`nombre_${i}`).value);
      fd.append(`estatus_${i}`,document.getElementById(`estatus_${i}`).value);
      fd.append(`capacitaciones_${i}`,document.getElementById(`capacitaciones_${i}`).value);
      fd.append(`fotocheckText_${i}`,document.getElementById(`fotocheckText_${i}`).value);
      Array.from(document.getElementById(`fotocheckFiles_${i}`).files)
           .forEach((f,j)=>fd.append(`fotocheckFiles_${i}_${j}`,f));
      fd.append(`uniformeText_${i}`,document.getElementById(`uniformeText_${i}`).value);
      Array.from(document.getElementById(`uniformeFiles_${i}`).files)
           .forEach((f,j)=>fd.append(`uniformeFiles_${i}_${j}`,f));
      fd.append(`obsText_${i}`,document.getElementById(`obsText_${i}`).value);
      Array.from(document.getElementById(`obsFiles_${i}`).files)
           .forEach((f,j)=>fd.append(`obsFiles_${i}_${j}`,f));
    }

    statusEl.textContent='Enviando al servidor...';
    const resp=await fetch(WEBAPP_URL,{method:'POST',body:fd});
    const json=await resp.json();
    if(json.status==='OK'){
      alert('Supervisión enviada con éxito');
      formEl.reset();
      vigimanContainerEl.innerHTML='';
      generarSubformularios();
      statusEl.textContent='Enviado correctamente';
    } else {
      alert('Error en servidor: '+(json.message||'ver consola'));
      statusEl.textContent='Error';
      console.error(json);
    }

  } catch(err){
    alert('Error enviando formulario: '+err.message);
    console.error(err);
    statusEl.textContent='Error';
  }

  btnEnviarEl.disabled=false;
});
