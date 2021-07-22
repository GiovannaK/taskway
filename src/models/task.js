/* eslint-disable no-unused-vars */
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Workspace, User }) {
      this.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'task_workspaces' });
      this.belongsTo(User, { foreignKey: 'assignTo', as: 'tasksUsers' });
    }
  }
  Task.init({
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
    },
    file: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 1000],
          msg: 'Max size allowed is 1000 characters',
        },

      },
    },
    maxDate: {
      type: DataTypes.DATEONLY,
    },
    progress: {
      type: DataTypes.ENUM('Not started', 'In progress', 'finished'),
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
    },
    assignTo: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};
