'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jugadors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        references: { model: 'Usuarios', key: 'id' },
      },
      partidaId: {
        type: Sequelize.INTEGER,
        references: { model: 'Partidas', key: 'id' }, 
      },
      personajeId: {
        type: Sequelize.INTEGER,
        references: { model: 'Personajes', key: 'id' }, 
      },
      estrellas: {
        type: Sequelize.INTEGER
      },
      vidas: {
        type: Sequelize.INTEGER
      },
      atacado: { 
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Jugadors');
  }
};