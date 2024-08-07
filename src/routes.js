const Router = require('koa-router');
const personajes = require('./routes/personajes');
const usuarios = require('./routes/usuarios');
const cartas = require('./routes/cartas');

const router = new Router();

router.use('/personajes', personajes.routes());
router.use('/usuarios', usuarios.routes());
router.use("/cartas", cartas.routes());

module.exports = router;