                if(window.productoEditando){
                // ✏️ EDITAR
                const { tipo, id } = window.productoEditando;

                await fetch(`https://ventas-backend-wj4v.onrender.com/editar/${tipo}/${id}`, {
                    method: "PUT",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization": `Bearer ${token}`
                    },
                        body: JSON.stringify({
                            nombre: titulo.value,
                            marca: marca.value,
                            precio: Number(precio.value),
                            cantidad: Number(cantidad.value),
                            descripcion: descripcion.value,
                            ubicacion: {
                                localidad: localidad.value,
                                calle: calle.value,
                                altura: Number(altura.value)
                            }
                        })
                    });
                
                    alert("Producto actualizado 😎");
                    window.productoEditando = null;
                    location.reload();
                    return;