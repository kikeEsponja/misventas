//import MercadoPagoConfig from "mercadopago";

const contenedor = document.getElementById('carrito-contenido');
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function formatoMoneda(num){
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function mostrarCarrito(){
    /*let botonCompra = document.getElementById('pagarMP');
    botonCompra.setAttribute('disabled', true);
    if(carrito.length === 0){
        contenedor.innerHTML = '<p>El carrito está vacío</p>';
        return;
    }else{
        botonCompra.removeAttribute('disabled');
    }*/
    let html = '';

    carrito.forEach(item =>{
        html += `
        <tr>
            <td><img src="../${item.imagen}" alt="" class="img_car"></td>
            <td>${item.nombre}</td>
            <td><p class="tlf_car">Cantidad</p> ${item.cantidad}</td>
            <td><p class="tlf_car">Precio</p> ${formatoMoneda(item.precio)}</td>
            <td><p class="tlf_car">Subtotal</p> ${formatoMoneda(item.precio * item.cantidad)}</td>
            <td>
                <button class="del bi bi-trash" data-id="${item._id}"></button>
            </td>
        </tr>
        <hr>
        `;
    });
    contenedor.innerHTML = html;
}

function actualizarCarrito(){
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const totalProductos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    const totalSub = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

    document.getElementById('total_productos').textContent = totalProductos;
    document.getElementById('total_sub').textContent = '$ ' + formatoMoneda(totalPrecio);
    document.getElementById('total_total').textContent = '$ ' + formatoMoneda(totalPrecio);
}

mostrarCarrito();
actualizarCarrito();

document.addEventListener('click', e => {
    if(e.target.classList.contains('del')){
        const id = e.target.dataset.id;

        carrito = carrito.filter(p => p._id !== id);

        localStorage.setItem('carrito', JSON.stringify(carrito));

        mostrarCarrito();
        actualizarCarrito();
    }
});

document.getElementById('vaciar').addEventListener('click', () =>{
    localStorage.removeItem('carrito');
    carrito = [];
    mostrarCarrito();
    actualizarCarrito();
});

let volver = document.getElementById('volver');
volver.addEventListener('click', () =>{
    window.history.back();
});

/*const botonPagar = document.getElementById('pagarMP');

botonPagar.addEventListener('click', async () => {
    try{
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        if(carrito.length === 0){
            alert('El carrito está vacío');
            return;
        }

        const res = await fetch('https://ventas-backend-wj4v.onrender.com/crear_preferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrito })
        });

        const data = await res.json();

        const mp = new MercadoPago('APP_USR-11fd9648-96d3-4939-94d1-366a67e21f0b', {
            locale: 'es-AR'
        });

        mp.checkout({
            preference: {
                id: data.id
            },
            autoOpen: true
        });
    } catch (error) {
        console.error('Error al pagar:', error);
        alert('Error al efectuar el pago');
    }
});*/