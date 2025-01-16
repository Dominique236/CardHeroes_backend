const Router = require('koa-router');

const router = new Router();

// Entrega la jugada de un usuario según su nombre
// respuesta: las cartas de la jugada encontrada 
router.get("jugadas.find", "/find/:nombre", async (ctx) => {
    try{
        // Encuentra al usuario con ese nombre
        const usuario = await ctx.orm.Usuario.findOne({
            where: {nombre: ctx.params.nombre}
        });
        // Encuentra la jugada de ese usuario
        const jugada = await ctx.orm.Jugada.findOne({
            where: {jugadorId: usuario.id}
        });
        if (!jugada) {
            ctx.status = 404;
            ctx.body = { error: "Jugada no encontrada." };
            return;
        }        
        if (jugada.carta_1) {
            // Encuentra la carta_1 de esa jugada
            const carta_1 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_1}
            });
            // Encuentra la carta_2 de esa jugada
            const carta_2 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_2}
            });
            // Encuentra la carta_3 de esa jugada
            const carta_3 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_3}
            });

            ctx.body = {
                carta_1: carta_1,
                carta_2: carta_2,
                carta_3: carta_3
            };
        } else {
            ctx.body = {
                carta_1: null,
                carta_2: null,
                carta_3: null
            };
        }
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entrega la jugada de un jugador según su id
// respuesta: las cartas de la jugada encontrada 
router.get("jugadas.show", "/:id", async (ctx) => {
    try{
        // Encuentra al jugador con ese id
        const jugador = await ctx.orm.Jugador.findOne({
            where: {id: ctx.params.id}
        });
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { error: "Jugador no encontrado para este usuario." };
            return;
        }
        // Encuentra al usuario de ese jugador
        const usuario = await ctx.orm.Usuario.findOne({
            where: {id: jugador.usuarioId}
        });
        if (!usuario) {
            ctx.status = 404;
            ctx.body = { error: "Uusario no encontrado." };
            return;
        }
        // Encuentra la jugada de ese jugador
        const jugada = await ctx.orm.Jugada.findOne({
            where: {jugadorId: usuario.id}
        });
        if (!jugada) {
            ctx.status = 404;
            ctx.body = { error: "Jugada oponente no encontrada." };
            return;
        } 
        if (jugada.carta_1) {
            // Encuentra la carta_1 de esa jugada
            const carta_1 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_1}
            });
            // Encuentra la carta_2 de esa jugada
            const carta_2 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_2}
            });
            // Encuentra la carta_3 de esa jugada
            const carta_3 = await ctx.orm.Carta.findOne({
                where: {id: jugada.carta_3}
            });

            ctx.body = {
                carta_1: carta_1,
                carta_2: carta_2,
                carta_3: carta_3
            };
        } else {
            ctx.body = {
                carta_1: null,
                carta_2: null,
                carta_3: null
            };
        }
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Guardar jugada de un jugador según su nombre
// Ej: si ronda es 2: actualizar jugada.carta_2 por ctx.params.carta
router.post("jugadas.create", "/:nombre/:ronda/:carta", async (ctx) => {   
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
        // Encuentra el usuario que coincide con su nombre 
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId:usuario.id}
        });
        // Encuentra la jugada de ese usuario
        const jugada = await ctx.orm.Jugada.findOne({
            where: {jugadorId: usuario.id}
        });
        if (!jugada) {
            ctx.status = 404;
            ctx.body = { error: "Jugada no encontrada." };
            return;
        } 
        // Validar que la ronda sea válida
        const ronda = parseInt(ctx.params.ronda, 10);
        if (ronda < 1 || ronda > 3) {
            ctx.status = 400;
            ctx.body = { error: "Número de ronda inválido. Debe ser 1, 2 o 3." };
            return;
        }
        // Actualizar la ronda en la jugada
        jugada.ronda = ronda; 
        // Determinar qué campo de carta actualizar
        const campoCarta = `carta_${ronda}`;
        const nuevaCarta = parseInt(ctx.params.carta, 10);
        // Actualizar el campo correspondiente
        jugada[campoCarta] = nuevaCarta;
        await jugada.save();
        // Eliminar cartaJugador
        await ctx.orm.CartaJugador.destroy({
            where: {
                cartaId: nuevaCarta,
                jugadorId: jugador.id
            }
        })
        // Responder con la jugada actualizada
        ctx.body = { jugada };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Consulta si jugador ya hizo su jugada en cierta ronda
router.get("jugadas.check", "/check/:id/:ronda", async (ctx) => {
    try{
        // Encuentra al jugador con ese id
        const jugador = await ctx.orm.Jugador.findOne({
            where: {id: ctx.params.id}
        });
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { error: "Jugador no encontrado para este usuario." };
            return;
        }
        // Encuentra al usuario de ese jugador
        const usuario = await ctx.orm.Usuario.findOne({
            where: {id: jugador.usuarioId}
        });
        if (!usuario) {
            ctx.status = 404;
            ctx.body = { error: "Uusario no encontrado." };
            return;
        }
        // Encuentra la jugada de ese jugador
        const jugada = await ctx.orm.Jugada.findOne({
            where: {jugadorId: usuario.id}
        });
        if (!jugada) {
            ctx.status = 404;
            ctx.body = { error: "Jugada oponente no encontrada." };
            return;
        } 
        // Validar que la ronda sea válida
        const ronda = parseInt(ctx.params.ronda, 10);
        if (ronda < 1 || ronda > 3) {
            ctx.status = 400;
            ctx.body = { error: "Número de ronda inválido. Debe ser 1, 2 o 3." };
            return;
        }
        // Determinar qué campo de carta actualizar
        const campoCarta = `carta_${ronda}`;
        const cartaId = jugada[campoCarta];
        // Si no hay carta (null), devolver false
        if (cartaId === null) {
            ctx.body = { jugadaHecha: false };
            ctx.status = 200;
            return;
        }
        // Buscar la carta por su id
        const carta = await ctx.orm.Carta.findOne({
            where: { id: cartaId }
        });
        // Si no se encuentra la carta
        if (!carta) {
            ctx.status = 404;
            ctx.body = { error: "Carta no encontrada." };
            return;
        }
        // Devolver la información de la carta
        ctx.body = { jugadaHecha: true, carta };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Fin de jugada (3 rondas terminadas)
router.patch("jugadas.fin", "/fin/:nombre/:gano", async (ctx) => {   
    try{
        // Encuentra el usuario que coincide con su nombre 
        const usuario = await ctx.orm.Usuario.findOne({
            where: {nombre: ctx.params.nombre}
        });
        if (!usuario) {
            console.log(`User with name ${ctx.params.nombre} not found`);
            ctx.body = { error: "Usuario no encontrado" };
            ctx.status = 404;
            return;
        }
        // Encuentra la jugada de ese usuario
        const jugada = await ctx.orm.Jugada.findOne({
            where: {jugadorId: usuario.id}
        });
        if (!jugada) {
            ctx.status = 404;
            ctx.body = { error: "Jugada no encontrada." };
            return;
        } 
        // Reiniciar Jugada y setear ronda en 1
        jugada.ronda = 1;
        jugada.carta_1 = null;
        jugada.carta_2 = null;
        jugada.carta_3 = null;
        await jugada.save();
        // Si gano es true jugador.estrellas += 1, si es false jugador.vidas -= 1
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId:usuario.id}
        });
        const gano = ctx.params.gano === "true"; // Convertir string a boolean
        if (gano) {
            jugador.estrellas += 1;
        } else {
            jugador.vidas -= 1;
        }
        await jugador.save();

        ctx.body = { jugada };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;