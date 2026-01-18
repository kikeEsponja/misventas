let detalles = document.getElementById('detalles');
let item = document.getElementById('item');

window.addEventListener('pageshow', () => {
    cargarProductos();
});

let productos = [];
let imagen = [];
    
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function cargarProductos(){
    const res = await fetch(`http://localhost:3000/productos-usados/${id}`);
    productos = await res.json();

    mostrarProductos(productos);
    mostrarCarrusel(productos);
}
    
cargarProductos();

function mostrarProductos(prod){
    let html = `
        <div class="boton_mmgv product">
            <h4>${prod.nombre}</h4>
            <div>
                <h6 class="precio_online">PRECIO</h6>
                <h2>${prod.precio}</h2>
            </div>
            <p>Ubicación: ${prod.ubicacion.localidad}</p>
            <p>Calle: ${prod.ubicacion.calle + ' ' + prod.ubicacion.altura}</p>
        </div>
        `;
    detalles.innerHTML = html;
}

function mostrarCarrusel(prod){
    if(!prod.imagen || prod.imagen.length === 0){
        item.innerHTML = `<p>Sin imágenes</p>`;
        return;
    }

    let itemHtml = '';
    prod.imagen.forEach((img, index) =>{
        itemHtml += `
            <div class="carousel-item ${index === 1 ? 'active' : ''}">
                <img src="${img} "class='d-block w-100' alt="${prod.nombre}"}>
            </div>
        `;
    });
    item.innerHTML = itemHtml;
}