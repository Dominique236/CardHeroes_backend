const Router = require('koa-router');

const router = new Router();

// Entregar el personaje de un Usuario, según su nombre
// respuesta: el personaje 
router.get("personajes.show", "/:nombre", async (ctx) => {
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
        // Encuentra el jugador que coincide con el id
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId:usuario.id}
        });
        // Encuentra al personaje
        const personaje = await ctx.orm.Personaje.findOne({where:{id:jugador.personajeId}});
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
        const jugadoresConArcano = todosJugadores.filter(jugador => jugador.personajeId !== null);
        // Itera sobre los jugadores filtrados y encuentra los personajes correspondientes
        const personajes = await Promise.all(jugadoresConArcano.map(async (jugador) => {
            const personaje = await ctx.orm.Personaje.findOne({
                where: { id: jugador.personajeId }
            });
            return personaje;
        }));
        ctx.body = personajes;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

// Endpoint para usar habilidad de cada personaje
// Recibe nombre de jugador actual, id del oponente y a quien aplicar (1: a jugador, 2: a oponente)
router.post("personajes.create", "/:nombre/:id_oponente/:accion/:carta", async (ctx) => {   
    try{
        // Convierte ctx.params.accion a un entero
        const accion = parseInt(ctx.params.accion, 10);
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
        // Encuentra el jugador que coincide con el id
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId:usuario.id}
        });
        // Validar oponente
        const oponente = await ctx.orm.Jugador.findOne({ where: { id: ctx.params.id_oponente } });
        if (!oponente) {
            ctx.body = { error: "Oponente no encontrado." };
            ctx.status = 404;
            return;
        }
        // Revisar caso a caso
        if (jugador.personajeId === 3) { // Aeria
            if (accion === 1) { // jugador gana carta al azar
                // Encuentra todas las cartas posibles a obtener
                const cartas = await ctx.orm.Carta.findAll();
                // Barajar las cartas al azar
                const shuffledCartas = cartas.sort(() => 0.5 - Math.random());
                let carta_ganada = null;
                // Iterar sobre las cartas barajadas para encontrar una válida
                for (const carta of shuffledCartas) {
                    const cartaJugador = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: usuario.id, cartaId: carta.id },
                    });
                    const cartaOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: oponente.id, cartaId: carta.id },
                    });
                    // Si la carta no pertenece ni al jugador ni al oponente, es válida
                    if (!cartaJugador && !cartaOponente) {
                        carta_ganada = carta;
                        break;
                    }
                }
                // Verificar si se encontró una carta válida
                if (carta_ganada) {
                    // Asignar carta al jugador
                    await ctx.orm.CartaJugador.create({
                        jugadorId: jugador.id,
                        cartaId: carta_ganada.id,
                    });
                }
            } else { // oponente pierde carta al azar
                // Encuentra todas las cartas posibles a perder
                const cartas = await ctx.orm.CartaJugador.findAll({
                    where: { jugadorId: oponente.id },
                    include: [{ model: ctx.orm.Carta}] // Incluir los datos de la carta
                });
                // Barajar las cartas al azar
                const shuffledCartas = cartas.sort(() => 0.5 - Math.random());
                const carta_eliminada = shuffledCartas.pop();
                await ctx.orm.CartaJugador.destroy({
                    where: {cartaId: carta_eliminada.Cartum.id, jugadorId: oponente.id}
                })
                oponente.atacado = true;
                await oponente.save();
            }
        } else if (jugador.personajeId === 1) { // Inferna
            if (accion === 1) { // jugador sube nivel de carta elegida
                const carta = await ctx.orm.Carta.findOne({
                    where: { id: ctx.params.carta },
                });
                let cartaNueva = null;
                let nivelActual = carta.nivel + 1;
                // Loop para buscar la carta de nivel superior que no pertenezca al oponente
                while (nivelActual <= 5) { // nivel máximo es 5
                    cartaNueva = await ctx.orm.Carta.findOne({
                        where: { elementoId: carta.elementoId, nivel: nivelActual },
                    });
                    if (!cartaNueva) { // Si no existe una carta con el nivel actual, romper el loop
                        break;
                    }
                    // Verificar si esta carta pertenece al oponente
                    const perteneceAOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: oponente.id, cartaId: cartaNueva.id },
                    });
                    if (!perteneceAOponente) { // Si la carta no pertenece al oponente, detener la búsqueda
                        break;
                    }
                    // Incrementar el nivel para buscar otra carta
                    nivelActual++;
                }
                // Verificar si se encontró una carta válida
                if (!cartaNueva || nivelActual > 5) {
                    ctx.body = {
                        message: 'No fue posible subir de nivel, prueba con otra carta.'
                    };
                    return;
                }
                // Destruir la relación con la carta anterior y asignar la nueva carta al jugador
                await ctx.orm.CartaJugador.destroy({
                    where: {cartaId: carta.id, jugadorId: jugador.id}
                })
                await ctx.orm.CartaJugador.create({
                    jugadorId: jugador.id,
                    cartaId: cartaNueva.id,
                });
            } else { // oponente baja nivel de carta al azar
                // Encuentra todas las cartas posibles a bajar nivel
                const cartas = await ctx.orm.CartaJugador.findAll({
                    where: { jugadorId: oponente.id },
                    include: [{ model: ctx.orm.Carta}] // Incluir los datos de la carta
                });
                // Validar que el oponente tenga cartas
                if (!cartas || cartas.length === 0) {
                    ctx.body = {message: 'El oponente no tiene cartas para bajar de nivel.'};
                    return;
                }
                // Barajar las cartas al azar
                let shuffledCartas = cartas.sort(() => 0.5 - Math.random());
                let carta_bajada = null;
                let cartaNueva = null;
                while (shuffledCartas.length > 0) { // Iterar mientras queden cartas en el mazo
                    carta_bajada = shuffledCartas.pop(); // Tomar una carta al azar
                    let nivelActual = carta_bajada.Cartum.nivel - 1; // Comenzar desde el nivel inferior
                    // Loop para buscar la carta de nivel inferior que no pertenezca al oponente
                    while (nivelActual > 0) { // Nivel mínimo es 1
                        cartaNueva = await ctx.orm.Carta.findOne({
                            where: { elementoId: carta_bajada.Cartum.elementoId, nivel: nivelActual },
                        });
                        if (!cartaNueva) { // Si no existe una carta con el nivel actual, romper el loop
                            break;
                        }
                        // Verificar si esta carta pertenece al jugador
                        const perteneceAOponente = await ctx.orm.CartaJugador.findOne({
                            where: { jugadorId: jugador.id, cartaId: cartaNueva.id },
                        });
                        if (!perteneceAOponente) { // Si la carta no pertenece al oponente, detener la búsqueda
                            break;
                        }
                        // Disminuir el nivel para buscar otra carta
                        nivelActual--;
                    }
                    // Verificar si se encontró una carta válida
                    if (cartaNueva && nivelActual > 0) {
                        break; // Salir del bucle principal si se encontró una carta válida
                    }
                    // Si no se encontró una carta válida, continuar con otra carta_bajada
                    cartaNueva = null; // Reiniciar cartaNueva para la próxima iteración
                }
                // Si después de recorrer todas las cartas no se encontró una válida
                if (!cartaNueva) {
                    ctx.body = { message: 'No fue posible disminuir el nivel.'};
                    return;
                }
                // Destruir la relación con la carta anterior y asignar la nueva carta al jugador
                await ctx.orm.CartaJugador.destroy({
                    where: {cartaId: carta_bajada.Cartum.id, jugadorId: oponente.id}
                })
                await ctx.orm.CartaJugador.create({
                    jugadorId: oponente.id,
                    cartaId: cartaNueva.id,
                });
                oponente.atacado = true;
                await oponente.save();
            }
        } else if (jugador.personajeId === 2) { // Aquos
            if (accion === 1) { // jugador cambia elemento de carta
                const carta = await ctx.orm.Carta.findOne({
                    where: { id: ctx.params.carta },
                });
                // Encuentra todas las cartas del mismo nivel
                const cartas = await ctx.orm.Carta.findAll({
                    where: {
                        nivel: carta.nivel,
                        id: { [ctx.orm.Sequelize.Op.ne]: carta.id }, // Excluir la carta actual
                    },
                });
                // Elegir una carta al azar del conjunto
                const shuffledCartas = cartas.sort(() => 0.5 - Math.random());
                let cartaNueva = null;
                let cartaValida = false;
                // Iterar hasta encontrar una carta que no pertenezca al oponente
                while (!cartaValida && shuffledCartas.length > 0) {
                    cartaNueva = shuffledCartas.pop(); // Elegir una carta al azar
                    // Revisar si cartaNueva pertenece al oponente
                    const cartaJugadorOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: oponente.id, cartaId: cartaNueva.id },
                    });
                    // Si la carta pertenece al oponente, seguir buscando otra
                    if (!cartaJugadorOponente) {
                        cartaValida = true; // La carta es válida, no pertenece al oponente
                    }
                }
                // Si no se encontró una carta válida después de revisar todas las cartas
                if (!cartaValida) {
                    ctx.body = {
                        message: 'No se encontró una carta válida para cambiar el elemento.'
                    };
                    return;
                }
                // Realizar el intercambio en CartaJugador
                await ctx.orm.CartaJugador.destroy({
                    where: { cartaId: carta.id, jugadorId: jugador.id },
                });
                await ctx.orm.CartaJugador.create({
                    jugadorId: jugador.id,
                    cartaId: cartaNueva.id,
                });
            } else { // oponente cambia elemento de carta al azar
                // Encuentra todas las cartas posibles a bajar nivel
                const cartas = await ctx.orm.CartaJugador.findAll({
                    where: { jugadorId: oponente.id },
                    include: [{ model: ctx.orm.Carta}] // Incluir los datos de la carta
                });
                // Barajar las cartas al azar
                const shuffledCartasInicial = cartas.sort(() => 0.5 - Math.random());
                const carta_cambiada = shuffledCartasInicial.pop();
                // Encuentra todas las cartas del mismo nivel
                const cartasPosibles = await ctx.orm.Carta.findAll({
                    where: {
                        nivel: carta_cambiada.Cartum.nivel,
                        id: { [ctx.orm.Sequelize.Op.ne]: carta_cambiada.Cartum.id }, // Excluir la carta actual
                    },
                });
                // Elegir una carta al azar del conjunto
                const shuffledCartas = cartasPosibles.sort(() => 0.5 - Math.random());
                let cartaNueva = null;
                let cartaValida = false;
                // Iterar hasta encontrar una carta que no pertenezca al oponente
                while (!cartaValida && shuffledCartas.length > 0) {
                    cartaNueva = shuffledCartas.pop(); // Elegir una carta al azar
                    // Revisar si cartaNueva pertenece al jugador
                    const cartaJugadorOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: jugador.id, cartaId: cartaNueva.id },
                    });
                    // Si la carta pertenece al oponente, seguir buscando otra
                    if (!cartaJugadorOponente) {
                        cartaValida = true; // La carta es válida, no pertenece al oponente
                    }
                }
                // Si no se encontró una carta válida después de revisar todas las cartas
                if (!cartaValida) {
                    ctx.body = {
                        message: 'No se encontró una carta válida para cambiar el elemento.'
                    };
                    return;
                }
                // Realizar el intercambio en CartaJugador
                await ctx.orm.CartaJugador.destroy({
                    where: { cartaId: carta_cambiada.Cartum.id, jugadorId: oponente.id },
                });
                await ctx.orm.CartaJugador.create({
                    jugadorId: oponente.id,
                    cartaId: cartaNueva.id,
                });
                oponente.atacado = true;
                await oponente.save();
            }
        } else if (jugador.personajeId === 4) { //Terrax
            if (accion === 1) { // jugador intercambia carta con el mazo
                const carta_actual = await ctx.orm.Carta.findOne({
                    where: { id: ctx.params.carta },
                });
                // Encuentra todas las cartas del mismo nivel
                const cartas = await ctx.orm.Carta.findAll({
                    where: {
                        id: { [ctx.orm.Sequelize.Op.ne]: carta_actual.id }, // Excluir la carta actual
                    },
                });
                // Barajar las cartas al azar
                const shuffledCartas = cartas.sort(() => 0.5 - Math.random());
                let carta_ganada = null;
                // Iterar sobre las cartas barajadas para encontrar una válida
                for (const carta of shuffledCartas) {
                    const cartaJugador = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: jugador.id, cartaId: carta.id },
                    });
                    const cartaOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: oponente.id, cartaId: carta.id },
                    });
                    // Si la carta no pertenece ni al jugador ni al oponente, es válida
                    if (!cartaJugador && !cartaOponente) {
                        carta_ganada = carta;
                        break;
                    }
                }
                // Verificar si se encontró una carta válida
                if (carta_ganada) {
                    //Eliminar carta anterior y asignar nueva al jugador
                    await ctx.orm.CartaJugador.destroy({
                        where: { cartaId: carta_actual.id, jugadorId: jugador.id },
                    });
                    await ctx.orm.CartaJugador.create({
                        jugadorId: jugador.id,
                        cartaId: carta_ganada.id,
                    });
                }
            } else { // oponente intercambia carta con el mazo azar
                // Encuentra todas las cartas posibles a intercambiar
                const cartas = await ctx.orm.CartaJugador.findAll({
                    where: { jugadorId: oponente.id },
                    include: [{ model: ctx.orm.Carta}] // Incluir los datos de la carta
                });
                // Validar que el oponente tenga cartas
                if (!cartas || cartas.length === 0) {
                    ctx.body = {message: 'El oponente no tiene cartas para intercambiar.'};
                    return;
                }
                // Barajar las cartas al azar
                const shuffledCartasInicial = cartas.sort(() => 0.5 - Math.random());
                const carta_cambiada = shuffledCartasInicial.pop();
                // Encuentra todas las cartas 
                const cartasPosibles = await ctx.orm.Carta.findAll({
                    where: {
                        id: { [ctx.orm.Sequelize.Op.ne]: carta_cambiada.Cartum.id }, // Excluir la carta actual
                    },
                });
                // Barajar las cartas al azar
                const shuffledCartas = cartasPosibles.sort(() => 0.5 - Math.random());
                let carta_ganada = null;
                // Iterar sobre las cartas barajadas para encontrar una válida
                for (const carta of shuffledCartas) {
                    const cartaJugador = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: jugador.id, cartaId: carta.id },
                    });
                    const cartaOponente = await ctx.orm.CartaJugador.findOne({
                        where: { jugadorId: oponente.id, cartaId: carta.id },
                    });
                    // Si la carta no pertenece ni al jugador ni al oponente, es válida
                    if (!cartaJugador && !cartaOponente) {
                        carta_ganada = carta;
                        break;
                    }
                }
                // Verificar si se encontró una carta válida
                if (carta_ganada) {
                    //Eliminar carta anterior y asignar nueva al jugador
                    await ctx.orm.CartaJugador.destroy({
                        where: { cartaId: carta_cambiada.Cartum.id, jugadorId: oponente.id },
                    });
                    await ctx.orm.CartaJugador.create({
                        jugadorId: oponente.id,
                        cartaId: carta_ganada.id,
                    });
                    oponente.atacado = true;
                    await oponente.save();
                }
            }
        }
        // Quitar una estrella al jugador
        jugador.estrellas -= 1;
        await jugador.save();
        
        // Responder con la jugada actualizada
        ctx.body = { message: "Habilidad ejecutada exitosamente.", jugador };
        ctx.status = 200;
    } catch(error){
        ctx.body = {
            message: "Error al ejecutar la habilidad.",
            error: error.message || "Ocurrió un error inesperado."
        };
        ctx.status = 400;
    }
});

module.exports = router;