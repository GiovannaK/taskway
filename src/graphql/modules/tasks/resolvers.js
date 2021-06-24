/* eslint-disable camelcase */
const { ApolloError, AuthenticationError, ForbiddenError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Task, Workspace } = require('../../../models');

module.exports = {
  Query: {
    tasks: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to see tasks');
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
