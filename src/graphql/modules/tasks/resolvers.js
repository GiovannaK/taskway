/* eslint-disable camelcase */
const { ApolloError, AuthenticationError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Task, Workspace } = require('../../../models');

module.exports = {
  Query: {
    tasks: async (_, { workspaceId }, context) => {
      try {
        auth(context);

        const owner = await isWorkspaceOwner(workspaceId, context);
        console.log('Owner', owner);
        const workspaceMember = await isWorkspaceMember(workspaceId, context);
        console.log('Member', workspaceMember);

        if (!owner && !workspaceMember) {
          return {};
        }

        const workspace = await Workspace.findOne({
          where: {
            id: workspaceId,
          },
        });

        if (!workspace) {
          throw new ApolloError('Workspace not exist');
        }

        /* const canViewTask = await User_Workspaces.findOne({
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
 */
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

    task: async (_, { id }, context) => {
      try {
        auth(context);

        const task = await Task.findByPk(id);

        if (!task) return null;

        return task;
      } catch (error) {
        console.log(error);
        throw new ApolloError('Cannot show task');
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
