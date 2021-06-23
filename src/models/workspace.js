/* eslint-disable no-unused-vars */
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workspace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Task, Permission }) {
      this.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
      this.belongsToMany(User, { foreignKey: 'workspaceId', through: 'User_Workspaces', as: 'users' });
      this.hasMany(Task, { foreignKey: 'workspaceId', as: 'tasks' });
      this.hasMany(Permission, { foreignKey: 'workspaceId', as: 'workspaces_permissions' });
    }
  }
  Workspace.init({
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    title: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Title must have at least 1 character',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Workspace',
  });
  return Workspace;
};
