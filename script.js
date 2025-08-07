const URL_SCRIPT_WEB_APP = 'https://script.google.com/macros/s/AKfycbyKCtlrYAPn9n1MSI7i50nMamOXKiz1xlM3qzOkREhTOh4MutPBCa3hmUp_e1coTRx1/exec'; // reemplaza esto con tu URL real

document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value;
  const archivo = document.getElementById("foto").files[0];

  if (!archivo) {
    alert("Debe seleccionar una foto.");
    return;
  }

  // Obtener ubicación
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64image = reader.result.split(",")[1]; // quitamos el encabezado data:image/jpeg;base64,...

      const formData = new FormData();
      formData.append("estado", estado);
      formData.append("observaciones", observaciones);
      formData.append("latitud", lat);
      formData.append("longitud", lng);
      formData.append("foto", base64image);
      formData.append("foto.type", archivo.type);

      fetch(URL_SCRIPT_WEB_APP, {
        method: "POST",
        body: formData,
      })
        .then(res => res.text())
        .then(data => alert(data))
        .catch(err => alert("Error al enviar: " + err));
    };

    reader.readAsDataURL(archivo);
  }, () => {
    alert("No se pudo obtener la ubicación.");
  });
});

