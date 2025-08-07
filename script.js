document.getElementById("formulario").addEventListener("submit", async function(e) {
  e.preventDefault();
  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value;
  const fotoInput = document.getElementById("foto");

  if (fotoInput.files.length === 0) {
    alert("Debes subir una foto");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function() {
    const base64Foto = reader.result.split(",")[1]; // Quitamos "data:image/jpeg;base64,"

    const formData = new FormData();
    formData.append("estado", estado);
    formData.append("observaciones", observaciones);
    formData.append("foto", base64Foto);

    const estadoEnvio = document.getElementById("estado-envio");
    estadoEnvio.textContent = "Enviando...";

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbzkMAkT2559rdobxVAwFad5sdTOr_Hzrw777xxJkOR_Dh-fwSvO8GMe4sZ23ueTtWzA/exec", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.status === "success") {
        estadoEnvio.textContent = "¡Enviado correctamente!";
      } else {
        estadoEnvio.textContent = "Error al enviar: " + data.message;
      }
    } catch (error) {
      estadoEnvio.textContent = "Error de conexión: " + error.message;
    }
  };

  reader.readAsDataURL(fotoInput.files[0]);
});
