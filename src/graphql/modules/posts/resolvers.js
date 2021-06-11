const { AuthenticationError } = require("apollo-server-errors")
const auth = require("../../../middlewares/auth")
const {Post} = require('../../../models')

module.exports = {
  Query: {
    posts: async (_, __, context) => {
      try {
        auth(context);

        const posts = await Post.findAll({include: {association: 'authorId'}})

        if(!posts){
          throw new Error('Cannot find posts')
        }

        return posts;
      } catch (error) {
        console.log(error)
        throw new Error('Cannot query posts')
      }
    }
  },
  Mutation: {
    postCreate: async (_, {data: {title, content}}, context) => {
      try {
        const user = auth(context);

        const post = await Post.create({
          title,
          content,
          author: user.id,
        })

        return post
      } catch (error) {
        throw new Error('Cannot create post')
      }
    }
  }
}