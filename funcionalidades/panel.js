const token = localStorage.getItem("token");
if(!token){
    location.href="login.html";
}
async function crearProducto(){
    const res = await fetch("/productos",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": token
        },
        body: JSON.stringify({
            titulo: titulo.value,
            precio: precio.value,
            descripcion: descripcion.value,
            imagen: imagen.value,
            estado: estado.value
        })
    });

    const data = await res.json();
    alert("Producto guardado");
}