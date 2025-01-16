const Router = require('koa-router');

const router = new Router();

// Entrega al jugador de un usuario si es que lo tiene
// respuesta: el jugador encontrado
router.get("jugadores.find", "/find/:nombre", async (ctx) => {
    try{
        let encontrado = true
        // Encuentra al usuario con ese nombre
        const usuario = await ctx.orm.Usuario.findOne({
            where: {nombre: ctx.params.nombre}
        });
        // Encuentra al jugador de ese usuario
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId: usuario.id}
        });
        if (!jugador) {
            encontrado = false
        }
        ctx.body = {encontrado: encontrado};
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Crear un Jugador, según los datos necesarios entregados en el body
// respuesta: partida nueva creada
router.post("jugadores.create", "/:nombre/:partida_id/:arcano_id", async (ctx) => {   
    try{
        // Encuentra el usuario que coincide con su nombre 
        const usuario = await ctx.orm.Usuario.findOne({
            where: {nombre:ctx.params.nombre}
        });
        if (!usuario) {
            console.log(`User with name ${ctx.params.nombre} not found`);
            ctx.body = { error: "Usuario no encontrado" };
            ctx.status = 404;
            return;
        }
        const jugadors = await ctx.orm.Jugador.create({
            usuarioId: usuario.id,
            partidaId:ctx.params.partida_id,
            personajeId:ctx.params.arcano_id,
            vidas: 3,
            estrellas: 0,
            atacado: false
        });
        
        ctx.body = jugadors;
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entrega los jugadores
// respuesta: el jugador encontrado
router.get("jugadores.find", "/find/:nombre/:oponente", async (ctx) => {
    try{     
        // jugador info de nombre
        // player info del oponente   

        // Encuentra el usuario de ese jugador
        const usuario = await ctx.orm.Usuario.findOne({
            where: {nombre: ctx.params.nombre}
        });
        if (!usuario) {
            ctx.status = 404;
            ctx.body = { message: "Usuario no encontrado" };
            return;
        }  
        // Encuentra al jugador de ese usuario
        const jugador = await ctx.orm.Jugador.findOne({
            where:{usuarioId:usuario.id},
            include: [
                {
                    model: ctx.orm.Usuario,
                    attributes: ['nombre']
                }, 
                {
                    model: ctx.orm.Personaje,
                    attributes: ['nombre', 'descripcion_habilidad']
                }
            ]
        })
        console.log('Jugador encontrado:');
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { message: "Jugador no encontrado" };
            return;
        }
        // Encuentra al oponente
        const oponente = await ctx.orm.Jugador.findOne({
            where:{id:ctx.params.oponente},
            include: [
                {
                    model: ctx.orm.Usuario,
                    attributes: ['nombre']
                }, 
                {
                    model: ctx.orm.Personaje,
                    attributes: ['nombre']
                }
            ]
        })
        if (!oponente) {
            ctx.status = 404;
            ctx.body = { message: "Oponente no encontrado" };
            return;
        }
        const jugadorActual = {
            id_jugador: jugador.id,
            nombre: jugador.Usuario.nombre,
            nombre_arcano: jugador.Personaje.nombre,
            descripcion_habilidad: jugador.Personaje.descripcion_habilidad,
            vidas: jugador.vidas,
            estrellas: jugador.estrellas,
            atacado: jugador.atacado
        };
        const oponenteActual = {
            id_jugador: oponente.id,
            nombre: oponente.Usuario.nombre,
            nombre_arcano: oponente.Personaje.nombre,
            descripcion_habilidad: oponente.Personaje.descripcion_habilidad,
            vidas: oponente.vidas,
            estrellas: oponente.estrellas,
            atacado: oponente.atacado
        };
        ctx.body = {
            jugador: jugadorActual,
            oponente: oponenteActual
        };
        ctx.status = 200;
    } catch(error){
        ctx.body = {
            message: "Error al entregar jugadores.",
            error: error.message || "Ocurrió un error inesperado."
        };
        ctx.status = 400;
    }
});

module.exports = router;