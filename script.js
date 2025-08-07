document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklistForm');
  const mensaje = document.getElementById('mensaje');

  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('latitud').value = pos.coords.latitude;
    document.getElementById('longitud').value = pos.coords.longitude;
  }, () => {
    mensaje.textContent = "Ubicación no disponible.";
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.textContent = "Enviando...";

    const formData = new FormData(form);
    const response = await fetch('https://script.google.com/macros/s/AKfycbyKCtlrYAPn9n1MSI7i50nMamOXKiz1xlM3qzOkREhTOh4MutPBCa3hmUp_e1coTRx1/exec', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    mensaje.textContent = result;
    form.reset();
  });
});
