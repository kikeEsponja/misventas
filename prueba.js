const pais = localStorage.getItem('pais');
const tipo = localStorage.getItem('tipo');
const divisaPorPais = {
	'AR': { locale: 'es-Ar', currency: 'ARS' },
	'CL': { locale: 'es-CL', currency: 'CLP' },
	'US': { locale: 'en-US', currency: 'USD' },
	'ES': { locale: 'es-ES', currency: 'EUR' },
	'VE': { locale: 'es-VE', currency: 'Ves' },
    'BR': { locale: 'pt-BR', currency: 'BRL'},
    'PE': { locale: 'es-PE', currency: 'PEN'},
}

if(!pais || !tipo){
    alert('EEEEKK, Fuera!');
    window.location.href = '../index.html';
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
        const res = await fetch(`http://localhost:3000/productos-${tipo}?pais=${pais}`);
        productos = await res.json();

        console.log("Productos cargados:", productos);
        mostrarProductos(productos);
        localStorage.setItem('productos', JSON.stringify(productos));
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
        const esVendido = prod.condicion?.includes('VENDIDO'); //Quité el toLowerCase y lo reemplacé por un "?" porque algunos vendedores escriben "Vendido" con mayúscula inicial, y así cubrimos ambos casos. Si quieres ser aún más exhaustivo, podríamos usar una expresión regular para detectar "vendido" sin importar mayúsculas o minúsculas. Por ejemplo: /vendido/i.test(prod.condicion) que también detectaría "VENdido", "VENdIDO", etc. Pero creo que con el includes y el toUpperCase ya estamos bastante cubiertos para la mayoría de los casos comunes.
        const config = divisaPorPais[pais] || { locale : 'en-US', currency: 'USD'};

        let imagenPortada = '';

        if(Array.isArray(prod.imagen)){
            imagenPortada = prod.imagen.length > 0 ? prod.imagen[0] : 'imgagenes/empty.webp';
        }else{
            imagenPortada = prod.imagen ? prod.imagen : 'imagenes/empty.webp';
        }
        html += `
        <div class="boton_mmgv">
            <a href="${prod.direcc}?id=${prod._id}" onclick="registrarVisita('${prod._id}', '${prod.direcc}?id=${prod._id}')"><img src="${imagenPortada}" alt="${prod.nombre}"></a>
            <h4>${prod.nombre}</h4>
            <h5>Ubicación: </h5><p>${prod.ubicacion?.localidad || 'Sin ubicación'}</p>
            <div class="precio bg-warning">
                <h2>${formatoMoneda(prod.precio, config.locale, config.currency)}</h2>
            </div>
            <p>Cantidad: ${prod.cantidad}</p>
            <small>Visitas: ${prod.visitas}</small>
            <hr>
            <div class="agregar-wsp">
                <!--<button onclick="contactar('${prod.telefono}')">Contactar</button>-->
                <button class="add-car agregar_al_carro_item bg-primary bi bi-cart" data-id="${prod._id}" ${esVendido ? 'disabled' : ''}></button>
                <a title="social-icon" target="_blank" href="${esVendido ? '#' : prod.vendedor}" class="${esVendido ? 'wsp-vend' : ''}"><i class="bi bi-whatsapp"></i></a>
                <strong class="${esVendido ? '' : 'mobile_desap'} bg-danger text-light">VENDIDO</strong>
            </div>
        </div>
        `;
    });
    listaContenedor.innerHTML = html;
};

buscadorArt.addEventListener('keyup', filtrarProductos);
buscadorZon.addEventListener('keyup', filtrarProductos);

function contactar(tel){
    window.location.href = `https://wa.me/${tel}`;
}

async function registrarVisita(id, url){
    try{
        const res = await fetch(`http://localhost:3000/productos-${tipo}/visita/${id}`, { method: 'POST' });
        const data = await res.json();

        if(data.ok){
            const producto = productos.find(p => p._id === id);
            if(producto){
                producto.visitas = data.visitas;
                mostrarProductos(productos);
            }
        }
        window.open(url, '_self');

    }catch(error){
        console.error('Error al registrar visita', error);
    }
}

cargarProductos();