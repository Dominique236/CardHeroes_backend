const Router = require('koa-router');

const router = new Router();

// Crear una partida, según los datos necesarios entregados en el body
// respuesta: partida nueva creada
router.post("partidas.create", "/:id_espera/:selected_tablero", async (ctx) => {
    try{       
        const partida = await ctx.orm.Partida.create({
            turno: null,
            ganador: null
        });

        const usuariosEnEspera = await ctx.orm.UsuarioEspera.findAll({
            where: {
                esperaId: ctx.params.id_espera
            }
        });

        for (const usuario of usuariosEnEspera) {        

            // Verificar si el usuario ya tiene un jugador en esta partida
            const existingPlayer = await ctx.orm.Jugador.findOne({
                where: {
                    usuarioId: usuario.usuarioId,
                    partidaId: partida.id
                }
            });

            if (!existingPlayer) {
                // Crear jugador
                await ctx.orm.Jugador.create({
                    usuarioId: usuario.usuarioId,
                    partidaId: partida.id,
                    personajeId: null,
                    estrellas: 0,
                    vidas: 3,
                    atacado: false
                });
                // Crear jugada de primera ronda (ronda, jugadorId, carta_1, carta_2, carta_3)
                await ctx.orm.Jugada.create({
                    jugadorId: usuario.usuarioId,
                    ronda: 1,
                    carta_1: null,
                    carta_2: null,
                    carta_3: null,
                });
            } else {
                console.log(`El usuario con ID ${usuario.usuarioId} ya tiene un jugador en esta partida`);
            }
        }
        
        // se obtienen todos los jugadores en la partida
        const jugadores_en_partida = await ctx.orm.Jugador.findAll({
            where: {
                partidaId: partida.id
            }
        });

        // funcion para ordenar a los jugadores
        function ordenarJugadores(id_jugadores) {
            // Ordenar id_jugadores de mayor a menor
            id_jugadores.sort((a, b) => b - a);
        
            // Crear un array para almacenar el orden alternativo
            let ordenado = [];
        
            // Inicializar índices para el mayor y el menor
            let mayorIndex = 0;
            let menorIndex = id_jugadores.length - 1;
        
            // Iterar sobre id_jugadores y alternar entre mayor y menor
            for (let i = 0; i < id_jugadores.length; i++) {
                if (i % 2 === 0) {
                    // Tomar el mayor disponible
                    ordenado.push(id_jugadores[mayorIndex]);
                    mayorIndex++;
                } else {
                    // Tomar el menor disponible
                    ordenado.push(id_jugadores[menorIndex]);
                    menorIndex--;
                }
            }
            return ordenado;
        }

        const id_jugadores = [];
        for (const j of jugadores_en_partida) {
            id_jugadores.push(j.id);
        }

        // Aplicar la función de ordenamiento personalizada
        const ordenados = ordenarJugadores(id_jugadores);
        // Asignar el turno al primer jugador ordenado
        partida.turno = ordenados[0]; 
        await partida.save();
        
        ctx.body = { partida: partida, turnos: ordenados};
        ctx.status = 201;
    } catch (error) {
        console.log(`Error: ${error}`);
        ctx.body = { error: "Error al crear la partida" };
        ctx.status = 400;
    }
});

