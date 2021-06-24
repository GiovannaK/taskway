/* eslint-disable camelcase */
const { UserInputError, ForbiddenError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { User_Workspaces, Workspace } = require('../../../models');

/* eslint-disable no-unused-vars */
module.exports = {
  Query: {
    workspaces: async (_, __, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const workspaces = await Workspace.findAll({
          where: {
            ownerId: userId,
          },
        });

        return workspaces;
      } catch (error) {
        throw new Error('Cannot found Workspaces for this user', { error });
      }
    },
    workspace: async (_, { id }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(id, userId);
        const workspaceMember = await isWorkspaceMember(id, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to see workspace');
        }
        const workspace = await Workspace.findByPk(id);

        return workspace;
      } catch (error) {
        throw new Error('Cannot find workspace', { error });
      }
    },
    usersWorkspace: async (_, { id }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(id, userId);
        const workspaceMember = await isWorkspaceMember(id, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to see workspace');
        }

        const workspace = await Workspace.findByPk(id, {
          include: {
            association: 'users',
          },
        });

        return workspace.users;
      } catch (error) {
        console.log(error);
        throw new Error('Cannot show users for this workspace', { error });
      }
    },
  },
  Mutation: {
    createWorkspace: async (_, { title }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const workspace = await Workspace.create({
          ownerId: userId,
          title,
        });

        return workspace;
      } catch (error) {
        console.log(error);
        throw new Error('Workspace could not be created', { error });
      }
    },
    addUserToWorkspace: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const { workspaceId } = args;
        const invitedUser = args.userId;

        const workspace = await Workspace.findOne({
          where: {
            id: workspaceId,
            ownerId: userId,
          },
        });

        if (!workspace) {
          throw new Error('Workspace does not exist');
        }

        const [addedUser, created] = await User_Workspaces.findOrCreate({
          where: {
            userId: invitedUser,
            workspaceId: workspace.id,
          },
        });

        if (!created) {
          throw new UserInputError('User already added');
        }

        return addedUser;
      } catch (error) {
        console.log(error);
        throw new Error('Cannot add User to workspace', { error });
      }
    },
    removeUserFromWorkspace: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const { workspaceId } = args;

        const invitedUser = args.userId;

        const workspace = await Workspace.findOne({
          where: {
            id: workspaceId,
            ownerId: userId,
          },
        });

        if (!workspace) {
          throw new Error('Cannot found workspace');
        }

        const removedUser = await User_Workspaces.destroy({
          where: {
            userId: invitedUser,
            workspaceId: workspace.id,
          },
        });

        return !!removedUser;
      } catch (error) {
        console.log(error);
        throw new Error('Cannot delete user from workspace', { error });
      }
    },
  },
};
