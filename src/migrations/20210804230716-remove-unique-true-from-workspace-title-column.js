module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('Workspaces', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
    }),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.changeColumn('Workspaces', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
    }),
  ]),
};
