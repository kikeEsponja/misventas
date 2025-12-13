localStorage.getItem('productos', JSON.stringify(productos));

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const producto = productos.find(p => p._id == id);

document.getElementById('disponibles').textContent = producto.cantidad;