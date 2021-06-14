const { UserInputError } = require('apollo-server-errors');
const {User} = require('../../../models');
const sendRegistrationEmail = require('./sendRegistrationEmail');
const sendForgotPasswordEmail = require('./sendForgotPasswordEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  Query: {
    users: async (_, __,) => {
      try {
        const user = await User.findAll();

        if(!user){
          throw new Error('Users does not exists')
        }

        return user;
      } catch (error) {
        throw new Error('Cannot show users', {error})
      }
    },

    user: async (_, {id}) => {
      try {
        const user = await User.findByPk(id)

        if(!user){
          throw new Error('Cannot found user')
        }

        return user;
      } catch (error) {
        throw new Error('Cannot show user', {error})
      }
    }
  },
  Mutation: {
    userLogin: async(_, {email, password}) => {
      try {
        const user = await User.findOne({where: {email}})

        if(!user){
          throw new UserInputError('User not found')
        }

        if(!user.isVerified){
          throw new Error('Account not verified')
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if(!isPasswordMatch){
          throw new UserInputError('Invalid credentials')
        }

        const {id} = user

        const token = jwt.sign({id}, process.env.TOKEN_SECRET, {
          expiresIn: process.env.TOKEN_EXPIRATION
        })

        const data = {token, id: user.id, ...user}

        return data;

      } catch (error) {
        throw error
      }
    },

    userRegister: async (_, {data: {firstName, lastName, email, password}}) => {
      try {

        const userAlreadyExists = await User.findOne({where: {email}})

        if(userAlreadyExists){
          throw new UserInputError('User already exist')
        }

        const encryptedPassword = bcrypt.hashSync(password, 6)

        const user = await User.create({
          firstName, lastName, email, password: encryptedPassword
        })

        const userData = await sendRegistrationEmail(user);
        return userData;
      } catch (error) {
        console.log(error);
        throw new UserInputError('Bad Input')
      }

    },

    userConfirmAccount: async (_, {emailConfirmationToken}) => {
      try {
        const user = await User.findOne({where: {emailConfirmationToken}})

        if(!user){
          throw new Error('Cannot found user')
        }

        const now = Date.now();

        if(now > user.emailConfirmationExpires){
          throw new Error('Token expired')
        }

        user.isVerified = true
        user.emailConfirmationExpires = null;
        user.emailConfirmationToken = null;

        await user.save();

        return user
      } catch (error) {
        console.log(error);
        throw new Error('Cannot verify user account')
      }
    },
    userForgotPassword: async (_, {email}) => {
      try {
        const user = await User.findOne({email})

        if(!user){
          throw new UserInputError('Cannot found user')
        }

        const userData = await sendForgotPasswordEmail(user)
        return userData
      } catch (error) {
        throw new Error('Server Error', {error})
      }
    },

    userResetPassword: async (_, {passwordResetToken, password}) => {
      try {
        const user = await User.findOne({passwordResetToken})

        if(!user){
          throw new Error('User not exist')
        }

        const now = Date.now()

        if(now > user.passwordResetExpires){
          throw new Error('Token expired')
        }

        const encryptedPassword = bcrypt.hashSync(password, 6)

        user.password = encryptedPassword
        user.passwordResetToken = null
        user.passwordResetExpires = null

        await user.save()

        return user
      } catch (error) {
        throw new UserInputError('Something went wrong, check if you type a valid password type', {error})
      }
    }
  },
}