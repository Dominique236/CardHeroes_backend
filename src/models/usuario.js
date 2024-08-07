'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.Jugador, {
        foreignKey: 'id',
      });
      this.hasOne(models.UsuarioEspera, {
        foreignKey: 'id',
      });
    }
  }
  Usuario.init({
    nombre: DataTypes.STRING,
    correo: {
      type:DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'correo debe cumplir formato de email'
        }
      }
    },
    contrasena: DataTypes.STRING,
    victorias: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};