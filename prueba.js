import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

dotenv.config();
//console.log("🔍 URI de Mongo:", process.env.MONGO_URI);
const app = express();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'productos',
		allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
	}
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

const ProductoSchema = new mongoose.Schema({
	fecha: { type: Date, default: Date.now },
	nombre: String,
	descripcion: String,
	direcc: String,
	marca: String,
	precio: Number,
	condicion: String,
	estado: { type: String, default: "disponible" },
	// valores: disponible | vendido | pausado
	imagen: Array,
	cantidad: Number,
	visitas: { type: Number, default: 0 },
	ubicacion: {
		localidad: { type: String, default: '' },
		calle: { type: String, default: '' },
		altura: { type: Number, default: 0 }
	},
	aprobado: { type: Boolean, default: false },
	vendedor: String,
	telefono: String,
	vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendedores', required: true },
});

const VendedorSchema = new mongoose.Schema({
	nombre: String,
	telefono: String,
	email: String,
	password: String,

	pais: String,
	ciudad: String,
	moneda: String,

	activo: { type: Boolean, default: true },
});


app.post('/subir-imagen', upload.single('imagen'), (req, res) => {
	try{
		res.json({ url: req.file.path }); // 🔥 URL de Cloudinary
	}catch(error){
		res.status(500).json({ error: 'Error subiendo imagen' });
	}
});

app.post("/registro-vendedor", async (req,res)=>{
	try{
		const { ciudad, pais, nombre, phone, email, password } = req.body;
		const existe = await Vendedor.findOne({ email });
		if(existe){
			return res.status(400).json({ mensaje:"Email ya registrado" });
		}

		const hash = await bcrypt.hash(password,10);
		const nuevoVendedor = new Vendedor({
			nombre,
			telefono: phone,
			email,
			password: hash,
			ciudad,
			pais,
		});
		await nuevoVendedor.save();
		res.json({ mensaje:"Usuario creado" });
	}catch(error){
		console.error(error);
		res.status(500).json({ mensaje:"Error al registrar" });
	}
});

app.post("/login-vendedor", async (req,res)=>{
	try {
		const { email, password } = req.body;
		const vendedor = await Vendedor.findOne({ email });
		
		if(!vendedor) return res.status(404).json({ mensaje:"Usuario no encontrado" });

		const valido = await bcrypt.compare(password, vendedor.password);
		if(!valido) return res.status(401).json({ mensaje:"Contraseña incorrecta" });

		const token = jwt.sign({ id: vendedor._id }, process.env.JWT_SECRET, { expiresIn:"7d" });

		// Enviamos el nombre de vuelta junto con el token
		res.json({ token, nombre: vendedor.nombre }); 
	} catch(error) {
		res.status(500).json({ mensaje:"Error en login" });
	}
});

const Vendedor = mongoose.model('vendedores', VendedorSchema);
const ProductoNuevo = mongoose.model("nuevos", ProductoSchema);
const ProductoUsado = mongoose.model("usados", ProductoSchema);
const ProductoServicio = mongoose.model("servicios", ProductoSchema);

const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN
});

const protegerRuta = (req, res, next) =>{
	const token = req.headers['authorization'];

	if(!token){
		return res.status(403).json({ mesaje: 'NO TIENES PERMISO (Token faltante)' });
	}

	try{
		const verificado = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verificado;
		next();
	}catch(error){
		res.status(401).json({ mensaje: 'Token inválido o expirado' });
	}
};

function auth(req, res, next){
	const header = req.headers.authorization;

	if(!header){
		return res.status(401).json({ error: "No autorizado" });
	}

	const token = header.split(" ")[1];

	try{
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.usuario = decoded;
		next();
	}catch(error){
		return res.status(401).json({ error: "Token inválido" });
	}
}

