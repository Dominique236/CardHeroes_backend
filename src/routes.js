const Router = require('koa-router');
const personajes = require('./routes/personajes');
const usuarios = require('./routes/usuarios');
const cartas = require('./routes/cartas');
const esperas = require('./routes/esperas');
const jugadores = require('./routes/jugadores');
const partidas = require('./routes/partidas');
const jugadas = require('./routes/jugadas');
const atacados = require('./routes/atacados');
const progresos = require('./routes/progresos');

const authRoutes = require('./routes/authentication.js')
const dotenv = require('dotenv');
const jwtMiddleware = require('koa-jwt');
const scopeProtectedRoutes = require('./routes/scopeExample.js')

dotenv.config();

const router = new Router();

router.use('/personajes', personajes.routes());
router.use('/usuarios', usuarios.routes());
router.use("/cartas", cartas.routes());
router.use("/esperas", esperas.routes());
router.use("/jugadores", jugadores.routes());
router.use("/partidas", partidas.routes());
router.use("/jugadas", jugadas.routes());
router.use("/atacados", atacados.routes());
router.use("/progresos", progresos.routes());
router.use(authRoutes.routes());
// Desde esta línea, todas las rutas requieren un JWT
router.use(jwtMiddleware( { secret: process.env.JWT_SECRET } ));
router.use('/scope-example', scopeProtectedRoutes.routes())

module.exports = router;