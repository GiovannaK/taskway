/* eslint-disable camelcase */
/* eslint-disable max-len */
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
    static associate({
      User, Task, User_Permissions, Room,
    }) {
      this.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
      this.belongsToMany(User, { foreignKey: 'workspaceId', through: 'User_Workspaces', as: 'users' });
      this.hasMany(Task, { foreignKey: 'workspaceId', as: 'tasks' });
      this.hasMany(User_Permissions, { foreignKey: 'workspaceId', as: 'workspaces_permissions' });
      this.hasOne(Room, { foreignKey: 'workspaceId', as: 'workspace_room' });
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
