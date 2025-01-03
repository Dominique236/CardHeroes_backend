const Router = require('koa-router');

const router = new Router();

// Entregar todos los usuarios
// respuesta: los usuarios encontrados
router.get("usuarios.list", "/", async (ctx) => {
    try{
        const usuarios = await ctx.orm.Usuario.findAll();
        ctx.body = usuarios;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entregar un usuario, según su parametro id entregado en la ruta
// respuesta: el usuarios encontrado 
router.get("usuario.showById", "/id/:id", async (ctx) => {
    try{
        const usuario = await ctx.orm.Usuario.findOne({where:{id:ctx.params.id}});
        ctx.body = usuario;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Entregar un usuario, según su parametro correo entregado en la ruta
// respuesta: el usuario encontrado 
router.get("usuario.showByCorreo", "/correo/:correo", async (ctx) => {
    try {
        const usuario = await ctx.orm.Usuario.findOne({ where: { correo: ctx.params.correo } });
        if (usuario) {
            ctx.body = usuario;
            ctx.status = 200;
        } else {
            ctx.status = 404; // Usuario no encontrado
            ctx.body = { message: 'Usuario no encontrado' };
        }
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;