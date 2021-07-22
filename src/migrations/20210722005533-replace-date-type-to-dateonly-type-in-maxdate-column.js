module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('Tasks', 'maxDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    }),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('Tasks', 'maxDate', {
      type: Sequelize.DATE,
      allowNull: true,
    }),
  ]),
};
