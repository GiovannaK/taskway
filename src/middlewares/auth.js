const jwt = require('jsonwebtoken')

module.exports = (context) => {
  try {
    const {userId} = jwt.verify(context.req.cookies.id, process.env.TOKEN_SECRET)
    context.req.userId = userId
  } catch (error) {
    throw error
  }
}