const lista = document.getElementById('lista-productos');
window.addEventListener('pageshow', () => {
    cargarProductos();
});

let inicio = document.getElementById('inicio');
inicio.addEventListener('click', ()=>{
    window.location.href = '../../index.html';
});

    let productos = [];
    const loader = document.getElementById('loader');
    
    async function cargarProductos(){
        try{
            //const res = await fetch('http://localhost:3000/productos-usados');
            const res = await fetch('https://ventas-backend-wj4v.onrender.com/productos-usados');
            productos = await res.json();
            loader.style.display = 'block';
            mostrarProductos();
        }catch (error){
            console.error('Error cargando productos: ', error);
        }
    }
    
    function formatoMoneda(num){
        return num.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    
    function mostrarProductos(){
        loader.style.display = 'none';
        let html = "";
    
        productos.forEach(prod =>{
            html += `
            <div class="boton_mmgv product">
                <a href="${prod.direcc}?id=${prod._id}"><img src="${prod.imagen}"></a>
                <h4>${prod.nombre}</h4>
                <h5>Marca:</h5><p> ${prod.marca}</p>
                <div>
                    <!--<h6 class="precio_online">PRECIO</h6>-->
                    <h2> $ ${formatoMoneda(prod.precio)}</h2>
                </div>
                <p>Condición: ${prod.condicion}</p>
                <p>Cantidad: ${prod.cantidad}</p>
                <hr>
                <button class="add-car btn btn-primary agregar_al_carro_item" data-id="${prod._id}">Agregar al carro</button>
                <!--<button class="add-car btn btn-primary agregar_al_carro_item" data-id="${prod._id}" id="pagarMP">Comprar</button>-->
            </div>
            `;
        });
        lista.innerHTML = html;
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
            click = click + 1;
            let compras = document.getElementById('compras');
            //let mCompras = document.getElementById('m_compras');
            //let mComprasRight = document.getElementById('m_compras_right');
            compras.textContent = click;
            //mCompras.textContent = click;
            //mComprasRight.textContent = click;
        }
    });