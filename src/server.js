const { ApolloServer, gql } = require('apollo-server');
const {sequelize} = require('./models')
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers')
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({req})
});
if(process.env.NODE_ENV !== 'test'){

  server.listen({port: process.env.PORT || 4000}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);

    sequelize.authenticate()
      .then(() => console.log('Database connected!'))
      .catch(err => console.log(err))
  });
}

module.exports = server;