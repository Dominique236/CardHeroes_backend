'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jugada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Jugador, {
        foreignKey: 'jugadorId',
      }); 
    }
  }
  Jugada.init({
    jugadorId: DataTypes.INTEGER,
    ronda: DataTypes.INTEGER,
    carta_1: DataTypes.INTEGER,
    carta_2: DataTypes.INTEGER,
    carta_3: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Jugada',
  });
  return Jugada;
};