const contenedor = document.getElementById('carrito-contenido');
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function formatoMoneda(num){
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });
}

function mostrarCarrito(){
    let botonCompra = document.getElementById('comprar');
    botonCompra.setAttribute('disabled', true);
    if(carrito.length === 0){
        contenedor.innerHTML = '<p>El carrito está vacío</p>';
        return;
    }else{
        botonCompra.removeAttribute('disabled');
    }

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
    //let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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