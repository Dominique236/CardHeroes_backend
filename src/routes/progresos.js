const Router = require('koa-router');

const router = new Router();

// Asigna dos cartas al azar a un jugador, revisa que no pertenezcan a oponente
router.post("progresos.create", "/:nombre/:oponente", async (ctx) => {   
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
        // Encuentra al jugador del oponente
        const oponente = await ctx.orm.Jugador.findOne({
            where: {id: ctx.params.oponente}
        });
        if (!oponente) {
            ctx.status = 404;
            ctx.body = { error: "Oponente no encontrado." };
            return;
        }
        // **Debe obtener 2 cartas, no solo 1
        // Encuentra todas las cartas posibles a obtener
        const cartas = await ctx.orm.Carta.findAll();
        // Barajar las cartas al azar
        const shuffledCartas = cartas.sort(() => 0.5 - Math.random());
        const cartasGanadas = [];
        // Iterar sobre las cartas barajadas para encontrar una válida
        for (const carta of shuffledCartas) {
            if (cartasGanadas.length >= 2) break;
            const cartaJugador = await ctx.orm.CartaJugador.findOne({
                where: { jugadorId: usuario.id, cartaId: carta.id },
            });
            const cartaOponente = await ctx.orm.CartaJugador.findOne({
                where: { jugadorId: oponente.id, cartaId: carta.id },
            });
            // Si la carta no pertenece ni al jugador ni al oponente, es válida
            if (!cartaJugador && !cartaOponente) {
                cartasGanadas.push(carta);
            }
        }
        // Asigna las cartas ganadas al jugador
        for (const carta of cartasGanadas) {
            await ctx.orm.CartaJugador.create({
                jugadorId: jugador.id,
                cartaId: carta.id,
            });
        }

        // Responder con la jugada actualizada
        ctx.body = { message: "Completaste el progreso. Se te asignaron 2 cartas nuevas." };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;