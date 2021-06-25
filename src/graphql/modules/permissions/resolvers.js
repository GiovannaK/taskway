/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { ForbiddenError, ApolloError, UserInputError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { User_Permissions, Workspace } = require('../../../models');

module.exports = {
  Query: {
    userPermissionsByWorkspace: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const owner = await isWorkspaceOwner(workspaceId, userId);

        const permissions = await Workspace.findByPk(workspaceId, {
          include: {
            association: 'workspaces_permissions',
            where: {
              userId,
            },
          },
        });

        if (!permissions && !owner) {
          throw new ForbiddenError('You do not have any special permission in this workspace');
        }

        if (owner) {
          return [];
        }

        return permissions.workspaces_permissions;
      } catch (error) {
        throw new ApolloError('Cannot show logged user permissions in this workspace');
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
        console.log(error);
        throw new ApolloError('Cannot remove this permission');
      }
    },
  },
};
