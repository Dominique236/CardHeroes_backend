'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsuarioEspera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
      }); 
      this.belongsTo(models.Espera, {
        foreignKey: 'esperaId',
      }); 
    }
  }
  UsuarioEspera.init({
    usuarioId: DataTypes.INTEGER,
    esperaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UsuarioEspera',
  });
  return UsuarioEspera;
};