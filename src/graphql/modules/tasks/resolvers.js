/* eslint-disable camelcase */
const { ApolloError, ForbiddenError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/checkPermission');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Task, Workspace, Permission } = require('../../../models');

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

        const getPermission = await Permission.findOne({
          where: {
            name: 'createTask',
          },
        });

        if (!getPermission) {
          throw new ApolloError('Cannot find permission');
        }

        const owner = await isWorkspaceOwner(workspaceId, userId);
        const userWorkspaceHasPerm = await checkPermission(userId, workspaceId, getPermission.id);

        if (!owner && !userWorkspaceHasPerm) {
          throw new ForbiddenError('Unauthorized to create task in this workspace');
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
    updateTask: async (_, {
      id,
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

        const getPermission = await Permission.findOne({
          where: {
            name: 'updateTask',
          },
        });

        if (!getPermission) {
          throw new ApolloError('Cannot find permission');
        }

        const owner = await isWorkspaceOwner(workspaceId, userId);
        const userWorkspaceHasPerm = await checkPermission(userId, workspaceId, getPermission.id);

        if (!owner && !userWorkspaceHasPerm) {
          throw new ForbiddenError('Unauthorized to update task in this workspace');
        }

        const task = await Task.findByPk(id);

        if (!task) throw new ApolloError('Cannot update task, Task not exist');

        task.title = title;
        task.link = link;
        task.maxDate = maxDate;
        task.description = description;

        await task.save();

        return task;
      } catch (error) {
        throw new ApolloError('Cannot update task');
      }
    },
  },
};
