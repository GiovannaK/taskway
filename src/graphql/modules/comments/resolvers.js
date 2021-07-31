const { ForbiddenError, ApolloError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Comment } = require('../../../models');

module.exports = {
  Query: {
    commentsByTask: async (_, { taskId, workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to comment in this task');
        }

        const comments = await Comment.findAll({
          where: {
            taskId,
          },
          include: {
            association: 'author',
            include: {
              association: 'profile',
            },
          },
        });

        return comments;
      } catch (error) {
        throw new ApolloError('Cannot show comments for this task', { error });
      }
    },
  },
  Mutation: {
    createComment: async (_, { workspaceId, taskId, body }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to comment in this task');
        }

        const comment = await Comment.create({
          taskId,
          body,
          userId,
        });

        return comment;
      } catch (error) {
        throw new ApolloError('Cannot create a comment', { error });
      }
    },
  },
};
