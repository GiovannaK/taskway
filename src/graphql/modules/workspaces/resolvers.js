/* eslint-disable camelcase */
const { UserInputError, ForbiddenError, ApolloError } = require('apollo-server-errors');
const { Op } = require('sequelize');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const {
  User_Workspaces, Workspace, User_Permissions, Permission,
} = require('../../../models');

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
          required: true,
          include: [
            {
              association: 'owner',
              include: {
                association: 'profile',
              },
            },
            {
              association: 'users',
              include: {
                association: 'profile',
              },
            },
          ],
        });
        return workspaces;
      } catch (error) {
        throw new ApolloError('Cannot found Workspaces for this user', { error });
      }
    },
    workspaceMember: async (_, __, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const workspaces = await Workspace.findAll({
          raw: true,
          nest: true,
          where: {
            ownerId: { [Op.ne]: userId },
          },
          include: [
            {
              association: 'owner',
              include: {
                association: 'profile',
              },
            },
            {
              association: 'users',
              where: {
                id: userId,
              },
            },
          ],
        });

        return workspaces;
      } catch (error) {
        throw new ApolloError('Cannot found Workspaces for this user', { error });
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
        throw new ApolloError('Cannot find workspace', { error });
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
            include: {
              association: 'profile',
            },
          },
        });

        return workspace.users;
      } catch (error) {
        throw new ApolloError('Cannot show users for this workspace', { error });
      }
    },
  },
  Mutation: {
    createWorkspace: async (_, { title }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const [workspace, created] = await Workspace.findOrCreate({
          where: {
            ownerId: userId,
            title,
          },
        });

        if (!created) throw new UserInputError('This Workspace already exists');

        const [addedUser, isCreated] = await User_Workspaces.findOrCreate({
          where: {
            userId,
            workspaceId: workspace.id,
          },
        });

        if (!isCreated) throw new UserInputError('Cannot add current user as workspace member');

        const permissions = await Permission.findAll();

        if (!permissions) {
          throw new ApolloError('Cannot query permissions');
        }

        const ownerPermissions = [
          {
            permissionId: permissions[0].id,
            workspaceId: workspace.id,
            userId,
          },
          {
            permissionId: permissions[1].id,
            workspaceId: workspace.id,
            userId,
          },
          {
            permissionId: permissions[2].id,
            workspaceId: workspace.id,
            userId,
          },
        ];

        const addAllPermissions = await User_Permissions.bulkCreate(ownerPermissions);

        if (!addAllPermissions) {
          throw new ApolloError('Cannot add permissions to workspace owner');
        }

        return workspace;
      } catch (error) {
        throw new ApolloError('Workspace could not be created', { error });
      }
    },
    addUserToWorkspace: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const { workspaceId } = args;
        const invitedUser = args.userId;

        const owner = await isWorkspaceOwner(workspaceId, userId);

        if (!owner) {
          throw new ForbiddenError('Not authorized add users to this workspace');
        }

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
        throw new ApolloError('Cannot add User to workspace', { error });
      }
    },
    removeUserFromWorkspace: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const { workspaceId } = args;

        const invitedUser = args.userId;

        const owner = await isWorkspaceOwner(workspaceId, userId);

        if (!owner) {
          throw new ForbiddenError('Not authorized to delete users from this workspace');
        }

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
        throw new ApolloError('Cannot delete user from workspace', { error });
      }
    },
  },
};
