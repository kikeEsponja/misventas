const pais = localStorage.getItem('pais');
const tipo = localStorage.getItem('tipo');
const divisaPorPais = {
	'AR': { locale: 'es-Ar', currency: 'ARS' },
	'CL': { locale: 'es-CL', currency: 'CLP' },
	'US': { locale: 'en-US', currency: 'USD' },
	'ES': { locale: 'es-ES', currency: 'EUR' },
	
}

let productos = [];

window.addEventListener('pageshow', () =>{
    cargarProductos();
});

const contenedor = document.getElementById('lista-productos');
const loader = document.getElementById('loader');
const buscadorArt = document.querySelector('#buscador_art');
const buscadorZon = document.querySelector('#buscador_zon');

let titulo = document.getElementById('titulo');
if(tipo === 'nuevos'){
    titulo.textContent = 'NUEVOS';
}else if(tipo === 'usados'){
    titulo.textContent = 'USADOS';
}else{
    titulo.textContent = 'SERVICIOS';
}

async function cargarProductos(){
    try{
        loader.style.display = 'block';
        const res = await fetch(`https://ventas-backend-wj4v.onrender.com/productos-${tipo}?pais=${pais}`);
        productos = await res.json();

        mostrarProductos(productos);
    }catch (error){
        console.error('Error cargando productos: ', error);
    }finally{
        loader.style.display = 'none';
    }
}

function formatoMoneda(valor, codigoPais, codigoMoneda){
    try{
        if(typeof valor !== 'number' || isNaN(valor)){
            throw new Error('El valor debe ser un número válido');
        }
        if(typeof codigoPais !== 'string' || typeof codigoMoneda !== 'string'){
            throw new Error('los valores deben ser cadenas');
        }

        return new Intl.NumberFormat(codigoPais, {
            style: 'currency',
            currency: codigoMoneda
        }).format(valor);
    }catch(error){
        console.error('Error al formatear moneda: ', error.message);
        return null;
    }
}

const mostrarProductos = (listaArray) => {
    loader.style.display = 'none';

    let html = '';

    const listaContenedor = document.querySelector('#contenedor-productos');

    if(listaArray.length === 0){
        listaContenedor.innerHTML = '<h3>No se encontraron productos en esa zona</h3>';
        return;
    }

    listaArray.forEach(prod =>{
        const esVendido = prod.condicion.toUpperCase().includes('VENDIDO');
 
        html += `
        <div class="boton_mmgv">
            <a href="${prod.direcc}?id=${prod._id}" onclick="registrarVisita('${prod._id}', '${prod.direcc}?id=${prod._id}')"><img src="${prod.imagen}"></a>
            <h4>${prod.nombre}</h4>
            <h5>Ubicación: </h5><p>${prod.ubicacion.localidad}</p>
            <div class="precio bg-warning">
                <h2>${formatoMoneda(prod.precio)}</h2>
            </div>
            <p>Cantidad: ${prod.cantidad}</p>
            <small>Visitas: ${prod.visitas}</small>
            <hr>
            <div class="agregar-wsp">
                <!--<button onclick="contactar('${prod.telefono}')">Contactar</button>-->
                <button class="add-car agregar_al_carro_item bg-primary bi bi-cart" data-id="${prod._id}" ${esVendido ? 'disabled' : ''}></button>
                <a title="social-icon" target="_blank" href="${esVendido ? '#' : prod.vendedor}" class="${esVendido ? 'wsp-vend' : ''}"><i class="bi bi-whatsapp"></i></a>
                <strong class="${esVendido ? '' : 'mobile_desap'} bg-danger w-50 text-light">VENDIDO</strong>
            </div>
        </div>
        `;
    });
    listaContenedor.innerHTML = html;
};

cargarProductos();