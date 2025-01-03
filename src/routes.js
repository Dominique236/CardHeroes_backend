const Router = require('koa-router');
const personajes = require('./routes/personajes');
const usuarios = require('./routes/usuarios');
const cartas = require('./routes/cartas');

const authRoutes = require('./routes/authentication.js')
const dotenv = require('dotenv');
const jwtMiddleware = require('koa-jwt');
const scopeProtectedRoutes = require('./routes/scopeExample.js')

dotenv.config();

const router = new Router();

router.use('/personajes', personajes.routes());
router.use('/usuarios', usuarios.routes());
router.use("/cartas", cartas.routes());
router.use(authRoutes.routes());
// Desde esta línea, todas las rutas requieren un JWT
router.use(jwtMiddleware( { secret: process.env.JWT_SECRET } ));
router.use('/scope-example', scopeProtectedRoutes.routes())

module.exports = router;