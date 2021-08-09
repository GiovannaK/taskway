/* eslint-disable no-unused-vars */
const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Room, User }) {
      this.belongsTo(Room, { foreignKey: 'roomId', as: 'messages_room' });
      this.belongsTo(User, { foreignKey: 'userId', as: 'messages_user' });
    }
  }
  Message.init({
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    body: {
      type: DataTypes.STRING(5000),
      allowNull: false,
      trim: true,
      validate: {
        len: {
          args: [1, 5000],
          msg: 'message body must have between 1 and 5000 words',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};
