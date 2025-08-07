document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value;
  const fotoInput = document.getElementById("foto");
  const estadoEnvio = document.getElementById("estado-envio");

  if (!fotoInput.files.length) {
    estadoEnvio.textContent = "Por favor selecciona una foto.";
    return;
  }

  estadoEnvio.textContent = "Obteniendo ubicación...";

  navigator.geolocation.getCurrentPosition(async (position) => {
    const latitud = position.coords.latitude;
    const longitud = position.coords.longitude;

    const reader = new FileReader();
    reader.onload = async function () {
      const base64Foto = reader.result;

      const formData = new FormData();
      formData.append("estado", estado);
      formData.append("observaciones", observaciones);
      formData.append("latitud", latitud);
      formData.append("longitud", longitud);
      formData.append("foto", base64Foto);

      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbyKCtlrYAPn9n1MSI7i50nMamOXKiz1xlM3qzOkREhTOh4MutPBCa3hmUp_e1coTRx1/exec", {
          method: "POST",
          body: formData,
        });

        const texto = await response.text();
        estadoEnvio.textContent = texto;
        document.getElementById("formulario").reset();
      } catch (error) {
        estadoEnvio.textContent = "Error al enviar: " + error.message;
      }
    };

    reader.readAsDataURL(fotoInput.files[0]);
  }, () => {
    estadoEnvio.textContent = "No se pudo obtener la ubicación.";
  });
});
