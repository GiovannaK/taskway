/* eslint-disable import/no-extraneous-dependencies */
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res, next }) => ({ req, res, next }),
});

const corsOptions = {
  credentials: true,
  origin: [`${process.env.CLIENT_URL}`, 'http://localhost:4000'],
  methods: 'GET, POST, PUT, DELETE',
};

app.use(cookieParser());
server.applyMiddleware({ app, path: '/', cors: corsOptions });

app.use(cors({
  credentials: true,
  origin: [`${process.env.CLIENT_URL}`, 'http://localhost:4000'],
}));

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(`🚀 Server ready at ${process.env.PORT}`);
  });

  sequelize.authenticate()
    .then(() => console.log('Database connected!'))
    .catch((err) => console.log(err));
}

module.exports = server;
