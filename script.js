document.addEventListener('DOMContentLoaded', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      const coords = position.coords.latitude + ", " + position.coords.longitude;
      document.getElementById('ubicacion').value = coords;
    }, error => {
      document.getElementById('ubicacion').value = 'No se pudo obtener la ubicación';
    });
  } else {
    document.getElementById('ubicacion').value = 'Geolocalización no soportada';
  }
});
