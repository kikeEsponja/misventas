            const nombreGuardado = localStorage.getItem("nombreVendedor");
            const telefonoGuardado = localStorage.getItem("telefonoVendedor");
            if(nombreGuardado) {
                document.getElementById("nombre").innerText = ` ${nombreGuardado} 👋`;
            }
            async function crearProducto(){
                const token = localStorage.getItem("token");
                const nombre = localStorage.getItem("nombreVendedor") || "Vendedor Anónimo";
                const telefono = localStorage.getItem("telefonoVendedor") || "Sin teléfono";

                //const tipoSeleccionado = estado.value; 
                const tipoSeleccionado = document.getElementById("estado").value;

                const endpointMap = {
                    nuevo: "productos-nuevos",
                    usado: "productos-usados",
                    servicio: "productos-servicios"
                };
            
                const endpoint = endpointMap[tipoSeleccionado];
            
                const files = document.getElementById("imagenes").files;
            
                if(files.length === 0){
                    alert("Sube al menos una imagen, artista 🎨");
                    return;
                }

                // 🔥 subir imágenes
                const urlsImagenes = await subirImagenes(files);

                const res = await fetch(`https://ventas-backend-wj4v.onrender.com/${endpoint}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: titulo.value,
                        marca: marca.value,
                        cantidad: Number(cantidad.value),
                        precio: Number(precio.value),
                        condicion: tipoSeleccionado,
                        estado: "disponible",
                        ubicacion: {
                            localidad: localidad.value,
                            calle: calle.value,
                            altura: Number(altura.value)
                        },
                        imagen: urlsImagenes, // 👈 BOOM 💥
                        vendedor: localStorage.getItem("nombreVendedor") || "Vendedor Anónimo",
                        telefono: localStorage.getItem("telefonoVendedor") || "Sin teléfono",
                        descripcion: descripcion.value,
                        direcc: `../vistas/${tipoSeleccionado}.html`
                    })
                });

                const data = await res.json();
                alert("Producto creado con éxito 😎");
            }

            async function subirImagenes(files){
                const urls = [];

                for(let file of files){
                    const formData = new FormData();
                    formData.append("imagen", file);
                
                    const res = await fetch("https://ventas-backend-wj4v.onrender.com/subir-imagen", {
                        method: "POST",
                        body: formData
                    });
                
                    const data = await res.json();
                    urls.push(data.url);
                }
                return urls;
            }


async function renderizarProductosAdmin(productos, tipo, limpiar = false) {
    const contenedor = document.getElementById("contenedor-productos");
    
    // Solo borramos si explícitamente lo pedimos (usualmente en la primera carga)
    if (limpiar) {
        contenedor.innerHTML = "";
    }

    productos.forEach(prod => {
        const estaAgotado = prod.cantidad === 0;
        // Usamos += para ir sumando los bloques de productos
        contenedor.innerHTML += `
            <div class="producto-card" style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
                <h3>${prod.nombre} (${tipo})</h3>
                <p>Stock actual: ${prod.cantidad}</p>
                ${estaAgotado ? `
                    <div style="background: #fff3f3; padding: 10px; border-radius: 5px;">
                        <p style="color:red;">⚠️ <strong>¡PRODUCTO AGOTADO!</strong></p>
                        <button onclick="marcarVendido('${tipo}', '${prod._id}')">Vendido</button>
                        <button onclick="reponerStock('${tipo}', '${prod._id}')">Reponer</button>
                    </div>
                ` : `
                    <p style="color: green;">✅ Disponible</p>
                    <input type="number" id="venta-${prod._id}" value="1" min="1" max="${prod.cantidad}">
                    <button onclick="vender('${tipo}', '${prod._id}', ${prod.cantidad})">💸 Vender</button>
                `}
            </div>
        `;
    });
}

function cargarProductosAdmin() {
    const token = localStorage.getItem("token");
    if (!token) {
        location.href = "login.html";
        return;
    }

    // El contenedor se limpia una sola vez al inicio del proceso
    document.getElementById("contenedor-productos").innerHTML = "Cargando productos...";

    Promise.all([
        fetch("https://ventas-backend-wj4v.onrender.com/productos-nuevos").then(res => res.json()), // Indice 0
        fetch("https://ventas-backend-wj4v.onrender.com/productos-usados").then(res => res.json()),  // Indice 1
        fetch("https://ventas-backend-wj4v.onrender.com/productos-servicios").then(res => res.json()) // Indice 2
    ]).then(([nuevos, usados, servicios]) => {
        // Limpiamos el mensaje de "Cargando..."
        const contenedor = document.getElementById("contenedor-productos");
        contenedor.innerHTML = "";

        // Renderizamos uno tras otro sin limpiar el contenedor entre llamadas
        renderizarProductosAdmin(nuevos, "productos-nuevos", false);
        renderizarProductosAdmin(usados, "productos-usados", false);
        renderizarProductosAdmin(servicios, "productos-servicios", false);
        
    }).catch(error => {
        console.error("Error al cargar productos:", error);
    });
}

            async function vender(tipo, id, stockActual) {
                const input = document.getElementById(`venta-${id}`);
                const cantidadVenta = Number(input.value);

                if (cantidadVenta <= 0 || cantidadVenta > stockActual) {
                    alert("Cantidad no válida o superior al stock disponible");
                    return;
                }

                const res = await fetch(`https://ventas-backend-wj4v.onrender.com/vender/${tipo}/${id}`, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ cantidadVendida: cantidadVenta })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("¡Venta registrada con éxito! 💸");
                    location.reload();
                } else {
                    alert("Error al registrar la venta");
                }
            }

            async function marcarVendido(tipo, id) {
                const token = localStorage.getItem("token");
                const confirmar = confirm("¿Seguro que quieres marcarlo como vendido? Esto lo quitará de la vista pública.");

                if (confirmar) {
                    const res = await fetch(`https://ventas-backend-wj4v.onrender.com/marcar-vendido/${tipo}/${id}`, {
                        method: "PUT",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        alert("Producto actualizado 😎");
                        location.reload(); // Recargamos para ver los cambios
                    }
                }
            }

            async function reponerStock(tipo, id) {
                const token = localStorage.getItem("token");
                const nuevaCantidad = prompt("¿Cuántas unidades vas a agregar?");
    
                if (nuevaCantidad && !isNaN(nuevaCantidad)) {
                    const res = await fetch(`https://ventas-backend-wj4v.onrender.com/reponer/${tipo}/${id}`, {
                        method: "PUT",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ cantidad: nuevaCantidad })
                    });
                    
                    if (res.ok) {
                        alert("Stock actualizado 💪");
                        location.reload();
                    }
                } else {
                    alert("Cantidad no válida");
                }
            }

            //creamos una función para cargar los productos al iniciar la página que renderice los tres tipos de productos (nuevos, usados y servicios) y los muestre en el panel de administrador. Esta función se llamará al cargar la página.
            function cargarProductosVend() {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("Debes iniciar sesión para acceder al panel de administrador");
                    location.href = "login.html";
                    return;
                }

                Promise.all([
                    fetch("https://ventas-backend-wj4v.onrender.com/productos-nuevos", {
                    }).then(res => res.json()),
                    fetch("https://ventas-backend-wj4v.onrender.com/productos-usados", {
                    }).then(res => res.json()),
                    fetch("https://ventas-backend-wj4v.onrender.com/productos-servicios", {
                    }).then(res => res.json())
                ]).then(([nuevos, usados, servicios]) => {
                    renderizarProductosAdmin(nuevos, "nuevo");
                    renderizarProductosAdmin(usados, "usados");
                    renderizarProductosAdmin(servicios, "servicio");
                }).catch(error => {
                    console.error("Error al cargar productos:", error);
                    alert("Hubo un error al cargar los productos. Intenta recargar la página.");
                });
            }

            cargarProductosVend();

            function salir() {
                localStorage.removeItem("token");
                location.href = "login.html";
            }