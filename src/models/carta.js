'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Elemento, {
        foreignKey: 'elementoId',
      });
      this.hasMany(models.CartaJugador, {
        foreignKey: 'id',
      }); 
    }
  }
  Carta.init({
    elementoId: DataTypes.INTEGER,
    nivel: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Carta',
    tableName: 'Cartas',
  });
  return Carta;
};