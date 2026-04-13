let imagen = [];
    
async function cargarCarrusel(id){
    try{
        //const res = await fetch('http://localhost:3000/productos-usados');
        const res = await fetch('https://ventas-backend-wj4v.onrender.com/productos-usados');
        imagen = await res.json();

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        const producto = imagen.find(p => p._id === id);

        if(producto){
            mostrarCarrusel(producto);
        }else{
            console.error('producto no encontrado');
        }
    }catch (error){
        console.error('Error cargando producto: ', error);
    }
}

function mostrarCarrusel(prod){
    let html = `
        <div id="carouselExample" class="carousel slide">
            <div class="carousel-inner">
                <div class="carousel-item active">
                	<img src="${prod.imagen}" class="d-block w-100" alt="...">
                </div>
                <div class="carousel-item">
                	<img src="${prod.imagen}" class="d-block w-100" alt="...">
                </div>
                <div class="carousel-item">
                	<img src="${prod.imagen}" class="d-block w-100" alt="...">
                </div>
                <div class="carousel-item">
                	<img src="${prod.imagen}" class="d-block w-100" alt="...">
                </div>
                <div class="carousel-item">
                	<video src="${prod.imagen}" class="d-block w-100" alt="..." loop autoplay muted>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            	<span class="carousel-control-prev-icon bg-dark" aria-hidden="true"></span>
            	<span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            	<span class="carousel-control-next-icon bg-dark" aria-hidden="true"></span>
            	<span class="visually-hidden">Next</span>
            </button>
        </div>
    `;
}