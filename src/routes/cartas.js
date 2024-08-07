const Router = require('koa-router');

const router = new Router();

// Al seleccionar una carta se muestra su tipo y nivel.
// Entrega nivel de la carta y nombre del elemento, según su parametro id entregado en la ruta
router.get("carta.show", "/:id", async (ctx) => {
    try {
        // Encuentra la carta que coincide con el id 
        const carta = await ctx.orm.Carta.findOne({
            where: {id:ctx.params.id},
            include: [{
                model: ctx.orm.Elemento
            }]// Incluye el modelo de Elemento para obtener su nombre
        });

        if (!carta) {
            ctx.status = 404;
            ctx.body = { message: "Carta no encontrada" };
        }

        const { nivel, Elemento: { nombre: nombreElemento } } = carta;
        ctx.body = { nivel, nombreElemento };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// REVISAR: esta asignando el id del arcano tambien
// Asignar las cartas a los jugadores, según el id de la partida
router.post("cartas.create", "/:nombre/:id_arcano", async (ctx) => {   
    try{
        // Encuentra al usuario con ese nombre
        const usuario = await ctx.orm.Usuario.findOne({
            where: {
            nombre: ctx.params.nombre
            }
        });
        if (!usuario) {
            console.log(`usuario no encontrado`);
            ctx.body = { error: "Usuario no encontrado" };
            ctx.status = 404;
            return;
        }
        // Encuentra al jugador de ese usuario
        const jugador = await ctx.orm.Jugador.findOne({
            where: {
                usuarioId: usuario.id
            }
        });
        if (!jugador) {
            console.log(`jugador no encontrado`);
            ctx.body = { error: "Jugador no encontrado" };
            ctx.status = 404;
            return;
        }
        // Asignar arcano al jugador
        if (jugador) {
            jugador.arcanoId = ctx.params.id_arcano;
            await jugador.save();
        }
        // Encuentra la partida de ese jugador
        const partida = await ctx.orm.Partida.findOne({
            where: {id:jugador.partidaId}
        });

        if (!partida) {
            console.log(`Partida con id ${partida.id} no encontrada`);
            ctx.body = { error: "Partida no encontrada" };
            ctx.status = 404;
            return;
        }
        // Encuentra todos los jugadores de esa partida
        const jugadores = await ctx.orm.Jugador.findAll({
            where: {partidaId:partida.id}
        });
        const jugadorConCartas = await ctx.orm.CartaJugador.findOne({
            where: {jugadorId:jugador.id}
        });
        if (jugadorConCartas) {
            ctx.body = {
                message: "Las cartas fueron asignadas anteriormente"
            };
            ctx.status = 205;
        } else {
            // Encuentra todas las cartas posibles a obtener
            const cartas = await ctx.orm.Carta.findAll();
            const shuffledCartas = cartas.sort(() => 0.5 - Math.random()); //baraja las cartas de forma aleatoria

            // Asignar a cada jugador 6 cartas al azar (relación CartaJugador) 
            const cartasPorJugador = 6;
            const cartasJugadorCreadas = [];
            
            for (const jugador of jugadores) {
                // Obtener las cartas necesarias para el jugador
                const cartasParaJugador = shuffledCartas.splice(0, cartasPorJugador);
                for (const carta of cartasParaJugador) {
                    const cartaJugador = await ctx.orm.CartaJugador.create({
                        jugadorId: jugador.id,
                        cartaId: carta.id
                    });
                    cartasJugadorCreadas.push(cartaJugador);
                }
            }
            
            // Respuesta
            ctx.body = {
                message: "Se asignaron correctamente las cartas",
                cartasJugador: cartasJugadorCreadas,
                cartasPartida: cartasPartidaCreadas
            };
            ctx.status = 201;
        }
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Encuentra las cartas de un jugador según su nombre
router.get("cartas.find", "/find/:nombre", async (ctx) => {
    try {
        // Encuentra el usuario con ese nombre 
        const usuario = await ctx.orm.Usuario.findOne({
            where: {
              nombre: ctx.params.nombre
            }
        });
        if (!usuario) {
            ctx.status = 404;
            ctx.body = { message: "Usuario no encontrado" };
            return;
        }
        // Encuentra el jugador
        const jugador = await ctx.orm.Jugador.findOne({
            where: {
              usuarioId: usuario.id
            }
        });
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { message: "Jugador no encontrado" };
            return;
        }
        // Encuentra todas las cartas de ese jugador
        const cartasJugador = await ctx.orm.CartaJugador.findAll({
            where: {jugadorId:jugador.id},
            include: [{
                model: ctx.orm.Carta
            }]// Incluye el modelo de Elemento para obtener su nombre
        });

        if (!cartasJugador) {
            ctx.status = 404;
            ctx.body = { message: "El usuario no tiene cartas" };
            return;
        }

        // Mapear las cartas encontradas al formato deseado
        const cartas = cartasJugador.map(cartaJugador => ({
            elementoId: cartaJugador.Cartum.elementoId, //No se porque lo devuelve así, lo revise en postman y esta bien
            cartaId: cartaJugador.Cartum.id,
            nivel: cartaJugador.Cartum.nivel
        }));

        ctx.body = {
            message: "Mira tus cartas obtenidas!",
            cartas: cartas
        };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;