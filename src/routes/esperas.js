const Router = require('koa-router');

const router = new Router();

// Crear uns espera
// respuesta: la nueva espera creado
router.post("esperas.create", "/:nombre", async (ctx) => {
    try{
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // El abecedario en mayúsculas
        let randomIndex1 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
        let randomIndex2 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
        let n1 =  Math.floor(Math.random() * 10); //Genera número aleatorio
        let n2 =  Math.floor(Math.random() * 10); //Genera número aleatorio
        let codigo = alphabet[randomIndex1] + alphabet[randomIndex2] + n1.toString() + n2.toString()
        let espera = await ctx.orm.Espera.findOne({where:{codigo: codigo}});
        while (espera) {
            let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // El abecedario en mayúsculas
            let randomIndex1 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
            let randomIndex2 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
            let n1 =  Math.floor(Math.random() * 10);
            let n2 =  Math.floor(Math.random() * 10);
            let codigo = alphabet[randomIndex1] + alphabet[randomIndex2] + n1.toString() + n2.toString()
            espera = await ctx.orm.Espera.findOne({where:{codigo: codigo}});
        }
        // Creamos instancia de Espera
        const esperafinal = await ctx.orm.Espera.create({codigo: codigo});
        // Creamos instancia de UsuarioEspera con el id anterior
        const usuario = await ctx.orm.Usuario.findOne({where:{nombre:ctx.params.nombre}});
        await ctx.orm.UsuarioEspera.create({
            usuarioId: usuario.id,
            esperaId: esperafinal.id
        })
        // Devolvemos la Espera
        ctx.body = esperafinal;
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entregar una espera, según su parametro codigo entregado en la ruta
// respuesta: la espera (codigo exite) o error (codigo no existe)
router.get("esperas.show", "/:codigo/:nombre", async (ctx) => {
    try{
        const espera = await ctx.orm.Espera.findOne({where:{codigo:ctx.params.codigo}});
        // Creamos instancia de UsuarioEspera con el id anterior
        const usuario = await ctx.orm.Usuario.findOne({where:{nombre:ctx.params.nombre}});
        await ctx.orm.UsuarioEspera.create({
            usuarioId: usuario.id,
            esperaId: espera.id
        })
        // Devolvemos la Espera
        ctx.body = espera;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entregar una espera random
// respuesta: la espera (si hay esperas) o error (no hay esperas)
router.get("esperas.show", "/:nombre", async (ctx) => {
    try{
        // Obtener el número total de registros
        const count = await ctx.orm.Espera.count();
        let espera;
        if (count === 0) {
            try{
                let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // El abecedario en mayúsculas
                let randomIndex1 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
                let randomIndex2 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
                let n1 =  Math.floor(Math.random() * 10); //Genera número aleatorio
                let n2 =  Math.floor(Math.random() * 10); //Genera número aleatorio
                let codigo = alphabet[randomIndex1] + alphabet[randomIndex2] + n1.toString() + n2.toString()
                let espera = await ctx.orm.Espera.findOne({where:{codigo: codigo}});
                while (espera) {
                    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // El abecedario en mayúsculas
                    let randomIndex1 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
                    let randomIndex2 = Math.floor(Math.random() * alphabet.length); // Genera un índice aleatorio
                    let n1 =  Math.floor(Math.random() * 10);
                    let n2 =  Math.floor(Math.random() * 10);
                    let codigo = alphabet[randomIndex1] + alphabet[randomIndex2] + n1.toString() + n2.toString()
                    espera = await ctx.orm.Espera.findOne({where:{codigo: codigo}});
                }
                // Creamos instancia de Espera
                espera = await ctx.orm.Espera.create({codigo: codigo});
                // Devolvemos la Espera
                ctx.body = espera;
                ctx.status = 201;
            } catch(error){
                ctx.body = error;
                ctx.status = 400;
                return;
            }

        } else {
            // Generar un índice aleatorio
            const randomIndex = Math.floor(Math.random() * count);

            // Obtener el registro correspondiente al índice aleatorio
            const esperas = await ctx.orm.Espera.findAll({
                limit: 1,
                offset: randomIndex,
                order: [['id', 'ASC']] // Asegurando que haya un orden para el offset
            });
            espera = esperas[0];
        }

        // Creamos instancia de UsuarioEspera con el id anterior
        const usuario = await ctx.orm.Usuario.findOne({where:{nombre:ctx.params.nombre}});
        await ctx.orm.UsuarioEspera.create({
            usuarioId: usuario.id,
            esperaId: espera.id
        })
        // Devolvemos la Espera
        ctx.body = espera;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete("esperas", "/:nombre", async (ctx) => {
    const transaction = await ctx.orm.sequelize.transaction();
    try {
        const usuario = await ctx.orm.Usuario.findOne({ where: { nombre: ctx.params.nombre } });
        if (!usuario) {
            ctx.body = { error: "Error al buscar el usuario" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        const usuario_espera = await ctx.orm.UsuarioEspera.findOne({ where: { usuarioId: usuario.id } });
        if (!usuario_espera) {
            ctx.body = { error: "Error al buscar el UsuarioEspera" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        const espera = await ctx.orm.Espera.findOne({ where: { id: usuario_espera.esperaId } });
        if (!espera) {
            ctx.body = { error: "Error al obtener la espera" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        await ctx.orm.UsuarioEspera.destroy({ where: { esperaId: espera.id }, transaction });
        console.log("UsuariosEspera eliminados correctamente");

        await espera.destroy({ transaction });
        console.log("Espera eliminada correctamente");

        await transaction.commit();
        ctx.body = { message: "La sala de espera fue eliminada" };
        ctx.status = 200;

    } catch (error) {
        await transaction.rollback();
        console.error("Error durante la eliminación:", error);
        ctx.body = { error: "No es posible eliminar" };
        ctx.status = 400;
    }
});

// Encuentra a todos los usuarios de una espera, segun el codigo de la sala de espera
// Devuelve lista con los nombres de todos los usuarios en la sala de espera
router.get("esperas.users", "/find/users/:codigo", async (ctx) => {
    try{
        // Buscamos la espera con ese codigo
        const espera = await ctx.orm.Espera.findOne({where:{codigo:ctx.params.codigo}});
        if (!espera) {
            ctx.status = 404;
            ctx.body = { message: "Espera no encontrada" };
            return;
        }
        // Buscamos UsuarioEspera
        const usuarioEspera = await ctx.orm.UsuarioEspera.findOne({where:{esperaId:espera.id}});
        if (!usuarioEspera) {
            ctx.status = 404;
            ctx.body = { message: "usuarioEspera no encontrado" };
            return;
        }
        // Encuentra todos los usuarios en esa espera
        const usuariosEsperas = await ctx.orm.UsuarioEspera.findAll({
            where: {esperaId:usuarioEspera.esperaId},
            include: [{
                model: ctx.orm.Usuario,
                attributes: ['nombre']
            }]
        });
        if (!usuariosEsperas) {
            ctx.status = 404;
            ctx.body = { message: "usuariosEsperas no encontrado" };
            return;
        }
        // Devolvemos los nombres de los usuarios, filtrando nombres duplicados
        const nombresUsuarios = [...new Set(usuariosEsperas.map(ue => ue.Usuario.nombre))];

        // Devolvemos lo que nos sirva (quiza solo nombres)
        ctx.body = nombresUsuarios
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;