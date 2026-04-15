const token = localStorage.getItem("token");
const nombreGuardado = localStorage.getItem("nombreVendedor");

if(!token){
    alert("No autorizado, Estebandido no eres tú 😏");
    window.location.href = "admin_login.html";
}

const lista = document.getElementById('lista');

async function cargarPendientes(){
    const tipo = document.getElementById('tipo').value;

    //const res = await fetch(`http://localhost:3000/${tipo}?aprobado=false`);
    const res = await fetch(`https://ventas-backend-wj4v.onrender.com/${tipo}?aprobado=false`);
    const data = await res.json();

    render(data, tipo);
}

function render(productos, tipo){
    let html = '';

    if(productos.length === 0){
        lista.innerHTML = `<h3>No hay ${tipo} pendientes 😴</h3>`;
        return;
    }

    productos.forEach(p =>{
        html += `
        <div style="border:1px solid #ccc; margin:10px; padding:10px;">
            <h3>${p.nombre}</h3>
            <p>Precio: ${p.precio}</p>
            <p>Vendedor: ${p.nombreGuardado}</p>

            <button onclick="aprobar('${tipo}','${p._id}')">✅ Aprobar</button>
            <button onclick="rechazar('${tipo}','${p._id}')">❌ Rechazar</button>
        </div>
        `;
    });

    lista.innerHTML = html;
}

async function aprobar(tipo, id){
    const token = localStorage.getItem("token");

    //await fetch(`http://localhost:3000/aprobar-producto/${tipo}/${id}`, {
    await fetch(`https://ventas-backend-wj4v.onrender.com/aprobar-producto/${tipo}/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    cargarPendientes();
}

async function rechazar(tipo, id){
    const token = localStorage.getItem("token");

    //await fetch(`http://localhost:3000/rechazar-producto/${tipo}/${id}`, {
    await fetch(`https://ventas-backend-wj4v.onrender.com/rechazar-producto/${tipo}/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    cargarPendientes();
}