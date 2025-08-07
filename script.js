const form = document.getElementById('formulario');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  mensaje.textContent = "Enviando...";

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyKCtlrYAPn9n1MSI7i50nMamOXKiz1xlM3qzOkREhTOh4MutPBCa3hmUp_e1coTRx1/exec', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    mensaje.textContent = result;
    form.reset();
  } catch (error) {
    mensaje.textContent = "Error al enviar: " + error;
  }
});

function obtenerUbicacion() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    document.getElementById("ubicacion").value = `Lat: ${lat}, Lng: ${lng}`;
    const hiddenLat = document.createElement("input");
    hiddenLat.name = "latitud";
    hiddenLat.type = "hidden";
    hiddenLat.value = lat;

    const hiddenLng = document.createElement("input");
    hiddenLng.name = "longitud";
    hiddenLng.type = "hidden";
    hiddenLng.value = lng;

    form.appendChild(hiddenLat);
    form.appendChild(hiddenLng);
  });
}
