/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { ForbiddenError, ApolloError, UserInputError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { User_Permissions, Workspace, Permission } = require('../../../models');

module.exports = {
  Query: {
    showPermissions: async (_, __, ___) => {
      try {
        const permissions = await Permission.findAll();

        if (!permissions) {
          return [];
        }

        return permissions;
      } catch (error) {
        throw new ApolloError('Cannot show any permission');
      }
    },
    userPermissionsByWorkspace: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        const permissions = await Permission.findAll({
          required: true,
          include: [
            {
              association: 'permissions_users',
              where: {
                id: userId,
              },
              include: [
                {
                  association: 'profile',
                },
                {
                  association: 'users_workspaces',
                  where: {
                    id: workspaceId,
                  },
                },
              ],
            },
          ],
        });

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('You do not have any special permission in this workspace');
        }

        if (owner) {
          return [];
        }

        return permissions;
      } catch (error) {
        throw new ApolloError('Cannot show logged user permissions in this workspace', { error });
      }
    },
    hasPermissionToAccessWorkspace: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);
        if (!owner && !workspaceMember) {
          return false;
        }
        return true;
      } catch (error) {
        throw new ApolloError('Cannot verify if current user has permission to access this workspace', { error });
      }
    },
    usersPermissionsByWorkspace: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);

        if (!owner) {
          throw new ForbiddenError('Unauthorized to show permissions in this workspace');
        }

        const permissions = await Workspace.findByPk(workspaceId, {
          include: [
            {
              association: 'workspaces_permissions',
              include: [
                {
                  association: 'user_permission',
                  include: {
                    association: 'profile',
                  },
                },
                {
                  association: 'permissions',
                },
              ],
            },
          ],
        });

        return permissions;
      } catch (error) {
        throw new ApolloError('Cannot show users permissions in this workspace', { error });
      }
    },
  },
  Mutation: {
    addUserPermission: async (_, { permissionId, userId, workspaceId }, context) => {
      try {
        auth(context);
        const loggedUser = context.req.userId;
        const owner = await isWorkspaceOwner(workspaceId, loggedUser);
        if (!owner) {
          throw new ForbiddenError('Unauthorized to add permissions in this workspace');
        }
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!workspaceMember) {
          throw new ForbiddenError('User is not part of workspace');
        }

        const [permission, created] = await User_Permissions.findOrCreate({
          where: {
            userId,
            permissionId,
            workspaceId,
          },
        });

        if (!created) throw new UserInputError('User already have this permission');

        return permission;
      } catch (error) {
        throw new ApolloError('Cannot add permission for this user');
      }
    },
    removeUserPermission: async (_, { permissionId, userId, workspaceId }, context) => {
      try {
        auth(context);
        const loggedUser = context.req.userId;
        const owner = await isWorkspaceOwner(workspaceId, loggedUser);
        if (!owner) {
          throw new ForbiddenError('Unauthorized to add permissions in this workspace');
        }
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!workspaceMember) {
          throw new ForbiddenError('User is not part of workspace');
        }

        const removedPermission = await User_Permissions.destroy({
          where: {
            userId,
            permissionId,
            workspaceId,
          },
        });

        return !!removedPermission;
      } catch (error) {
        throw new ApolloError('Cannot remove this permission');
      }
    },
  },
};
