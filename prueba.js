const pais = localStorage.getItem('pais');
const tipo = localStorage.getItem('tipo');

let productos = [];

window.addEventListener('pageshow', () =>{
    cargarProductos();
});

const contenedor = document.getElementById('lista-productos');

async function cargarProductos(){
    try{
        const res = await fetch(`http://localhost:3000/productos-${tipo}?pais=${pais}`);
        productos = await res.json();

        mostrarProductos(productos);
    }catch (error){
        console.error('Error cargando productos: ', error);
    }
}

const mostrarProductos = (listaArray) => {
    let html = '';

    const listaContenedor = document.querySelector('#contenedor-productos');

    if(listaArray.length === 0){
        listaContenedor.innerHTML = '<h3>No se encontraron productos en esa zona</h3>';
        return;
    }

    listaArray.forEach(prod =>{
        const esVendido = prod.condicion.toUpperCase().includes('VENDIDO');
 
        html += `
        <div class="boton_mmgv product" onclick="registrarVisita('${prod._id}', '${prod.direcc}?id=${prod._id}')">
            <a href="${prod.direcc}?id=${prod._id}"><img src="${prod.imagen}"></a>
            <h4>${prod.nombre}</h4>
            <h5>Ubicación: </h5><p>${prod.ubicacion.localidad}</p>
            <div class="precio bg-warning">
                <h2>$ ${formatoMoneda(prod.precio)}</h2>
            </div>
            <p>Cantidad: ${prod.cantidad}</p>
            <p>Visitas: ${prod.visitas}</p>
            <hr>
            <div class="agregar-wsp">
                <!--<button onclick="contactar('${prod.telefono}')">Contactar</button>-->
                <button class="add-car agregar_al_carro_item bg-primary bi bi-cart" data-id="${prod._id}" ${esVendido ? 'disabled' : ''}></button>
                <a title="social-icon" target="_blank" href="${esVendido ? '#' : prod.vendedor}" class="${esVendido ? 'wsp-vend' : ''}"><i class="bi bi-whatsapp"></i></a>
                <strong class="${esVendido ? '' : 'mobile'} bg-danger w-50 text-light">VENDIDO</strong>
            </div>
        </div>
        `;
    });
    listaContenedor.innerHTML = html;
};

localStorage.setItem('productos', JSON.stringify(productos));

async function registrarVisita(id, url){
    try{
        await fetch(`http://localhost:3000/visita/${id}`, { method: 'POST' });
        window.open(url, '_blank');

    }catch(error){
        console.error('Error al registrar visita', error);
    }
}

cargarProductos();



import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import jwt from 'jsonwebtoken';

dotenv.config();
console.log("🔍 URI de Mongo:", process.env.MONGO_URI);
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

const ProductoSchema = new mongoose.Schema({
	fecha: { type: Date, default: Date.now },
	nombre: String,
	direcc: String,
	marca: String,
	precio: Number,
	condicion: String,
	imagen: String,
	cantidad: Number,
	visitas: { type: Number, default: 0 },
	ubicacion: { localidad: String, calle: String, altura: Number },
	vendedor: String,
	vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendedores', required: true },
});

const VendedorSchema = new mongoose.Schema({
	nombre: String,
	pais: String,
	ciudad: String,
	telefono: String,
	email: String,
	moneda: String,
	activo: { type: Boolean, default: true },
});

const Vendedor = mongoose.model('vendedores', VendedorSchema);
const ProductoNuevo = mongoose.model("nuevos", ProductoSchema);
const ProductoUsado = mongoose.model("usados", ProductoSchema);
const ProductoServicio = mongoose.model("servicios", ProductoSchema);

function crearRutas(tipo, Modelo){
	app.get(`/${tipo}`, async (req, res) =>{
		try{
			const { pais } = req.query;

			let filtro = {};

			if(pais){
				const vendedores = await Vendedor.find({ pais }).select('_id');
				filtro.vendedorId = { $in: vendedores };
			}

			const productos = await Modelo.find(filtro).sort({ fecha: -1 });
			res.json(productos);
			
		}catch (error){
			res.status(500).json({ error: `Error al obtener ${tipo}`});
		}
	});

	app.get(`/${tipo}/:id`, async (req, res) => {
		try{
			const producto = await Modelo.findById(req.params.id);
			res.json(producto);
		}catch(error){
			console.error(`Error en /${tipo}:`, error);
			res.status(500).json({ error: `Error al obtener ${tipo}`});
		}
	});

	app.post("/visita/:id", async (req, res) => {
		try{
			const { id } = req.params;
			await Modelo.findByIdAndUpdate(id, { $inc: { visitas: 1 } });
			res.json({ ok: true });
		}catch(error){
			console.error("Error al registrar visita:", error);
			res.status(500).json({ error: "no se pudo registrar la visita" });
		}
	});
}
crearRutas("productos-nuevos", ProductoNuevo);
crearRutas("productos-usados", ProductoUsado);
crearRutas("productos-servicios", ProductoServicio);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));