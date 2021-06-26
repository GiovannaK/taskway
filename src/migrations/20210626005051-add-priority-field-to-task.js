/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Tasks',
      'priority',
      {
        type: Sequelize.DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Low',
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Tasks',
      'priority',
    );
  },
};
