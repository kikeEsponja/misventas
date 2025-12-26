const formulario = document.getElementById('formulario');
if(formulario){
    formulario.addEventListener('submit', async (event) =>{
        event.preventDefault();

        const contras = document.getElementById('contras').value;
        try{
            //const respuesta = await fetch('http://localhost:3000/acceso', {
            const respuesta = await fetch('https://ventas-backend-wj4v.onrender.com/acceso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pass: contras })
            });

            const data = await respuesta.json();
        
            if(data.ok){
                localStorage.setItem('token_admin', data.token);
                window.location.href = './vistas/admin.html';
            }else{
                alert('contraseña inválida');
            }
        }catch (error){
            console.error('Hubo un error', error);
            alert('hubo un error 500');
        }
    });
}

const adminFormulario = document.getElementById('admin_formulario');
if(adminFormulario){
    adminFormulario.addEventListener('submit', async (event) =>{
        event.preventDefault();

        const token = localStorage.getItem('token_admin');

        const nombre = document.getElementById('nombre').value;
        const direcc = document.getElementById('direcc').value;
        const marca = document.getElementById('marca').value;
        const precio = Number(document.getElementById('precio').value);
        const imagen = document.getElementById('imagen').value;
        const cantidad = Number(document.getElementById('cantidad').value);
        const condicion = document.getElementById('cond').value;

        try{
            //const agregar = await fetch('http://localhost:3000/admin/agregar-productos', {
            const agregar = await fetch('https://ventas-backend-wj4v.onrender.com/admin/agregar-productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ 
                    nombre: nombre,
    	            direcc: direcc,
                    marca: marca,
                    precio: precio,
                    condicion: condicion,
                    imagen: imagen,
                    cantidad: cantidad,
                 })
            });

            if(agregar.status === 401 || agregar.status === 403){
                alert('No tienes permisos');
                window.location.href = '../index.html';
                return;
            }

            const data = await agregar.json();

            if(data.ok){
                alert('producto agregado');
                console.log('producto agregado');
                adminFormulario.reset();
            }

        }catch (error){
            console.error('Hubo un error', error);
            alert('hubo un error 500');
        }
    });
}

const salir = document.getElementById('salir');
if(salir){
    salir.addEventListener('click', ()=>{
        window.location.href = '../index.html';
    });
}