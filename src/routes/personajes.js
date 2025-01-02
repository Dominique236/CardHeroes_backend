const Router = require('koa-router');

const router = new Router();

// Entregar un personaje, según su parametro id entregado en la ruta
// respuesta: el personaje (id exite) o error (id no existe)
router.get("personajes.show", "/:id", async (ctx) => {
    try{
        const personaje = await ctx.orm.Personaje.findOne({where:{id:ctx.params.id}});
        ctx.body = personaje;
        ctx.status = 200;
    } catch {
        ctx.body = { message: "El personaje no existe" };
        ctx.status = 404;
    }
});

// Entregar todos los personajes
// respuesta: los personajes encontrados
router.get("personajes.list", "/", async (ctx) => {
    try{
        const personajes = await ctx.orm.Personaje.findAll();
        ctx.body = personajes;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
        console.log(error)
    }
});

// Entregar todos los personajes no disponibles para el jugador con nombre :nombre (ya elegidos)
// respuesta: los personajes no disponibles
router.get("personajes.list", "/nodisponibles/:nombre", async (ctx) => {
    try{
        // Encuentra al usuario con ese nombre
        const usuario = await ctx.orm.Usuario.findOne({
            where: {
            nombre: ctx.params.nombre
            }
        });
        // Encuentra al jugador de ese usuario
        const jugador = await ctx.orm.Jugador.findOne({
            where: {
            usuarioId: usuario.id
            }
        });
        // Encuentra todos los jugadores de esa partida
        const todosJugadores = await ctx.orm.Jugador.findAll({
            where: {partidaId:jugador.partidaId}
        });
        // Filtra los jugadores cuyo arcanoId no sea null
        const jugadoresConArcano = todosJugadores.filter(jugador => jugador.arcanoId !== null);
        // Itera sobre los jugadores filtrados y encuentra los personajes correspondientes
        const personajes = await Promise.all(jugadoresConArcano.map(async (jugador) => {
            const personaje = await ctx.orm.Personaje.findOne({
                where: { id: jugador.arcanoId }
            });
            return personaje;
        }));
        console.log('Arcanos no disponibles:',personajes);
        ctx.body = personajes;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
        console.log(error)
    }
});

module.exports = router;