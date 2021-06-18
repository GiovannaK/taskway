const { gql } = require('apollo-server-express');

exports.CREATE_USER = gql`
  mutation UserRegister($firstName: String!, $lastName: String!, $email: String!, $password: String!){
    userRegister(data: {firstName: $firstName, lastName: $lastName, email: $email, password: $password}){
      id
      firstName
      lastName
      email
      emailConfirmationToken
    }
  }
`

exports.USERS = gql`
  query Users{
    users{
      id
      firstName
      lastName
      email
    }
  }
`

exports.CONFIRM_ACCOUNT = gql`
  mutation UserConfirmAccount($emailConfirmationToken: String!){
    userConfirmAccount(emailConfirmationToken: $emailConfirmationToken){
      id
      email
      isVerified
    }
  }
`

exports.LOGIN_USER = gql`
  mutation UserLogin($email: String!, $password: String!){
    userLogin(email: $email, password: $password){
      id
      token
    }
  }
`

exports.FORGOT_PASSWORD = gql`
  mutation userForgotPassword($email: String!){
    userForgotPassword(email: $email){
      id
      passwordResetToken
    }
  }
`

exports.RESET_PASSWORD = gql`
  mutation UserResetPassword($passwordResetToken: String!, $password: String!){
    userResetPassword(passwordResetToken: $passwordResetToken, password: $password){
      id
      email
    }
  }
`