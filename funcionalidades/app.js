/*let inicio = document.getElementById('logo');

inicio.style.cursor = 'pointer';
inicio.addEventListener('click', () =>{
    window.location.href = '../index.html';
});*/
//-------------------------------CONTADOR-----------------------------------------------------
/*let click = 0;
let contador = document.getElementById('cantidad_de_productos');

let numDisp = producto.cantidad;
let numInicial = producto.cantidad;

let contadorDisp = document.getElementById('disponibles');
contadorDisp.textContent = numDisp;

let botonResta = document.getElementById('resta');
botonResta.setAttribute('disabled', true); // anula el botón resta al cargar el documento
let botonSuma = document.getElementById('suma');

botonResta.addEventListener('click', function(){
	click = click - 1;
	contador.textContent = click;
    numDisp = numDisp + 1;
    contadorDisp.textContent = numDisp;

    if(click === 0){
        botonResta.setAttribute('disabled', true);
        //botonSuma.removeAttribute('disabled', null);
    }
    if(numDisp > 0){
        botonSuma.removeAttribute('disabled');
    }
});


botonSuma.addEventListener('click', function(){
    botonResta.removeAttribute('disabled'); // activa el botón resta al iniciar la suma de artículos
	click = click + 1;
	contador.textContent = click;
    numDisp = numDisp - 1;
    contadorDisp.textContent = numDisp;
    if(numDisp === 0){
        botonSuma.setAttribute('disabled', null);
    }
});*/
//---------------------------------------------CARRITO---------------------------------------------------
const botonAgregar = document.getElementById('agregar-carrito');
const botonComprar = document.getElementById('comprar');

/*botonAgregar.addEventListener('click', () =>{
    let cantidadElegida = click;

    if(cantidadElegida <= 0){
        alert('agrega un producto');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const existente = carrito.find(p => p.id === producto.id);

    if(existente){
        existente.cantidad += cantidadElegida
    }else{
        carrito.push({
            ...producto,
            cantidad: cantidadElegida
        });
        window.location.href = './carrito.html';
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    alert('añadido');
});*/