const listaContenedor = document.getElementById('contenedor-productos');
const loader = document.getElementById('loader');
const buscador = document.querySelector('#buscador');

let productos = [];

window.addEventListener('pageshow', () => {
    cargarProductos();
});

let inicio = document.getElementById('inicio');
inicio.addEventListener('click', ()=>{
    window.location.href = '../../index.html';
});
    
async function cargarProductos(){
    try{
        loader.style.display = 'block';
        //const res = await fetch('http://localhost:3000/productos-usados');
        const res = await fetch('https://ventas-backend-wj4v.onrender.com/productos-usados');
        productos = await res.json();

        mostrarProductos(productos);
    }catch (error){
        console.error('Error cargando productos: ', error);
    }finally{
        loader.style.display = 'none';
    }
}
    
function formatoMoneda(num){
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
    
const mostrarProductos = (listaArray) => {
    loader.style.display = 'none';
    let html = "";
    if(listaArray.length === 0){
        listaContenedor.innerHTML = '<h3>No se encontraron productos en esta zona</h3>';
        return;
    }
    
    listaArray.forEach(prod =>{
        const esVendido = prod.condicion.toUpperCase().includes('VENDIDO');

        html += `
        <div class="boton_mmgv product">
            <a href="${prod.direcc}?id=${prod._id}"><img src="${prod.imagen}"></a>
            <h4>${prod.nombre}</h4>
            <h5>Ubicación:</h5><p> ${prod.ubicacion.localidad}</p>
            <div class="precio">
                <h2> $ ${formatoMoneda(prod.precio)}</h2>
            </div>
            <p class="cond ${esVendido ? 'vendido' : ''}">Condición: ${prod.condicion}</p>
            <p>Cantidad: ${prod.cantidad}</p>
            <hr>
            <div class="agregar-wsp">
                <button class="add-car agregar_al_carro_item bg-primary bi bi-cart" data-id="${prod._id}" ${esVendido ? 'disabled' : ''}></button>
                <a title="social-icon" target="_blank" href="${esVendido ? '#' : prod.vendedor}" class="${esVendido ? 'wsp-vend' : ''}"><i class="bi bi-whatsapp"></i></a>
                <!--<button class="add-car btn btn-primary agregar_al_carro_item" data-id="${prod._id}" id="pagarMP">Comprar</button>-->
            </div>
        </div>
        `;
    });
    listaContenedor.innerHTML = html;
};

    

buscador.addEventListener('keyup', () => {
    const valorBusqueda = buscador.value.toLowerCase();

    const productosFiltrados = productos.filter(prod => {
        const localidad = prod.ubicacion.localidad.toLowerCase();
        return localidad.includes(valorBusqueda);
    });
    
    mostrarProductos(productosFiltrados);
});
    
cargarProductos();
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
                alert('Artículo agotado');
                return;
            }
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert('añadido');
        click = click + 1;
        let compras = document.getElementById('compras');
        //let mCompras = document.getElementById('m_compras');
        //let mComprasRight = document.getElementById('m_compras_right');
        compras.textContent = click;
        //mCompras.textContent = click;
        //mComprasRight.textContent = click;
    }
});