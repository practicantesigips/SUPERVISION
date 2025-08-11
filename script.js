const API_URL = "https://script.google.com/macros/s/AKfycbxddxCpR0S6bYrz9szaT6BdqQtg5i_GtBlvJK0h8U_EUpklsmKYkgIxLby4PaHMHMJc/exec";

// Cargar unidades
window.onload = function() {
  const hoy = new Date();
  document.getElementById("fechaInicio").value = hoy.toISOString().split("T")[0];
  document.getElementById("horaInicio").value = hoy.toTimeString().slice(0,5);

  fetch(`${API_URL}?tipo=unidades`)
    .then(res => res.json())
    .then(unidades => {
      const select = document.getElementById("unidad");
      unidades.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u;
        opt.textContent = u;
        select.appendChild(opt);
      });
    });
};

// Validar DNI
document.getElementById("btnValidar").addEventListener("click", () => {
  const dni = document.getElementById("dni").value;
  if (!dni) return alert("Ingrese DNI");

  fetch(`${API_URL}?tipo=dni&valor=${dni}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("DNI no encontrado");
      } else {
        document.getElementById("nombre").value = data.nombre;
        document.getElementById("sucamec").value = data.sucamec;
        document.getElementById("capacitaciones").value = data.capacitaciones;
      }
    });
});

// Ubicación
document.getElementById("btnUbicacion").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById("ubicacion").value =
      `${pos.coords.latitude}, ${pos.coords.longitude}`;
  });
});

// Finalizar Supervisión
document.getElementById("btnFin").addEventListener("click", () => {
  const hora = new Date().toTimeString().slice(0,5);
  alert(`Hora de fin registrada: ${hora}`);
  document.getElementById("btnFin").dataset.horaFin = hora;
});

// Enviar formulario
document.getElementById("formVigiman").addEventListener("submit", e => {
  e.preventDefault();

  const fotosInput = document.getElementById("fotos").files;
  const fotosBase64 = [];

  if (fotosInput.length > 0) {
    for (let file of fotosInput) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        fotosBase64.push(evt.target.result);
        if (fotosBase64.length === fotosInput.length) {
          enviarDatos(fotosBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  } else {
    enviarDatos([]);
  }
});

function enviarDatos(fotos) {
  const data = {
    unidad: document.getElementById("unidad").value,
    fechaInicio: document.getElementById("fechaInicio").value,
    horaInicio: document.getElementById("horaInicio").value,
    dni: document.getElementById("dni").value,
    nombre: document.getElementById("nombre").value,
    sucamec: document.getElementById("sucamec").value,
    capacitaciones: document.getElementById("capacitaciones").value,
    fotocheck: document.getElementById("fotocheck").value,
    uniforme: document.getElementById("uniforme").value,
    observaciones: document.getElementById("observaciones").value,
    fotos: fotos,
    ubicacion: document.getElementById("ubicacion").value,
    horaFin: document.getElementById("btnFin").dataset.horaFin || ""
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(resp => {
    if (resp.status === "success") {
      alert("Supervisión enviada con éxito");
      document.getElementById("formVigiman").reset();
    } else {
      alert("Error al enviar: " + resp.message);
    }
  });
}
