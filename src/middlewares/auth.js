const { AuthenticationError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken')

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if(authHeader){
    const token = authHeader.split('Bearer ')[1];
    if(token){
      try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        return user;
      } catch (error) {
          throw new AuthenticationError('Invalid/Expired token');
      }
    }

      throw new Error('malformated token')
  }
  throw new Error('Authorization Header must be provided')
}