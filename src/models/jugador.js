'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jugador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
      }); 
      this.belongsTo(models.Partida, {
        foreignKey: 'partidaId',
      }); 
      this.belongsTo(models.Personaje, {
        foreignKey: 'personajeId',
      }); 
      this.hasMany(models.CartaJugador, {
        foreignKey: 'id',
      });
    }
  }
  Jugador.init({
    usuarioId: DataTypes.INTEGER,
    partidaId: DataTypes.INTEGER,
    personajeId: DataTypes.INTEGER,
    estrellas: DataTypes.INTEGER,
    vidas: DataTypes.INTEGER,
    atacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  }, {
    sequelize,
    modelName: 'Jugador',
  });
  return Jugador;
};