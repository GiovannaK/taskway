const { AuthenticationError, ApolloError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');

module.exports = (context) => {
  try {
    if (context.req) {
      if (!context.req.cookies.id && !context.req.cookies.logged) {
        throw new AuthenticationError('Unauthenticated');
      }

      const { userId } = jwt.verify(context.req.cookies.id, process.env.TOKEN_SECRET);
      context.req.userId = userId;

      console.log('COOKIE', context.req.cookies.id);
      console.log('COOKIE Log', context.req.cookies.logged);
    }
  } catch (error) {
    throw new ApolloError('Cannot authenticate', { error });
  }
};
