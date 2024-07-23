'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Personaje extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Jugador, {
        foreignKey: 'id',
      });
    }
  }
  Personaje.init({
    nombre: DataTypes.STRING,
    alias: DataTypes.STRING,
    elemento: DataTypes.STRING,
    color: DataTypes.STRING,
    descripcion_habilidad: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Personaje',
  });
  return Personaje;
};