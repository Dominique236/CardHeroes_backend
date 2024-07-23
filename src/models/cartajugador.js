'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartaJugador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Jugador, {
        foreignKey: 'jugadorId',
      }); 
      this.belongsTo(models.Carta, {
        foreignKey: 'cartaId',
      });
    }
  }
  CartaJugador.init({
    jugadorId: DataTypes.INTEGER,
    cartaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartaJugador',
  });
  return CartaJugador;
};