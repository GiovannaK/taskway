/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
      {
        id: 'b6124847-1890-4148-b2d1-509eb70fb44f',
        name: 'createTask',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a58c53a3-7720-4c11-8da0-815abcf57f13',
        name: 'updateTask',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ded7c01d-f224-4480-8ea3-50403de368a0',
        name: 'deleteTask',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  },
};
