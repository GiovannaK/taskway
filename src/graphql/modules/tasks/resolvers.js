/* eslint-disable arrow-body-style */
/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable camelcase */
const { ApolloError, ForbiddenError, UserInputError } = require('apollo-server-errors');
const { withFilter } = require('apollo-server-express');
const { v4: uuid } = require('uuid');
const auth = require('../../../middlewares/auth');
const checkPermission = require('../../../middlewares/checkPermission');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const {
  Task, Workspace, Permission,
} = require('../../../models');
const { pubsub } = require('../../../modules/pubSub');
const s3 = require('../../../modules/s3');
const { ADD_TASK } = require('./channels');

const processUpload = async (file, id, workspaceId, context) => {
  try {
    auth(context);

    const { userId } = context.req;
    const task = await Task.findByPk(id);

    if (!task) {
      throw new ApolloError('Cannot found task');
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

    if (!file) {
      throw new UserInputError('Please upload a file');
    }

    const {
      createReadStream, filename, mimetype, encoding,
    } = await file;

    const stream = await createReadStream();
    const { Location } = await s3.upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimetype,
    }).promise();

    task.file = Location;

    await task.save();

    return new Promise((resolve, reject) => {
      if (Location) {
        resolve({
          mimetype,
          filename,
          encoding,
          imageUrl: Location,
        });
      } else {
        reject({
          message: 'Upload failed',
        });
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Query: {
    tasks: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(args.workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(args.workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to see tasks');
        }

        const query = {};

        if (args.workspaceId) {
          query.workspaceId = args.workspaceId;
        }

        if (args.assignTo !== '' && args.assignTo !== null && args.assignTo !== undefined) {
          query.assignTo = args.assignTo;
        }

        if (args.progress !== '' && args.progress !== null && args.progress !== undefined) {
          query.progress = args.progress;
        }

        if (args.priority !== '' && args.priority !== null && args.priority !== undefined) {
          query.priority = args.priority;
        }

        if (args.maxDate !== '' && args.maxDate !== null && args.maxDate !== undefined) {
          query.maxDate = args.maxDate;
        }

        const tasks = await Task.findAll({
          required: true,
          where: query,
          include: {
            association: 'tasksUsers',
            include: {
              association: 'profile',
            },
          },
        });

        return tasks;
      } catch (error) {
        throw new ApolloError('Cannot show tasks for this workspace', { error });
      }
    },
    taskById: async (_, { workspaceId, id }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to see tasks');
        }

        const tasks = await Task.findOne({
          required: true,
          where: {
            id,
          },
          include: {
            association: 'tasksUsers',
            include: {
              association: 'profile',
            },
          },
        });

        return tasks;
      } catch (error) {
        throw new ApolloError('Cannot show tasks for this workspace', { error });
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
      priority,
      assignTo,
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
          priority,
          assignTo,
        });

        pubsub.publish(ADD_TASK, {
          addTask: task,
        });

        return task;
      } catch (error) {
        throw new ApolloError('Cannot create task', { error });
      }
    },
    updateTask: async (_, {
      id,
      title,
      workspaceId,
      link,
      maxDate,
      description,
      progress,
      priority,
      assignTo,
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
        task.progress = progress;
        task.priority = priority;
        task.assignTo = assignTo;

        await task.save();

        return task;
      } catch (error) {
        throw new ApolloError('Cannot update task', { error });
      }
    },
    deleteTask: async (_, { id, workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const workspace = await Workspace.findByPk(workspaceId);

        if (!workspace) {
          throw new ApolloError('Cannot found workspace');
        }

        const getPermission = await Permission.findOne({
          where: {
            name: 'deleteTask',
          },
        });

        if (!getPermission) {
          throw new ApolloError('Cannot find permission');
        }

        const owner = await isWorkspaceOwner(workspaceId, userId);
        const userWorkspaceHasPerm = await checkPermission(userId, workspaceId, getPermission.id);

        if (!owner && !userWorkspaceHasPerm) {
          throw new ForbiddenError('Unauthorized to delete task in this workspace');
        }

        const task = await Task.findByPk(id);

        if (!task) throw new ApolloError('Cannot delete task, Task not exist');

        await task.destroy();

        return !!task;
      } catch (error) {
        throw new ApolloError('Cannot delete task', { error });
      }
    },
    taskSingleUpload: async (_, args, context) => processUpload(
      args.file, args.id, args.workspaceId, context,
    ),
  },
  Subscription: {
    addTask: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ADD_TASK),
        (payload, variables) => {
          return (payload.addTask.workspaceId === variables.workspaceId);
        },
      ),
    },
  },
};
