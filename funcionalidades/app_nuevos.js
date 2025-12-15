let detalles = document.getElementById('detalles');

window.addEventListener('pageshow', () => {
    cargarProductos();
});

    let productos = [];
    
    async function cargarProductos(id){
        try{
            //const res = await fetch('http://localhost:3000/productos-usados');
            const res = await fetch('https://ventas-backend-wj4v.onrender.com/productos-nuevos');
            productos = await res.json();

            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');

            const producto = productos.find(p => p._id === id);

            if(producto){
                mostrarProductos(producto);
            }else{
                console.error('producto no encontrado');
            }
        }catch (error){
            console.error('Error cargando producto: ', error);
        }
    }
    
    function formatoMoneda(num){
        return num.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    
    function mostrarProductos(prod){
        let html = `
            <div class="boton_mmgv product">
                <h4>${prod.nombre}</h4>
                <h5>Marca:</h5><p> ${prod.marca}</p>
                <div>
                    <h6 class="precio_online">PRECIO</h6>
                    <h2> $ ${formatoMoneda(prod.precio)}</h2>
                </div>
                <p>Condición: ${prod.condicion}</p>
                <p>Cantidad disponible: ${prod.cantidad}</p>
                <hr>
                <button class="add-car btn btn-primary agregar_al_carro_item" data-id="${prod._id}">Agregar al carro</button>
                <button class="btn btn-success agregar_al_carro_item" id="ir_carrito">Ir al carrito</button>
                <button class="btn btn-warning" id="volver">Volver</button>
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