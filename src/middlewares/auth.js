const jwt = require('jsonwebtoken');

module.exports = (context) => {
  try {
    const { userId } = jwt.verify(context.req.cookies.id, process.env.TOKEN_SECRET);
    context.req.userId = userId;
    console.log('COOKIE', context.req.cookies);
  } catch (error) {
    throw error;
  }
};
