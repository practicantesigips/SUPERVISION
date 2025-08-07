document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const estado = document.getElementById("estado").value;
  const observaciones = document.getElementById("observaciones").value;
  const foto = document.getElementById("foto").files[0];
  const estadoEnvio = document.getElementById("estado-envio");

  if (!estado || !observaciones || !foto) {
    estadoEnvio.textContent = "Todos los campos son obligatorios.";
    estadoEnvio.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append("estado", estado);
  formData.append("observaciones", observaciones);
  formData.append("foto", foto);

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbybtuEpn09hNubFoW3J9RLTXVxNplQPZnJid9G0QHsDJbpG89JbUXZisPUWbTsq6HHH/exec", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      estadoEnvio.textContent = "Formulario enviado con éxito.";
      estadoEnvio.style.color = "green";
      document.getElementById("formulario").reset();
    } else {
      estadoEnvio.textContent = "Error al enviar el formulario.";
      estadoEnvio.style.color = "red";
    }
  } catch (error) {
    estadoEnvio.textContent = "Error de conexión.";
    estadoEnvio.style.color = "red";
  }
});
