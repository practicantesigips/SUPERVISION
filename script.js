document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value;
  const fotoInput = document.getElementById("foto");

  const estadoEnvio = document.getElementById("estado-envio");
  estadoEnvio.textContent = "Enviando...";

  const formData = new FormData();
  formData.append("estado", estado);
  formData.append("observaciones", observaciones);
  formData.append("foto", fotoInput.files[0]);

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzFSJwiEk1qY5qD6f5qqmtyAHyIG3G2HDZCwLP-Gn0_zOZl5n28dnuqL9X5aJMHxBw-/exec", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      estadoEnvio.textContent = "Formulario enviado con éxito.";
    } else {
      estadoEnvio.textContent = "Error al enviar: " + result.message;
    }
  } catch (error) {
    estadoEnvio.textContent = "Error de red o servidor: " + error;
  }
});

