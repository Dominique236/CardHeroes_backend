const Router = require('koa-router');

const router = new Router();

// Revisa si el jugador con nombre :nombre fue atacado
router.get("atacados", "/:nombre", async (ctx) => {
    try{       
        // Encuentra al usuario con ese nombre
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
            where:{usuarioId:usuario.id}
        })
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { message: "Jugador no encontrado" };
            return;
        }
        // Verifica si el jugador fue atacado
        if (jugador.atacado) {
            // Actualiza el estado de atacado a false
            await jugador.update({ atacado: false });
            ctx.body = { atacado: true };
        } else {
            ctx.body = { atacado: false };
        }
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;