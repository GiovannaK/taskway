/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User_Permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Workspace, User, Permission }) {
      this.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'permissions_workspace' });
      this.belongsTo(User, { foreignKey: 'userId', as: 'user_permission' });
      this.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permissions' });
    }
  }
  User_Permissions.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
  }, {
    sequelize,
    modelName: 'User_Permissions',
  });
  return User_Permissions;
};
