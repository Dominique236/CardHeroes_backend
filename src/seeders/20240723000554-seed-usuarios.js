module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Usuarios', [
    {
      nombre:'domi',
      correo:'dominique@uc.cl',
      contrasena:'secreto',
      victorias: '3', 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      nombre:'guess',
      correo:'guess@uc.cl',
      contrasena:'iamtheguess',
      victorias: '1', 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Usuarios', null, {}),
};