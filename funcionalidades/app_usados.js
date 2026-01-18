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
    //const res = await fetch(`http://localhost:3000/productos-usados/${id}`);
    const res = await fetch(`https://ventas-backend-wj4v.onrender.com/productos-usados/${id}`);
    productos = await res.json();

    mostrarProductos(productos);
    mostrarCarrusel(productos);
}
    
cargarProductos();

function mostrarProductos(prod){
    let html = `
        <div class="boton_mmgv product">
            <h4>${prod.nombre}</h4>
            <h5>Marca:</h5><p> ${prod.marca}</p>
            <div>
                <h6 class="precio_online">PRECIO</h6>
                <h2>${prod.precio}</h2>
            </div>
            <p>Condición: ${prod.condicion}</p>
            <p>Cantidad disponible: ${prod.cantidad}</p>
            <p>Ubicación: ${prod.ubicacion.localidad}</p>
            <p>Calle: ${prod.ubicacion.calle + ' ' + prod.ubicacion.altura}</p>
            <hr>
            <div class="agregar-wsp">
                <!--<button class="add-car btn btn-primary agregar_al_carro_item" data-id="${prod._id}">Agregar al carro</button>-->
                <button class="btn btn-success agregar_al_carro_item" id="ir_carrito">Ir al carrito</button>
                <button class="bi bi-whatsapp" id="contacto"></button>
                <button class="btn btn-warning" id="volver">Volver</button>
            </div>
        </div>
        `;
    detalles.innerHTML = html;

    let nombreProducto = document.getElementById('producto');
    nombreProducto.textContent = prod.nombre;
        
    let irCarrito = document.getElementById('ir_carrito');
    irCarrito.addEventListener('click', () =>{
        window.location.href = '../carrito.html';
    });

    let volver = document.getElementById('volver');
    volver.addEventListener('click', () =>{
        window.history.back();
    });
}

function mostrarCarrusel(prod){
    if(!prod.imagen || prod.imagen.length === 0){
        item.innerHTML = `<p>Sin imágenes</p>`;
        return;
    }

    let itemHtml = '';
    prod.imagen.forEach((img, index) =>{
        itemHtml += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${img}" class="d-block w-100" alt="${prod.nombre}">
            </div>
        `;
    });
    item.innerHTML = itemHtml;
}

localStorage.setItem('productos', JSON.stringify(productos));

// descomentar para activar carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let click = 0;

document.addEventListener('click', e =>{
    if(e.target.classList.contains('add-car')){
        const id = e.target.dataset.id;

        const producto = productos.find(p => p._id === id);

        const existente = carrito.find(p => p._id === id);

        if(existente){
            if(existente.cantidad < producto.cantidad){
                existente.cantidad++;
            }else{
                alert('Sin disponibilidad');
                return;
            }
        }else{
            if(producto.cantidad > 0){
                carrito.push({...producto, cantidad: 1});
            }else{
                alert('producto sin stock');
                return;
            }
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert('añadido');
        //let irCarrito = document.createElement('button');
        //irCarrito.textContent = 'Ir al carrito';
        //irCarrito.addEventListener('click', () =>{
        //    window.location.href = '../carrito.html';
        //});
        //irCarrito.classList.add('btn');
        //irCarrito.classList.add('btn-success');
        //detalles.appendChild(irCarrito);
        //click = click + 1;
        //let compras = document.getElementById('compras');
        //let mCompras = document.getElementById('m_compras');
        //let mComprasRight = document.getElementById('m_compras_right');
        //compras.textContent = click;
        //mCompras.textContent = click;
        //mComprasRight.textContent = click;
    }
});