// Obtener al oponente de un jugador, segun nombre de un usuario de el
// respuesta: oponente
router.get("partidas.show", "/oponente/:nombre", async (ctx) => {
    try{
        let usuarios = await ctx.orm.Usuario.findOne({where:{nombre:ctx.params.nombre}});
        if (!usuarios) {
            console.log(`User with name ${ctx.params.nombre} not found`);
            ctx.body = { error: "Usuario no encontrado" };
            ctx.status = 404;
            return;
        }
        const jugador = await ctx.orm.Jugador.findOne({
            where:{usuarioId:usuarios.id}
        })
        // busca a todos los jugadores
        const jugadores = await ctx.orm.Jugador.findAll({
            where: { partidaId: jugador.partidaId}
        });        
        // Filtra los jugadores distintos al jugador actual
        const jugadorEnMismaPartida = jugadores.filter(j => j.id !== jugador.id);
        
        ctx.body = jugadorEnMismaPartida;
        ctx.status = 201;
    } catch(error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

// Revisa si la partida ya fue creada por otro jugador
// Devuelve los turnos y encontrado (true o false)
router.get("partidas.show", "/status/:nombre", async (ctx) => {
    try{
        let usuarios = await ctx.orm.Usuario.findOne({where:{nombre:ctx.params.nombre}});
        if (!usuarios) {
            console.log(`User with name ${ctx.params.nombre} not found`);
            ctx.body = { error: "Usuario no encontrado" };
            ctx.status = 404;
            return;
        }

        const jugador = await ctx.orm.Jugador.findOne({
            where:{usuarioId:usuarios.id}
        })

        if (jugador) {
            const jugadores = await ctx.orm.Jugador.findAll({
                where: { partidaId: jugador.partidaId }
            });
            // funcion para ordenar a los jugadores
            function ordenarJugadores(id_jugadores) {
                // Ordenar id_jugadores de mayor a menor
                id_jugadores.sort((a, b) => b - a);
            
                // Crear un array para almacenar el orden alternativo
                let ordenado = [];
            
                // Inicializar índices para el mayor y el menor
                let mayorIndex = 0;
                let menorIndex = id_jugadores.length - 1;
            
                // Iterar sobre id_jugadores y alternar entre mayor y menor
                for (let i = 0; i < id_jugadores.length; i++) {
                    if (i % 2 === 0) {
                        // Tomar el mayor disponible
                        ordenado.push(id_jugadores[mayorIndex]);
                        mayorIndex++;
                    } else {
                        // Tomar el menor disponible
                        ordenado.push(id_jugadores[menorIndex]);
                        menorIndex--;
                    }
                }
                return ordenado;
            }

            const id_jugadores = [];
            for (const j of jugadores) {
                id_jugadores.push(j.id);
            }

            // Aplicar la función de ordenamiento personalizada
            const ordenados = ordenarJugadores(id_jugadores);

            ctx.body = {
                encontrado: true,
                message: "jugador encontrado",
                turnos: ordenados
            }
            ctx.status = 200;
        } else {
            ctx.body = {
                encontrado: false,
                message: "jugador no encontrado"
            }
            ctx.status = 200;
        }
    } catch(error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

// Eliminar todo lo relacionado a una partida, solo si el jugador es el ultimo se elimina Partida
router.delete("partidas", "/:nombre", async (ctx) => {
    const transaction = await ctx.orm.sequelize.transaction();
    try {
        const usuario = await ctx.orm.Usuario.findOne({ where: { nombre: ctx.params.nombre } });
        if (!usuario) {
            ctx.body = { error: "Error al buscar el usuario" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        const jugador = await ctx.orm.Jugador.findOne({ where: { usuarioId: usuario.id } });
        if (!jugador) {
            ctx.body = { error: "Error al buscar al Jugador" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        const jugadores = await ctx.orm.Jugador.findAll({ where: { partidaId: jugador.partidaId } });
        if (!jugadores) {
            ctx.body = { error: "Error al buscar a los Jugadores" };
            ctx.status = 404;
            await transaction.rollback();
            return;
        }

        if (jugadores.length > 1) {
            // Si hay mas de un jugador distinto, eliminamos Jugador y CartaJugador
            await ctx.orm.CartaJugador.destroy({ where: { jugadorId: jugador.id }, transaction });
            console.log("CartaJugador eliminadas correctamente");
            await jugador.destroy({ transaction });
            console.log("Jugador eliminado correctamente");
            ctx.body = { message: "Jugador eliminado" };
            ctx.status = 200;
        } else {
            // En cambio si solo queda jugador, eliminamos Jugador y Partida
            const partida = await ctx.orm.Partida.findOne({ where: { id: jugador.partidaId } });
            if (!partida) {
                ctx.body = { error: "Error al buscar la Partida" };
                ctx.status = 404;
                await transaction.rollback();
                return;
            }
            // Eliminar CartaJugador de ese jugador
            await ctx.orm.CartaJugador.destroy({ where: { jugadorId: jugador.id }, transaction });
            console.log("CartaJugador eliminadas correctamente");
            // Finalmente eliminar al Jugador y la Partida
            await jugador.destroy({ transaction });
            console.log("Jugador eliminado correctamente");
            await partida.destroy({ transaction });
            console.log("Partida eliminada correctamente");
            ctx.body = { message: "Jugador y Partida eliminados" };
            ctx.status = 200;
        }
        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        console.error("Error durante la eliminación:", error);
        ctx.body = { error: "No es posible eliminar" };
        ctx.status = 400;
    }
});

// Revisar si hay ganador
router.get("partidas.ganador", "/ganador/:nombre/:id_oponente", async (ctx) => {   
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
        const jugador = await ctx.orm.Jugador.findOne({
            where: {usuarioId:usuario.id},
            include: [
                {
                    model: ctx.orm.Usuario,
                    attributes: ['nombre']
                }
            ]
        });
        // Encuentra al jugador con el id_oponente
        const jugador_oponente = await ctx.orm.Jugador.findOne({
            where: {id: ctx.params.id_oponente},
            include: [
                {
                    model: ctx.orm.Usuario,
                    attributes: ['nombre']
                }
            ]
        });
        if (!jugador) {
            ctx.status = 404;
            ctx.body = { error: "Jugador no encontrado para este usuario." };
            return;
        }
        let ganador = null;
        if (jugador.vidas < 1) {
            ganador = jugador_oponente.Usuario.nombre
        } else if (jugador_oponente.vidas < 1) {
            ganador = jugador.Usuario.nombre
        } 
        
        ctx.body = { ganador };
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;