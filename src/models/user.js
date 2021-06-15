'use strict';
const crypto = require('crypto');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Profile}) {
      this.hasOne(Profile, {foreignKey: 'userId', as: 'profile'})
    }
  };
  User.init({
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      validate: {
        len: {
          args: [1, 255],
          msg: 'first name must have at least 3 characters'
        },

      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      validate: {
        len: {
          args: [1, 255],
          msg: 'last name must have at least 3 characters'
        },

      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email address'
        }
      },
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8, 255],
          msg: 'Password must have at least 8 characters'
        }
      }
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    emailConfirmationToken: {
      type: DataTypes.STRING,
    },
    emailConfirmationExpires: {
      type: DataTypes.DATE,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  User.prototype.generateConfirmationToken = function () {
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    this.emailConfirmationToken = confirmationToken
    this.emailConfirmationExpires = Date.now() + 10 * (60 * 1000)

    return confirmationToken;
  }

  User.prototype.generateResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = resetToken
    this.passwordResetExpires = Date.now() + 10 * (60 * 1000)

    return resetToken;
  }

  return User;
};