function crearRutas(tipo, Modelo){
	app.get(`/${tipo}`, async (req, res) =>{
		try{
			const { pais } = req.query;

			let filtro = { aprobado: true, estado: "disponible" };

			if(req.query.aprobado !== undefined){
				filtro.aprobado = req.query.aprobado === 'true';
			} else {
				filtro.aprobado = true; // por defecto solo visibles
			}

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

app.get('/mis-productos/:tipo', auth, async (req, res) => {
    try{
        const { tipo } = req.params;

        const modelos = {
            "productos-nuevos": ProductoNuevo,
            "productos-usados": ProductoUsado,
            "productos-servicios": ProductoServicio
        };

        const Modelo = modelos[tipo];

        if(!Modelo){
            return res.status(400).json({ error: "Tipo inválido" });
        }

        const productos = await Modelo.find({
            vendedorId: req.usuario.id
        }).sort({ fecha: -1 });

        res.json(productos);

    }catch(error){
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

	app.post(`/${tipo}`, auth, async (req,res)=>{
		try{
			const producto = new Modelo({
				...req.body,
				vendedorId: req.usuario?.id || null
			});

			await producto.save();

			res.json({ message: "producto creado" });

		}catch(error){
			console.error(error);
			res.status(500).json({ error: "Error al crear producto" });
		}
	});

	app.post('/acceso', (req, res) => {
		const { pass } = req.body;

		if(pass === process.env.PASSWORD){
			const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });

			res.json({ ok:true, token });
		}else{
			res.status(401).json({ ok: false, mensaje: 'Password incorrecto' });
		}
	});

	app.post(`/${tipo}/visita/:id`, async (req, res) => {
		try{
			const { id } = req.params;
			const producto = await Modelo.findByIdAndUpdate(id, { $inc: { visitas: 1 } });
			res.json({ ok: true, visitas: producto.visitas });
		}catch(error){
			console.error("Error al registrar visita:", error);
			res.status(500).json({ error: "no se pudo registrar la visita" });
		}
	});
}

app.put('/aprobar-producto/:tipo/:id', auth, async (req, res) => {
	try{
		const { tipo, id } = req.params;

		const modelos = {
			"nuevo": ProductoNuevo,
			"usado": ProductoUsado,
			"servicio": ProductoServicio,
			"productos-nuevos": ProductoNuevo,
			"productos-usados": ProductoUsado,
			"productos-servicios": ProductoServicio
		};

		const Modelo = modelos[tipo];

		if(!Modelo){
			return res.status(400).json({ error: "Tipo inválido" });
		}

		await Modelo.findByIdAndUpdate(id, { aprobado: true });

		res.json({ ok: true, mensaje: "Producto aprobado" });

	}catch(error){
		console.error(error);
		res.status(500).json({ error: "Error al aprobar" });
	}
});

app.put('/rechazar-producto/:tipo/:id', auth, async (req, res) => {
	try{
		const { tipo, id } = req.params;

		const modelos = {
			"nuevo": ProductoNuevo,
			"usado": ProductoUsado,
			"servicio": ProductoServicio,
			"productos-nuevos": ProductoNuevo,
			"productos-usados": ProductoUsado,
			"productos-servicios": ProductoServicio
		};

		const Modelo = modelos[tipo];

		await Modelo.findByIdAndUpdate(id, {
			aprobado: false,
			rechazado: true
		});

		res.json({ ok: true });

	}catch(error){
		res.status(500).json({ error: "Error al rechazar" });
	}
});

app.put('/vender/:tipo/:id', auth, async (req, res) => {
	try{
		const { tipo, id } = req.params;
		const { cantidadVendida } = req.body;

		const modelos = {
			"nuevo": ProductoNuevo,
			"usado": ProductoUsado,
			"servicio": ProductoServicio,
			"productos-nuevos": ProductoNuevo,
			"productos-usados": ProductoUsado,
			"productos-servicios": ProductoServicio
		};

		const Modelo = modelos[tipo];

		if(!Modelo){
			return res.status(400).json({ error: "Tipo inválido" });
		}

		const producto = await Modelo.findById(id);

		if(!producto){
			return res.status(404).json({ error: "Producto no encontrado" });
		}

		if(producto.cantidad < cantidadVendida){
			return res.status(400).json({ error: "Stock insuficiente" });
		}

		producto.cantidad -= cantidadVendida;

		if(producto.cantidad === 0){
			producto.estado = "sin_stock";
		}

		await producto.save();

		res.json({ ok: true });

	}catch(error){
		console.error(error);
		res.status(500).json({ error: "Error en venta" });
	}
	console.log("TIPO RECIBIDO:", tipo);
});

// Ruta genérica para marcar como vendido o agotar stock
app.put('/marcar-vendido/:tipo/:id', auth, async (req, res) => {
	try {
		const { tipo, id } = req.params;
		const modelos = {
			"nuevo": ProductoNuevo,
			"usado": ProductoUsado,
			"servicio": ProductoServicio,
			"productos-nuevos": ProductoNuevo,
			"productos-usados": ProductoUsado,
			"productos-servicios": ProductoServicio
		};

		const Modelo = modelos[tipo];
		if (!Modelo) return res.status(400).json({ error: "Tipo inválido" });

		// Al marcar como vendido, ponemos cantidad en 0 y cambiamos el estado
		await Modelo.findByIdAndUpdate(id, { 
			estado: "vendido",
			cantidad: 0 
		});

		res.json({ ok: true, mensaje: "Producto marcado como vendido" });
	} catch (error) {
		res.status(500).json({ error: "Error al actualizar estado" });
	}
});

// Ruta genérica para reponer stock
app.put('/reponer/:tipo/:id', auth, async (req, res) => {
	try {
		const { tipo, id } = req.params;
		const { cantidad } = req.body;
		const modelos = {
			"nuevo": ProductoNuevo,
			"usado": ProductoUsado,
			"servicio": ProductoServicio,
			"productos-nuevos": ProductoNuevo,
			"productos-usados": ProductoUsado,
			"productos-servicios": ProductoServicio
		};

		const Modelo = modelos[tipo];
		if (!Modelo) return res.status(400).json({ error: "Tipo inválido" });

		await Modelo.findByIdAndUpdate(id, { 
			cantidad: Number(cantidad),
			estado: "disponible" 
		});

		res.json({ ok: true, mensaje: "Stock actualizado" });
	} catch (error) {
		res.status(500).json({ error: "Error al reponer stock" });
	}
});

crearRutas("productos-nuevos", ProductoNuevo);
crearRutas("productos-usados", ProductoUsado);
crearRutas("productos-servicios", ProductoServicio);

app.get("/", (req, res) => {
	res.send("Servidor funcionando correctamente");
});

app.get((req, res) => {
	res.status(404).sendFile(__dirname + '/src/html/404.html');
});

app.post('/crear_preferencia', async (req, res) => {
	try{
		const { carrito } = req.body;

		if(!carrito || carrito.length === 0){
			return res.status(400).json({ error: 'Carrito vacío' });
		}

		const items = carrito.map(item => ({
			title: item.nombre,
			quantity: item.cantidad,
			unit_price: item.precio,
		}));

		const preference = await new Preference(client).create({
			body: {
				items,
				back_urls: {
					success: 'https://appdeventas.netlify.app/exito',
					failure: 'https://appdeventas.netlify.app/error',
				},
				auto_return: 'approved'
			},
		});

		res.json({ id: preference.id });
		
	} catch (error) {
		console.error('Error creando preferencia: ', error);
		res.status(500).json({ error: 'No se pudo crear la preferencia' });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));