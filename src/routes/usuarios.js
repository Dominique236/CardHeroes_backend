const Router = require('koa-router');

const router = new Router();

// Crear usuario
router.post("usuarios.create","/",async(ctx)=>{
    try{
        const usuario = await ctx.orm.Usuario.create(ctx.request.body);
        ctx.body = usuario;
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

// Buscar todos los usuarios
router.get("usuarios.list","/",async(ctx)=>{
    try{
        const usuarios = await ctx.orm.Usuario.findAll();
        ctx.body = usuarios;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

// Buscar un usuario según su id
router.get("usuario.show","/:id",async(ctx)=>{
    try{
        const usuario = await ctx.orm.Usuario.findOne({where:{id:ctx.params.id}});
        ctx.body = usuario;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})



module.exports = router;