/* eslint-disable camelcase */
const { ApolloError, AuthenticationError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const { Task, Workspace, User_Workspaces } = require('../../../models');

module.exports = {
  Query: {
    tasks: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const workspace = await Workspace.findOne({
          where: {
            id: workspaceId,
          },
        });

        if (!workspace) {
          throw new ApolloError('Workspace not exist');
        }

        const canViewTask = await User_Workspaces.findOne({
          where: {
            workspaceId,
            userId,
          },
        });

        if (!canViewTask && userId !== workspace.ownerId) {
          throw new AuthenticationError(
            'You are not authorized to see tasks in this workspace',
          );
        }

        const tasks = await Task.findAll({
          where: {
            workspaceId,
          },
        });

        return tasks;
      } catch (error) {
        throw new ApolloError('Cannot show tasks for this workspace');
      }
    },
  },
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
