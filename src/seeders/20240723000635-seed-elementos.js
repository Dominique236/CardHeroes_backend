module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Elementos', [
    {
      nombre:'Fuego',
      color: 'Rojo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nombre:'Agua',
      color: 'Celeste',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nombre:'Aire',
      color: 'Amarillo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nombre:'Tierra',
      color: 'Verde',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Elementos', null, {}),
};