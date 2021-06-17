const { ApolloServer, gql } = require('apollo-server-express');
const {sequelize} = require('./models')
const express = require('express')
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers')
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})


const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({req}),
});

server.applyMiddleware({app})

if(process.env.NODE_ENV !== 'test'){

  app.listen({port: process.env.PORT || 4000}, () => {

    console.log(`🚀 Server ready at ${ process.env.PORT}`);
  })

  sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err))

}

module.exports = server;