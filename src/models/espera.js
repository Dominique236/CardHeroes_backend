'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Espera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.UsuarioEspera, {
        foreignKey: 'id',
      });
    }
  }
  Espera.init({
    codigo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Espera',
  });
  return Espera;
};