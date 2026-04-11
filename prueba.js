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

	app.post("/productos", auth, async (req,res)=>{
		const db = client.db("ventas");
		const producto = {
			titulo: req.body.titulo,
			precio: req.body.precio,
			descripcion: req.body.descripcion,
			imagen: req.body.imagen,
			estado: req.body.estado,
			vendedorId: req.usuario.id
		};
		await db.collection("usados").insertOne(producto);
		res.json({message:"producto creado"});
	});

    app.post('/acceso', (req, res) => {
        const { pass } = req.body;

        if(pass === process.env.PASSWORD){
			const token = jwt.sign({ admin: true }, process.env.FIRMA, { expiresIn: '1h' });

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