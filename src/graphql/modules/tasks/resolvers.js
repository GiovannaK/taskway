const { ApolloError, AuthenticationError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const { Task, Workspace } = require('../../../models');

module.exports = {
  Mutation: {
    createTask: async (_, {
      title,
      workspaceId,
      link,
      maxDate,
      description,
    }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const workspace = await Workspace.findByPk(workspaceId);

        if (!workspace) {
          throw new ApolloError('Cannot found workspace');
        }

        if (userId !== workspace.ownerId) {
          throw new AuthenticationError('Unauthorized to create tasks');
        }

        const task = await Task.create({
          title,
          link,
          maxDate,
          description,
          workspaceId,
        });

        return task;
      } catch (error) {
        throw new ApolloError('Cannot create task');
      }
    },
  },
};
