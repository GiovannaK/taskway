const { gql } = require('apollo-server');

exports.CREATE_USER = gql`
  mutation UserRegister($name: String!, $email: String!, $password: String!){
      userRegister(data: {name: $name, email: $email, password: $password}){
        id
        name
        email
      }
  }
`