const URL = 'https://script.google.com/macros/s/AKfycbyKCtlrYAPn9n1MSI7i50nMamOXKiz1xlM3qzOkREhTOh4MutPBCa3hmUp_e1coTRx1/exec'; // Cambia esto por tu URL de despliegue del Apps Script

document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const estado = form.estado.value;
  const observaciones = form.observaciones.value;
  const archivo = document.getElementById("foto").files[0];

  if (!archivo) {
    alert("Selecciona una imagen.");
    return;
  }

  // Obtener geolocalización
  navigator.geolocation.getCurrentPosition(async function (position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const reader = new FileReader();
    reader.onloadend = async function () {
      const base64Foto = reader.result.split(',')[1];

      const formData = new FormData();
      formData.append("estado", estado);
      formData.append("observaciones", observaciones);
      formData.append("latitud", lat);
      formData.append("longitud", lng);
      formData.append("foto", base64Foto);
      formData.append("foto_tipo", archivo.type);

      const response = await fetch(URL, {
        method: "POST",
        body: formData
      });

      const result = await response.text();
      alert(result);
    };

    reader.readAsDataURL(archivo);
  }, function (error) {
    alert("No se pudo obtener la ubicación.");
  });
});
