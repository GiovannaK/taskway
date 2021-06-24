/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User_Workspaces }) {
      this.belongsToMany(User_Workspaces, { foreignKey: 'permissionId', through: 'User_Permissions', as: 'permissions_users' });
    }
  }
  Permission.init({
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Permission',
  });
  return Permission;
};
