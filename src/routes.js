const Router = require('koa-router');
const personajes = require('./routes/personajes');
const usuarios = require('./routes/usuarios');

const router = new Router();

router.use('/personajes', personajes.routes());
router.use('/usuarios', usuarios.routes());

module.exports = router;