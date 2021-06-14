const { gql } = require('apollo-server');

exports.CREATE_USER = gql`
  mutation UserRegister($firstName: String!, $lastName: String!, $email: String!, $password: String!){
    userRegister(data: {firstName: $firstName, lastName: $lastName, email: $email, password: $password}){
      id
      firstName
      lastName
      email
    }
  }
`