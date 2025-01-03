const Router = require('koa-router');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const router = new Router();

router.post("authentication.signup", "/signup", async (ctx) => {
    const authInfo = ctx.request.body;
    let user = await ctx.orm.Usuario.findOne({ where: { correo: authInfo.correo } })
    if (user) {
        ctx.body = `El usuario con correo '${authInfo.correo}' ya existe`;
        ctx.status = 400;
        return;
    }
    user = await ctx.orm.Usuario.findOne({ where: { nombre: authInfo.nombre } })
    if (user) {
        ctx.body = `El usuario con nombre '${authInfo.nombre}' ya existe`;
        ctx.status = 400;
        return;
    }
    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(authInfo.contrasena, saltRounds);

        user = await ctx.orm.Usuario.create({
            nombre: authInfo.nombre,
            correo: authInfo.correo,
            contrasena: hashPassword,
            victorias: 0
        })
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
        return;
    }
    ctx.body = {
        nombre: user.nombre,
        correo: user.correo
    };
    ctx.status = 201;
})

router.post("authentication.login", "/login", async (ctx) => {
    let user;
    const authInfo = ctx.request.body
    try {
        user = await ctx.orm.Usuario.findOne({where:{correo:authInfo.correo}});
    }
    catch(error) {
        ctx.body = error;
        ctx.status = 400;
        return;
    }
    if (!user) {
        ctx.body = `El usuario con correo '${authInfo.correo}' no fue encontrado`;
        ctx.status = 400;
        return;
    }
    console.log(user.contrasena)
    console.log(authInfo.contrasena)

    const validPassword = await bcrypt.compare(authInfo.contrasena, user.contrasena);

    if (validPassword) {
        ctx.body = {
            nombre: user.nombre,
            correo: user.correo,
        };
        ctx.status = 200;
    } else {
        ctx.body = "Contraseña incorrecta :(";
        ctx.status = 400;
        return;
    }
    // Creamos el JWT
    const expirationSeconds = 1 * 60 * 60 * 24;
    const JWT_PRIVATE_KEY = process.env.JWT_SECRET;
    var token = jwt.sign(
        { scope: ['user'] },
        JWT_PRIVATE_KEY,
        { subject: user.id.toString() },
        { expiresIn: expirationSeconds }
    );
    ctx.body = {
    "access_token": token,
    "token_type": "Bearer",
    "expires_in": expirationSeconds,
    }
    ctx.status = 200;
})

module.exports = router;