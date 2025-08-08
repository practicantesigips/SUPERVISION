// ===== CONFIG =====
const API_URL = "https://script.google.com/macros/s/AKfycbzpHL0os5Chbfmbr0JXFM9n2LDuTmxN7AmDivX-LY0XCRO18bcuaIf6upbCYtsYQIZT/exec"; // <-- PON AQUÍ la URL de tu Web App desplegada
// ==================

/* Helper */
const $ = id => document.getElementById(id);
const msg = txt => { const p = $('mensaje'); p.innerText = txt; setTimeout(()=>p.innerText='',6000); };

// Cargar fecha y hora al abrir
window.addEventListener('load', () => {
  const now = new Date();
  $('fechaInicio').value = now.toISOString().split('T')[0];
  $('horaInicio').value = now.toTimeString().slice(0,5);
  cargarUnidades();
});

// Cargar unidades (desde Apps Script -> getUnidades)
async function cargarUnidades(){
  try{
    const res = await fetch(`${API_URL}?action=getUnidades`);
    const unidades = await res.json();
    const sel = $('unidad');
    sel.innerHTML = `<option value="">-- Seleccione unidad --</option>`;
    unidades.forEach(u=>{
      const opt = document.createElement('option');
      opt.value = u; opt.textContent = u;
      sel.appendChild(opt);
    });
  }catch(err){
    console.error(err); msg('Error cargando unidades');
  }
}

/* Generar subformularios */
$('btnGenerar').addEventListener('click', generarSubformularios);
function generarSubformularios(){
  const n = parseInt($('cantidad').value);
  if(!n || n < 1 || n > 15){ alert('Ingrese cantidad entre 1 y 15'); return; }
  const cont = $('subformularios');
  cont.innerHTML = '';
  for(let i=1;i<=n;i++){
    const card = document.createElement('div');
    card.className = 'vigiman-card';
    card.innerHTML = `
      <h3>VIGIMAN ${i}</h3>

      <div class="form-group">
        <label>DNI</label>
        <div style="display:flex;gap:8px">
          <input type="text" name="dni${i}" id="dni${i}" maxlength="8" required style="flex:1" />
          <button type="button" class="small-btn" onclick="validarDNI(${i})">Validar DNI</button>
        </div>
      </div>

      <div class="form-group">
        <label>Apellidos y Nombres</label>
        <input type="text" name="nombre${i}" id="nombre${i}" readonly />
      </div>

      <div class="form-group">
        <label>Estatus SUCAMEC</label>
        <input type="text" name="estatus${i}" id="estatus${i}" readonly />
        <label style="margin-top:6px">Fotos Estatus (varias)</label>
        <input type="file" name="fotosEstatus${i}" accept="image/*" multiple />
      </div>

      <div class="form-group">
        <label>N° de Capacitaciones</label>
        <input type="text" name="capacitaciones${i}" id="capacitaciones${i}" readonly />
      </div>

      <div class="form-group">
        <label>Fotocheck (texto)</label>
        <input type="text" name="fotocheckText${i}" />
        <label style="margin-top:6px">Fotos Fotocheck (varias)</label>
        <input type="file" name="fotosFotocheck${i}" accept="image/*" multiple />
      </div>

      <div class="form-group">
        <label>Uniforme (texto)</label>
        <input type="text" name="uniformeText${i}" />
        <label style="margin-top:6px">Fotos Uniforme (varias)</label>
        <input type="file" name="fotosUniforme${i}" accept="image/*" multiple />
      </div>

      <div class="form-group">
        <label>Observaciones</label>
        <textarea name="observaciones${i}"></textarea>
        <label style="margin-top:6px">Fotos Observaciones (varias)</label>
        <input type="file" name="fotosObservaciones${i}" accept="image/*" multiple />
      </div>

      <div class="form-group">
        <label>Ubicación (no editable)</label>
        <input type="text" name="ubicacion${i}" id="ubicacion${i}" readonly />
        <button type="button" class="small-btn" style="margin-top:8px" onclick="capturarUbicacion(${i})">Cargar Ubicación</button>
      </div>
    `;
    cont.appendChild(card);
  }
}

/* Validar DNI: llama a Apps Script (doGet action=validarDNI) */
async function validarDNI(i){
  const val = $(`dni${i}`).value.trim();
  if(!val){ alert('Ingrese DNI'); return; }
  try{
    const res = await fetch(`${API_URL}?action=validarDNI&dni=${encodeURIComponent(val)}`);
    const data = await res.json();
    if(data && Object.keys(data).length){
      $(`nombre${i}`).value = data.nombre || '';
      $(`estatus${i}`).value = data.estatus || '';
      $(`capacitaciones${i}`).value = data.capacitaciones || '';
    } else {
      alert('DNI no encontrado en BASE DE DATOS');
    }
  }catch(err){
    console.error(err); alert('Error validando DNI');
  }
}

/* Capturar ubicación por vigiman */
function capturarUbicacion(i){
  if(!navigator.geolocation){ alert('Geolocalización no soportada'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    $(`ubicacion${i}`).value = `${pos.coords.latitude},${pos.coords.longitude}`;
  }, err => {
    console.error(err); alert('Error obteniendo ubicación');
  }, {enableHighAccuracy:true});
}

/* Botón Finalizar: carga hora fin */
$('btnFinalizar').addEventListener('click', ()=> {
  const now = new Date();
  $('horaFin').value = now.toTimeString().slice(0,5);
});

/* Envío del formulario: empaqueta FormData (incluye archivos) y POST al Apps Script */
$('supervisionForm').addEventListener('submit', async function(e){
  e.preventDefault();
  // Validación mínima
  if(!$('unidad').value){ alert('Seleccione una unidad'); return; }
  const cantidad = parseInt($('cantidad').value || 0);
  if(!cantidad || cantidad < 1){ alert('Genere VIGIMAN'); return; }

  const fd = new FormData(this);

  // añadir cantidad explícitamente (por si no está)
  fd.set('cantidad', String(cantidad));

  msg('Enviando supervisión... (esto puede tardar si hay muchas fotos)');
  try{
    const res = await fetch(API_URL, { method: 'POST', body: fd });
    const json = await res.json();
    if(json && json.success){
      msg('Supervisión registrada correctamente');
      this.reset();
      $('subformularios').innerHTML = '';
    } else {
      console.error(json);
      msg('Error: no se pudo registrar (ver consola)');
    }
  }catch(err){
    console.error(err);
    msg('Error en envío (ver consola)');
  }
});
